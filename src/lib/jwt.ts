import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY: string = process.env.AUTH_SECRET
    ?? (() => { throw new Error("AUTH_SECRET 환경변수가 설정되지 않았습니다."); })();

const key = new TextEncoder().encode(SECRET_KEY);

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
        .sign(key);
}

export function generateAccessToken(payload: { userId: any; email: string | null }) {
    return sign({ userId: payload.userId, email: payload.email }, "1h");
}

export function generateRefreshToken(payload: TokenPayload) {
    return sign({ ...payload }, "7d");
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        return payload;
    } catch {
        return null;
    }
}
