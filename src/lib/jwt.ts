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

export function generateAccessToken(payload: { userId: any; email: string | null }) {
    return sign({ userId: payload.userId, email: payload.email }, "1h");
}

export function generateRefreshToken(payload: TokenPayload) {
    return sign({ ...payload }, "7d");
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
        return payload;
    } catch {
        return null;
    }
}
