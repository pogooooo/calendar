/**
 * 최소 SMTP 클라이언트
 *
 * 왜 직접 짰나: nodemailer 는 workerd 에서 동작하지 않는다. 그리고 Workers 는 아웃바운드
 * **25번 포트가 막혀 있어서** 자체 메일 서버로 직접 배달하는 건 불가능하다. 이 파일은
 * "남의 SMTP 서버(구글 등)에 로그인해서 대신 보내달라고 하는" 릴레이만 한다.
 *
 * node:tls 를 쓴다. workerd 전용인 cloudflare:sockets 는 webpack 이 "cloudflare:" 스킴을
 * 처리하지 못해 빌드가 깨지는데, node: 스킴은 번들러가 기본으로 외부 모듈 취급한다.
 * 런타임에서는 wrangler.jsonc 의 nodejs_compat 플래그가 실제 구현을 제공한다.
 *
 * 465(암시적 TLS)를 기본으로 쓴다 — 첫 바이트부터 TLS 라 STARTTLS 승격이 필요 없다.
 * workerd 의 node:tls 는 부분 지원이라 STARTTLS 경로는 피하는 편이 안전하다.
 *
 * 제목·본문은 전부 base64 로 실어 보낸다. 한글 인코딩, 줄 길이, dot-stuffing 문제를
 * 한 번에 피할 수 있다.
 */
import { connect as tlsConnect, type TLSSocket } from "node:tls";

export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
}

export interface SmtpMessage {
    /** "CRONOS <you@gmail.com>" 또는 "you@gmail.com" */
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}

const CRLF = "\r\n";
/** 한 번의 SMTP 대화가 이 시간을 넘기면 끊는다. */
const TIMEOUT_MS = 15_000;

