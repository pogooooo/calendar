/**
 * 카테고리 초대 — 이메일로 걸고, 그 주소로 가입·인증한 사람이 수락해야 참여자가 된다.
 *
 * 예전엔 초대하면 바로 참여자로 넣었다. 그래서 (1) 받는 사람이 원하지 않아도 남의 카테고리가 달력에 들어왔고
 * (2) 그 사람의 이름·이메일·사진이 다른 참여자에게 곧바로 보였으며 (3) 가입한 주소인지(200/404)로 가입 여부를 캘 수 있었다.
 * 이제 초대는 수락 전까지 이메일 한 줄로만 남는다 — 가입하지 않은 주소에도 똑같이 걸어서 가입 여부가 드러나지 않고,
 * 초대한 사람(카테고리를 만든 이)만 그 줄을 본다. 30일이 지나면 지운다(개인정보보호법 제21조 — 필요 없어지면 파기).
 */
import prisma from "@/lib/prisma";

/** 수락을 기다리는 기간 */
export const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** 끝난 초대를 치운다 — 초대를 읽거나 걸 때 덤으로 */
export async function purgeExpiredInvites(): Promise<void> {
    try {
        await prisma.categoryInvite.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    } catch (error) {
        console.error("[categoryInvite] 끝난 초대 치우기 실패", error);
    }
}

/** 초대한 사람에게만 보여 줄 수락 전 초대 (카테고리 목록에 붙인다) */
export interface PendingInvite {
    id: string;
    email: string;
    expiresAt: Date;
}
