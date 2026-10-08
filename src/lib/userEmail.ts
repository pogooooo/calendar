import prisma from "@/lib/prisma";

/**
 * 이메일은 대소문자를 가리지 않는다.
 *
 * 예전에는 친 그대로 저장하고 그대로 찾았다. 폰 자판은 첫 글자를 대문자로 바꾸므로 "Abc@naver.com" 으로 가입한 사람은
 * 로그인할 때도 똑같이 쳐야 했고, 비밀번호 찾기는 소문자로 찾아서 메일이 아예 안 갔다. 같은 주소로 대소문자만 달리
 * 계정을 하나 더 만들 수도 있었고, 구글 로그인(소문자)은 그 계정을 못 찾아 새 계정을 만들었다.
 * 새 계정은 소문자로 저장하고, 찾을 때는 예전에 대문자가 섞여 저장된 계정도 찾는다.
 */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * 대문자가 섞여 저장된 예전 계정 — SQLite 의 NOCASE 비교(이메일은 ASCII 만 받는다).
 * 이 질의가 어떤 까닭으로든 실패하면 못 찾은 것으로 본다 — 그래도 예전(글자 그대로 찾기)보다 나쁘지 않고,
 * 가입·로그인이 500 으로 막히지 않는다.
 */
async function idsIgnoringCase(lower: string): Promise<string[]> {
    try {
        const rows = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "User" WHERE email = ${lower} COLLATE NOCASE LIMIT 2`;
        return rows.map((r) => r.id);
    } catch (error) {
        console.error("[userEmail] 대소문자 무시 찾기 실패", error);
        return [];
    }
}

/** 그 이메일의 계정 id. 대소문자만 다른 계정이 둘 이상이면 어느 것인지 알 수 없으므로 null */
export async function userIdByEmail(email: string): Promise<string | null> {
    const raw = email.trim();
    const lower = raw.toLowerCase();
    // 대부분은 여기서 끝난다 (유일 색인을 탄다)
    for (const candidate of raw === lower ? [raw] : [raw, lower]) {
        const hit = await prisma.user.findUnique({ where: { email: candidate }, select: { id: true } });
        if (hit) return hit.id;
    }
    const ids = await idsIgnoringCase(lower);
    return ids.length === 1 ? ids[0] : null;
}

/** 대소문자만 다른 계정까지 쳐서 이미 쓰이는 주소인가 (가입) */
export async function emailInUse(email: string): Promise<boolean> {
    const lower = normalizeEmail(email);
    if (await prisma.user.findUnique({ where: { email: lower }, select: { id: true } })) return true;
    return (await idsIgnoringCase(lower)).length > 0;
}