/** UTF-8 문자열을 base64 로. btoa 는 바이트만 받으므로 한 번 인코딩해서 넘긴다. */
function b64(input: string): string {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

/** base64 본문은 76자로 접어야 한다 (RFC 2045). */
function wrap76(input: string): string {
    return (input.match(/.{1,76}/g) ?? []).join(CRLF);
}

/** 비ASCII 헤더는 그대로 못 넣는다 (RFC 2047). */
function encodeHeader(value: string): string {
     
    return /^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${b64(value)}?=`;
}

/** "CRONOS <a@b.com>" → { name: "CRONOS", email: "a@b.com" } */
function parseAddress(raw: string): { name?: string; email: string } {
    const match = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
    if (!match) return { email: raw.trim() };
    const name = match[1].replace(/^"|"$/g, "").trim();
    return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
}

function formatAddress(addr: { name?: string; email: string }): string {
    return addr.name ? `${encodeHeader(addr.name)} <${addr.email}>` : addr.email;
}

/**
 * 소켓 하나에 붙어 SMTP 응답을 한 덩어리씩 읽는다.
 * 응답은 여러 줄일 수 있고 마지막 줄만 "코드<공백>" 형태다 (중간 줄은 "코드-").
 */
class SmtpSession {
    private buffer = "";
    private pending: {
        resolve: (value: string) => void;
        reject: (reason: Error) => void;
    } | null = null;
    private failure: Error | null = null;

    constructor(private readonly socket: TLSSocket) {
        socket.setEncoding("utf8");
        socket.on("data", (chunk: string) => {
            this.buffer += chunk;
            this.deliver();
        });
        socket.on("error", (err: Error) => this.fail(err));
        socket.on("close", () => this.fail(new Error("SMTP 연결이 닫혔습니다.")));
    }

    private fail(err: Error) {
        this.failure = err;
        this.pending?.reject(err);
        this.pending = null;
    }

    /** 완결된 응답이 버퍼에 있으면 잘라 낸다. */
    private take(): string | null {
        const lines = this.buffer.split(CRLF);
        // 마지막 원소는 아직 끝나지 않은 조각이라 제외한다.
        for (let i = 0; i < lines.length - 1; i += 1) {
            if (/^\d{3} /.test(lines[i])) {
                const response = lines.slice(0, i + 1).join(CRLF);
                this.buffer = lines.slice(i + 1).join(CRLF);
                return response;
            }
        }
        return null;
    }

    private deliver() {
        if (!this.pending) return;
        const response = this.take();
        if (response === null) return;
        const { resolve } = this.pending;
        this.pending = null;
        resolve(response);
    }

    read(): Promise<string> {
        if (this.failure) return Promise.reject(this.failure);

        // 이미 도착해 있을 수 있다.
        const ready = this.take();
        if (ready !== null) return Promise.resolve(ready);

        return new Promise<string>((resolve, reject) => {
            this.pending = { resolve, reject };
        });
    }

    write(line: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.write(line + CRLF, (err) => (err ? reject(err) : resolve()));
        });
    }

    /** 명령을 보내고 응답 코드가 기대값인지 확인한다. */
    async command(line: string, expect: number, label: string): Promise<string> {
        await this.write(line);
        const response = await this.read();
        const code = Number(response.slice(0, 3));
        if (code !== expect) {
            // 응답에 계정 주소가 섞일 수 있어 앞부분만 남긴다.
            throw new Error(`${label} 실패 (${code}): ${response.split(CRLF)[0].slice(0, 120)}`);
        }
        return response;
    }
}

function buildMime(message: SmtpMessage): string {
    const from = parseAddress(message.from);
    const boundary = `----cronos-${crypto.randomUUID()}`;
    const domain = from.email.split("@")[1] ?? "localhost";

    const headers = [
        `From: ${formatAddress(from)}`,
        `To: ${message.to}`,
        `Subject: ${encodeHeader(message.subject)}`,
        `Message-ID: <${crypto.randomUUID()}@${domain}>`,
        `Date: ${new Date().toUTCString().replace(/GMT$/, "+0000")}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ].join(CRLF);

    const body = [
        // 빈 문자열 두 개 = CRLF CRLF. 헤더와 본문은 반드시 "빈 줄" 하나로 갈라야 한다
        // (RFC 5322 §2.1). 하나만 넣으면 첫 경계선이 헤더의 연장으로 파싱돼
        // 메일 서버는 250 으로 받아놓고도 메시지를 버린다.
        "",
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "",
        wrap76(b64(message.text)),
        `--${boundary}`,
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "",
        wrap76(b64(message.html)),
        `--${boundary}--`,
    ].join(CRLF);

    // base64 본문이라 "." 로 시작하는 줄은 사실상 없지만, DATA 종료 표시와 부딪히지
    // 않도록 방어적으로 dot-stuffing 한다 (RFC 5321 4.5.2).
    return (headers + body).replace(/\r\n\./g, "\r\n..");
}

function openSocket(config: SmtpConfig): Promise<TLSSocket> {
    return new Promise((resolve, reject) => {
        const socket = tlsConnect(
            { host: config.host, port: config.port, servername: config.host },
            () => resolve(socket),
        );
        socket.setTimeout(TIMEOUT_MS, () =>
            socket.destroy(new Error(`SMTP 응답 시간 초과 (${TIMEOUT_MS}ms)`)));
        socket.once("error", reject);
    });
}

export async function sendViaSmtp(config: SmtpConfig, message: SmtpMessage): Promise<void> {
    const socket = await openSocket(config);
    const session = new SmtpSession(socket);

    try {
        const greeting = await session.read();
        if (!greeting.startsWith("220")) {
            throw new Error(`서버 인사말이 올바르지 않습니다: ${greeting.slice(0, 120)}`);
        }

        await session.command("EHLO cronos", 250, "EHLO");

        await session.command("AUTH LOGIN", 334, "AUTH LOGIN");
        await session.command(b64(config.user), 334, "사용자 인증");
        await session.command(b64(config.pass), 235, "비밀번호 인증");

        const from = parseAddress(message.from);
        await session.command(`MAIL FROM:<${from.email}>`, 250, "MAIL FROM");
        await session.command(`RCPT TO:<${message.to}>`, 250, "RCPT TO");
        await session.command("DATA", 354, "DATA");

        await session.write(buildMime(message));
        await session.command(".", 250, "본문 전송");

        // QUIT 응답(221)을 못 받아도 전송은 이미 끝난 상태라 실패로 치지 않는다.
        await session.write("QUIT");
    } finally {
        socket.destroy();
    }
}
