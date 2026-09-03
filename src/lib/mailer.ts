/**
 * 메일 발송
 *
 * 세 가지 방식을 지원하고, 설정된 값을 보고 위에서부터 고른다.
 *
 * 1. SMTP 릴레이 (SMTP_USER + SMTP_PASS)
 *    구글 계정으로 보낸다. **도메인도 회사 정보도 필요 없다.** 무료 500통/일.
 *    구글 SMTP 가 직접 보내는 것이므로 SPF·DKIM 이 정확히 맞아 스팸함 위험이 가장 낮다.
 *    준비물: 구글 계정 2단계 인증 → 앱 비밀번호 발급.
 *
 * 2. BREVO_API_KEY — Brevo(https://brevo.com). 무료 300통/일. 발신 주소만 인증.
 * 3. RESEND_API_KEY — Resend(https://resend.com). 무료 100통/일. 발신 "도메인" 인증 필수.
 *
 * 공통:
 *   MAIL_FROM — 보내는 주소. SMTP 릴레이에서는 SMTP_USER 와 같은 주소여야 한다
 *               (구글이 다른 주소로 보내는 것을 막는다).
 *               예: "CRONOS <you@gmail.com>"
 *
 * 아무것도 설정하지 않으면 "콘솔 모드"로 떨어진다 — 실제로 보내지 않고 서버 로그에
 * 본문을 찍는다. 로컬 개발에서는 이 링크를 그대로 쓰면 된다.
 * 운영에서 비어 있으면 메일이 아예 안 나가므로 반드시 설정할 것.
 *
 * 주의: SMTP 릴레이는 workerd 전용이다 (cloudflare:sockets). `next dev` 는 Node 라
 * 동작하지 않으니, 로컬에서 실제 발송을 확인하려면 `npm run preview` 를 쓸 것.
 */

export interface MailMessage {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export interface MailResult {
    /** 실제로 발송됐는지. 콘솔 모드면 false */
    delivered: boolean;
    /** 발송 실패 사유 (호출 측에서 로깅용으로만 쓴다) */
    error?: string;
}

/** "CRONOS <a@b.com>" → { name: "CRONOS", email: "a@b.com" }, "a@b.com" → { email: "a@b.com" } */
function parseFrom(raw: string): { name?: string; email: string } {
    const match = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
    if (!match) return { email: raw.trim() };
    const name = match[1].replace(/^"|"$/g, "").trim();
    return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
}

async function sendViaBrevo(message: MailMessage, from: string): Promise<MailResult> {
    const sender = parseFrom(from);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY as string,
            "content-type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender,
            to: [{ email: message.to }],
            subject: message.subject,
            htmlContent: message.html,
            textContent: message.text,
        }),
    });

    // 본문에 수신자 주소가 섞여 들어갈 수 있으니 상태코드 위주로만 남긴다.
    if (!res.ok) return { delivered: false, error: `brevo responded ${res.status}` };
    return { delivered: true };
}

async function sendViaResend(message: MailMessage, from: string): Promise<MailResult> {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text,
        }),
    });

    if (!res.ok) return { delivered: false, error: `resend responded ${res.status}` };
    return { delivered: true };
}

/**
 * 인증 실패(535)를 진단할 단서. 비밀번호 값은 절대 남기지 않고,
 * 길이·공백 여부처럼 형태만 본다. 구글 앱 비밀번호는 공백 없는 16자다.
 */
function credentialShape(user: string, pass: string): string {
    const issues: string[] = [];
    if (/\s/.test(pass)) issues.push("공백 포함");
    if (pass.length !== 16) issues.push(`길이 ${pass.length} (앱 비밀번호는 16)`);
    return `user=${user} pass=[${issues.length ? issues.join(", ") : "형태 정상"}]`;
}

async function sendViaSmtpRelay(message: MailMessage, from: string): Promise<MailResult> {
    const { sendViaSmtp } = await import("@/lib/smtp");
    const user = process.env.SMTP_USER as string;
    const pass = process.env.SMTP_PASS as string;

    try {
        await sendViaSmtp(
            {
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: Number(process.env.SMTP_PORT || 465),
                user,
                pass,
            },
            {
                from,
                to: message.to,
                subject: message.subject,
                text: message.text,
                html: message.html,
            },
        );
        return { delivered: true };
    } catch (err) {
        const reason = err instanceof Error ? err.message : "unknown smtp error";
        // 535 는 아이디·비밀번호 짝이 안 맞을 때다. 어느 쪽이 문제인지 좁힐 단서를 남긴다.
        throw new Error(`${reason} | ${credentialShape(user, pass)} | from=${from}`);
    }
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
    const from = process.env.MAIL_FROM;
    const smtpReady = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    const brevoKey = process.env.BREVO_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!from || (!smtpReady && !brevoKey && !resendKey)) {
        // 로컬 개발용 폴백. 링크를 그대로 콘솔에서 집어갈 수 있게 text 본문을 찍는다.
        console.info(
            [
                "",
                "─── MAIL (콘솔 모드 — 실제로 발송되지 않음) ───",
                `To:      ${message.to}`,
                `Subject: ${message.subject}`,
                "",
                message.text,
                "──────────────────────────────────────────────",
                "",
            ].join("\n"),
        );
        return { delivered: false };
    }

    try {
        // 도메인·회사 정보가 필요 없는 SMTP 릴레이를 먼저 쓴다.
        if (smtpReady) return await sendViaSmtpRelay(message, from);
        return brevoKey
            ? await sendViaBrevo(message, from)
            : await sendViaResend(message, from);
    } catch (err) {
        return {
            delivered: false,
            error: err instanceof Error ? err.message : "unknown mail error",
        };
    }
}

/** 비밀번호 재설정 메일 본문 */
export function buildResetMail(to: string, resetUrl: string, ttlMinutes: number): MailMessage {
    const subject = "CRONOS 비밀번호 재설정";

    const text = [
        "CRONOS 비밀번호 재설정",
        "",
        "아래 주소를 열어 새 비밀번호를 설정하세요.",
        resetUrl,
        "",
        `이 링크는 ${ttlMinutes}분 뒤에 만료되며, 한 번만 사용할 수 있습니다.`,
        "본인이 요청하지 않았다면 이 메일을 무시하세요. 비밀번호는 그대로 유지됩니다.",
    ].join("\n");

    const html = `<!doctype html>
<html lang="ko">
<body style="margin:0;padding:24px;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1c1c1a;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;letter-spacing:0.04em;">CRONOS</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6b6b66;">비밀번호 재설정</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">
      아래 버튼을 눌러 새 비밀번호를 설정하세요.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;padding:12px 24px;background:#1c1c1a;color:#ffffff;
              text-decoration:none;border-radius:8px;font-size:14px;">
      비밀번호 재설정
    </a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b6b66;">
      이 링크는 ${ttlMinutes}분 뒤에 만료되며, 한 번만 사용할 수 있습니다.<br />
      본인이 요청하지 않았다면 이 메일을 무시하세요. 비밀번호는 그대로 유지됩니다.
    </p>
    <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#9b9b95;word-break:break-all;">
      버튼이 안 눌리면 이 주소를 붙여넣으세요:<br />${resetUrl}
    </p>
  </div>
</body>
</html>`;

    return { to, subject, html, text };
}
