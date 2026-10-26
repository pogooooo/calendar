"use client";

import * as GemS from "./invite/gem/GemInviteNotice.styles";
import * as React from "react";
import { X } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import useAuthStore from "@/store/useAuthStore";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import { bustFetchCache } from "@/lib/fetchOnce";

import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./invite/celestial/CelestialInviteNotice.styles";
import * as MapleS from "./invite/maple/MapleInviteNotice.styles";
import * as OceanS from "./invite/ocean/OceanInviteNotice.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

interface Invite {
    id: string;
    categoryName: string;
    inviterName: string;
}

/** 다시 물어보는 간격 — 앱을 켜 둔 채로도 새 초대를 보게 */
const POLL_MS = 10 * 60 * 1000;

/**
 * 카테고리 초대가 오면 받는 사람에게 알린다 — 수락하면 참여자가 되고(그때부터 서로의 이름·이메일이 보인다), 거절하면 사라진다.
 * 초대는 받는 사람이 수락하기 전까지 참여가 아니다(src/lib/categoryInvite.ts). 창으로 막지 않고 한쪽에 쪽지로 띄운다.
 */
export default function InviteNotice() {
    const S = usePickTheme(STYLES);
    const t = useT();
    const authFetch = useAuthFetch();
    const userId = useAuthStore((s) => s.user?.id);
    const [invites, setInvites] = React.useState<Invite[]>([]);
    const [hidden, setHidden] = React.useState(false);
    const [busy, setBusy] = React.useState(false);

    const load = React.useCallback(async () => {
        try {
            const res = await authFetch("/api/category/invite");
            if (!res.ok) return;
            const list = await res.json() as Invite[];
            setInvites(Array.isArray(list) ? list : []);
        } catch { /* 다음에 다시 */ }
    }, [authFetch]);

    React.useEffect(() => {
        if (!userId) { setInvites([]); return; }
        void load();
        const timer = window.setInterval(() => { void load(); }, POLL_MS);
        const onFocus = () => { void load(); };
        window.addEventListener("focus", onFocus);
        return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
    }, [userId, load]);

    const answer = async (invite: Invite, action: "accept" | "decline") => {
        setBusy(true);
        try {
            const res = await authFetch("/api/category/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: invite.id, action }),
            });
            setInvites((list) => list.filter((i) => i.id !== invite.id));
            if (res.ok && action === "accept") {
                // 새 카테고리와 그 할 일이 바로 보이게
                bustFetchCache("category");
                bustFetchCache("todo");
                await Promise.all([
                    useCategoryStore.getState().fetchCategories(authFetch),
                    useTodoStore.getState().fetchTodos(authFetch),
                ]);
            }
        } catch { /* 다음 물음에 다시 뜬다 */ } finally {
            setBusy(false);
        }
    };

    const invite = invites[0];
    if (!invite || hidden) return null;

    return (
        <S.Panel role="status" aria-live="polite">
            <S.Corner />
            <S.Head>
                <S.Label>{t.category.inviteInboxTitle}{invites.length > 1 ? ` · ${invites.length}` : ""}</S.Label>
                <S.CloseBtn onClick={() => setHidden(true)} aria-label={t.widgetShell.close}>
                    <X size={13} />
                </S.CloseBtn>
            </S.Head>
            <S.Version>{t.category.inviteInboxMessage(invite.inviterName, invite.categoryName)}</S.Version>
            <S.Desc>{t.category.inviteInboxHint}</S.Desc>
            <S.Row>
                <S.GhostBtn disabled={busy} onClick={() => answer(invite, "decline")}>{t.category.inviteDecline}</S.GhostBtn>
                <S.PrimaryBtn disabled={busy} onClick={() => answer(invite, "accept")}>{t.category.inviteAccept}</S.PrimaryBtn>
            </S.Row>
        </S.Panel>
    );
}
