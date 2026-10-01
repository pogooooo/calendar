import { SignJWT, jwtVerify } from "jose";

/**
 * 모듈 최상위에서 읽으면 빌드 타임에 평가돼 자리표시자 값이 산출물에 박힌다.
 * 요청 시점에 읽어야 시크릿 누락이 조용히 넘어가지 않고 즉시 실패한다.
 */
function getKey(): Uint8Array {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret === "build-time-placeholder") {
        throw new Error("AUTH_SECRET 환경변수가 설정되지 않았습니다.");
    }
    return new TextEncoder().encode(secret);
}

export interface TokenPayload {
    userId: string;
    email?: string;
    [key: string]: unknown;
}

async function sign(payload: Record<string, unknown>, expiresIn: string) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getKey());
}

export function generateAccessToken(payload: { userId: string; email: string | null }) {
    return sign({ userId: payload.userId, email: payload.email }, "1h");
}

/**
 * 리프레시 토큰에는 난수 jti 를 넣는다.
 *
 * 넣지 않으면 payload 와 iat(초 단위)가 같은 두 번의 로그인이 글자까지 똑같은
 * 토큰을 만든다. RefreshToken.Token 이 @unique 라 같은 초에 두 번 로그인하면
 * P2002 로 터져 500 이 나갔다. 로그인 단추를 두 번 누르거나 탭 두 개에서
 * 동시에 들어오면 실제로 걸린다.
 */
export function generateRefreshToken(payload: TokenPayload, remember = true) {
    const jti = crypto.randomUUID();
    // remember 를 토큰 자체에 새긴다. 갱신 때 DB 를 안 바꾸고도 같은 수명으로 돌릴 수 있다.
    return sign({ ...payload, jti, remember }, `${refreshLifetimeDays(remember)}d`);
}

/**
 * "로그인 유지" 를 켜면 30일, 끄면 하루.
 *
 * 끈 쪽은 어차피 클라이언트가 창(앱)을 닫을 때 토큰을 버리므로 수명이 짧아도 불편이 없고,
 * 흘러나간 토큰이 오래 살지 않는다.
 *
 * 30일은 "로그인한 날부터" 가 아니라 "마지막으로 쓴 날부터" 다 — refresh 라우트가 갱신할 때마다
 * 새 토큰을 새 수명으로 내주고 쿠키의 Max-Age 도 다시 30일로 놓으므로, 30일 안에 한 번이라도 앱을 열면
 * 그날부터 다시 30일이다. 30일 내내 안 열면 그때 만료돼 다시 로그인한다.
 */
export function refreshLifetimeDays(remember: boolean): number {
    return remember ? 30 : 1;
}

export function refreshExpiresAt(remember: boolean): Date {
    return new Date(Date.now() + refreshLifetimeDays(remember) * 24 * 60 * 60 * 1000);
}

/** 리프레시 쿠키 옵션. 유지면 토큰 수명만큼, 아니면 세션 쿠키(브라우저를 닫으면 사라진다). */
export function refreshCookie(token: string, remember: boolean) {
    return {
        name: "refreshToken",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
        ...(remember ? { maxAge: refreshLifetimeDays(true) * 24 * 60 * 60 } : {}),
    };
}

/** 요청 본문의 remember. 없으면(옛 클라이언트) 유지로 본다 — 지금까지의 동작이 그랬다. */
export function rememberFrom(body: unknown): boolean {
    const v = (body as { remember?: unknown } | null)?.remember;
    return typeof v === "boolean" ? v : true;
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
        // 쓰임이 정해진 열쇠(홈 위젯용)는 일반 API 에 못 쓴다 — 흘러나가도 할 일 넣기밖에 못 하게
        if (payload.scope !== undefined) return null;
        return payload;
    } catch {
        return null;
    }
}

/**
 * 홈 위젯 전용 열쇠 — 할 일 넣기(/api/widget/todo) 하나만 된다.
 *
 * 위젯은 앱을 열지 않고 서버에 써야 하는데, 앱의 리프레시 토큰은 쓸 때마다 바뀌므로(회전) 위젯이 그걸
 * 쓰면 앱 쪽 토큰이 무효가 돼 로그아웃된다. 그래서 따로 준다. 수명은 리프레시 토큰과 같은 30일이고,
 * 앱이 열릴 때마다 새로 받는다. 쓸 때는 그 사용자가 아직 어딘가에 로그인돼 있는지도 본다(라우트).
 */
export function generateWidgetToken(userId: string) {
    return sign({ userId, scope: "widget" }, "30d");
}

export async function verifyWidgetToken(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
        return payload.scope === "widget" && typeof payload.userId === "string" ? payload.userId : null;
    } catch {
        return null;
    }
}
