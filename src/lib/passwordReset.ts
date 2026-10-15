/**
 * 비밀번호 재설정 토큰
 *
 * 원본 토큰은 메일 링크로만 나가고, DB(VerificationToken)에는 SHA-256 해시만 저장한다.
 * DB 가 유출돼도 그것만으로는 계정을 탈취할 수 없다.
 *
 * Web Crypto 만 쓴다 — workerd(Cloudflare)와 Node 양쪽에서 그대로 동작한다.
 */

/** 재설정 링크 유효 시간 */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1시간

/** VerificationToken.identifier 앞에 붙여 다른 용도의 토큰과 섞이지 않게 한다. */
export const RESET_IDENTIFIER_PREFIX = "password-reset:";

export function resetIdentifier(email: string): string {
    return `${RESET_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

/** 가입 이메일 인증 토큰의 identifier 앞머리 — 같은 표를 나눠 쓴다 (src/lib/emailVerification.ts) */
export const VERIFY_IDENTIFIER_PREFIX = "email-verify:";

export function verifyIdentifier(email: string): string {
    return `${VERIFY_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 메일 링크에 실어 보낼 원본 토큰 (256비트) */
export function generateResetToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return toBase64Url(bytes);
}

/** DB 에 저장·조회할 때 쓰는 해시 */
export async function hashResetToken(token: string): Promise<string> {
    const data = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * 재설정 링크의 절대 주소.
 *
 * Host 헤더는 클라이언트가 위조할 수 있고, 그대로 링크에 쓰면 토큰이 공격자 도메인으로
 * 새어 나간다(host header injection). 그래서 APP_URL 이 있으면 그 값만 쓰고,
 * 없을 때만 요청 origin 으로 떨어진다 — 배포 환경에서는 APP_URL 을 반드시 설정할 것.
 */
export function buildResetUrl(token: string, requestUrl: string): string {
    const configured = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    const base = configured && configured.length > 0
        ? configured.replace(/\/$/, "")
        : new URL(requestUrl).origin;
    return `${base}/resetPassword?token=${encodeURIComponent(token)}`;
}
