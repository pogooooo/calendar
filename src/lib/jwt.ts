import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.AUTH_SECRET;
if (!SECRET_KEY) {
    throw new Error("AUTH_SECRET 환경변수가 설정되지 않았습니다.");
}

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
    } catch (error) {
        return null;
    }
}
