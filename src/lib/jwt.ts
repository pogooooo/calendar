import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.AUTH_SECRET || "";

export function generateAccessToken(payload: any) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

export function generateRefreshToken(payload: any) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}
