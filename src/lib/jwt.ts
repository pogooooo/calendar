import jwt from "jsonwebtoken";

// AUTH_SECRET 미설정 시 서버 시작 차단 (런타임 보호)
const SECRET_KEY: string = process.env.AUTH_SECRET
    ?? (() => { throw new Error("AUTH_SECRET 환경변수가 설정되지 않았습니다."); })();

export interface TokenPayload {
    userId: string;
    email?: string;
    [key: string]: unknown;
}

export function generateAccessToken(payload: { userId: any; email: string | null }) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

export function generateRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch {
        return null;
    }
}
