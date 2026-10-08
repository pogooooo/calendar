import type { Locale, Translations } from "@/i18n/types";

/**
 * 로그인·가입·계정 화면에 띄울 실패 문구.
 *
 * 서버 문구는 한국어뿐이라 영어 화면에서도 "이메일 또는 비밀번호가 올바르지 않습니다." 가 떴다.
 * 영어 화면은 상태 코드로 고른다. 몸통이 JSON 이 아니면(프록시의 502 쪽지 등)
 * 예전처럼 'Unexpected token <…' 같은 날것 대신 이 문구가 나간다.
 */
export async function authFailure(
    res: Response,
    opts: { locale: Locale; t: Translations; byStatus?: Partial<Record<number, string>>; fallback: string },
): Promise<string> {
    const { locale, t, byStatus = {}, fallback } = opts;
    let server = "";
    try {
        const data = await res.json();
        if (typeof data?.message === "string") server = data.message.trim();
    } catch { /* 몸통이 JSON 이 아니다 */ }

    if (locale === "ko" && server) return server;
    const mapped = byStatus[res.status];
    if (mapped) return mapped;
    if (res.status === 429) {
        const sec = Number(res.headers.get("Retry-After"));
        return t.auth.tooManyAttempts(Number.isFinite(sec) && sec > 0 ? Math.ceil(sec) : null);
    }
    if (res.status >= 500) return t.auth.serverError;
    return fallback;
}
