/**
 * 계정 하나와 그 사람이 적은 것을 모두 지운다 — 회원 탈퇴(/api/user DELETE)와, 7일 넘게 인증하지 않은 가입을 치울 때
 * (src/lib/emailVerification.ts) 같은 길을 쓴다.
 *
 * Category→Todo, User→Anniversary, User→UserSettings 는 cascade 가 걸려 있지 않다.
 * 이것들을 먼저 지우지 않으면 외래키 제약 때문에 지우기가 항상 실패한다.
 */
import prisma from "@/lib/prisma";
import { resetIdentifier, verifyIdentifier } from "@/lib/passwordReset";
import { normalizeEmail } from "@/lib/userEmail";

export async function deleteUserData(userId: string, email: string | null): Promise<void> {
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: {
                assignedProjects: { set: [] },
                assignedTasks:    { set: [] },
                participatingCategories: { set: [] },
            },
        }),
        prisma.todoCompletion.deleteMany({
            where: { todo: { category: { creatorId: userId } } },
        }),
        prisma.todo.deleteMany({ where: { category: { creatorId: userId } } }),
        // Project/Challenge·초대 및 그 하위는 Category 삭제 시 cascade 로 함께 지워진다
        prisma.category.deleteMany({ where: { creatorId: userId } }),
        prisma.anniversary.deleteMany({ where: { userId } }),
        prisma.userSettings.deleteMany({ where: { userId } }),
        prisma.dailyTask.deleteMany({ where: { userId } }),
        prisma.dailyMemo.deleteMany({ where: { userId } }),
        prisma.refreshToken.deleteMany({ where: { userId } }),
        ...(email ? [
            // 아직 안 쓴 비밀번호 재설정·인증 링크 — 같은 주소로 다시 가입한 새 계정에 쓰이지 않게
            prisma.verificationToken.deleteMany({ where: { identifier: { in: [resetIdentifier(email), verifyIdentifier(email)] } } }),
            // 이 주소로 온 수락 전 초대 — 받는 사람이 떠났으니 남겨 둘 까닭이 없다
            prisma.categoryInvite.deleteMany({ where: { email: normalizeEmail(email) } }),
        ] : []),
        prisma.user.delete({ where: { id: userId } }),
    ]);
}
