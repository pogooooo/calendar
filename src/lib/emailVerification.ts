/**
 * 가입 이메일 인증.
 *
 * 예전엔 이메일 주소를 확인하지 않고 바로 쓸 수 있는 계정을 만들었다. 그래서 남의 주소로 먼저 가입해 두면,
 * 진짜 주인이 나중에 구글로 로그인했을 때 그 계정(먼저 가입한 사람이 비밀번호를 아는)으로 들어갔고,
 * 이메일로 보내는 카테고리 초대도 그 주소를 먼저 차지한 사람에게 갔다(개인정보보호법 제29조 — 안전성 확보조치).
 * 이제 비밀번호로 가입한 계정은 메일의 링크를 눌러야 로그인할 수 있다.
 *
 * 링크 토큰은 재설정 토큰과 같은 방식 — 원본은 메일로만 나가고 DB(VerificationToken)에는 SHA-256 해시만.
 * 인증하지 않은 가입은 7일 뒤 지운다(필요 없어진 개인정보는 지체 없이 파기 — 제21조). 그 주소의 진짜 주인이
 * 가입하려 하면 기다리지 않아도 된다 — 인증 안 된 계정은 로그인할 수 없으므로 새로 적은 것으로 덮어쓴다(가입 라우트).
 */
import prisma from "@/lib/prisma";
import { VERIFY_IDENTIFIER_PREFIX, generateResetToken, hashResetToken, verifyIdentifier } from "@/lib/passwordReset";
import { userIdByEmail } from "@/lib/userEmail";
import { deleteUserData } from "@/lib/deleteUser";

/** 인증 링크 유효 시간 */
export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
/** 인증하지 않은 가입을 남겨 두는 기간 (마지막 인증 메일을 보낸 때부터) */
export const UNVERIFIED_KEEP_MS = 7 * 24 * 60 * 60 * 1000;

export { VERIFY_IDENTIFIER_PREFIX, verifyIdentifier };

/**
 * 인증 링크의 절대 주소 — 재설정 링크와 같은 까닭으로 APP_URL 이 있으면 그 값만 쓴다(Host 헤더 위조 방지).
 */
export function buildVerifyUrl(token: string, requestUrl: string): string {
    const configured = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    const base = configured && configured.length > 0
        ? configured.replace(/\/$/, "")
        : new URL(requestUrl).origin;
    return `${base}/verifyEmail?token=${encodeURIComponent(token)}`;
}

/** 새 인증 링크를 만든다 — 같은 주소의 이전 링크는 무효(늘 마지막 하나만 산다). 메일로 보낼 원본 토큰을 돌려준다 */
export async function issueVerification(email: string): Promise<string> {
    const identifier = verifyIdentifier(email);
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    const token = generateResetToken();
    await prisma.verificationToken.create({
        data: { identifier, token: await hashResetToken(token), expires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS) },
    });
    return token;
}

/**
 * 오래 인증하지 않은 가입을 지운다 — 가입·인증 요청이 올 때 덤으로(따로 도는 일정이 없다).
 * 마지막 인증 링크가 끝난 지 (7일 − 하루) 지났는데 아직 인증 안 된 계정만. 한 번에 몇 개씩만.
 */
export async function purgeStaleUnverified(): Promise<void> {
    try {
        const cutoff = new Date(Date.now() - (UNVERIFIED_KEEP_MS - VERIFY_TOKEN_TTL_MS));
        const stale = await prisma.verificationToken.findMany({
            where: { identifier: { startsWith: VERIFY_IDENTIFIER_PREFIX }, expires: { lt: cutoff } },
            select: { identifier: true },
            take: 20,
        });
        for (const { identifier } of stale) {
            const email = identifier.slice(VERIFY_IDENTIFIER_PREFIX.length);
            const userId = await userIdByEmail(email);
            const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, emailVerified: true } }) : null;
            if (user && !user.emailVerified) await deleteUserData(user.id, user.email);
            await prisma.verificationToken.deleteMany({ where: { identifier } });
        }
    } catch (error) {
        // 치우기는 덤이다 — 실패해도 가입·인증은 그대로 간다
        console.error("[emailVerification] 오래된 미인증 가입 치우기 실패", error);
    }
}
