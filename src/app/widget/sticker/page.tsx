"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, StickerPanel } from "@/components/widget/WidgetPanels";

export default function StickerWidget() {
    const { ready, authed } = useWidgetInit([]);

    if (!ready) return <Loading>로딩 중...</Loading>;
    if (!authed) return <Loading>로그인이 필요합니다</Loading>;

    return (
        <WidgetShell kind="sticker" title="CRONOS  ·  스티커 보드">
            <Wrap>
                <Framed>
                    <StickerPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}

const Loading = styled.div`
    display: flex; align-items: center; justify-content: center;
    height: 100vh; font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    background: ${p => p.theme.colors.surface};
`;

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
