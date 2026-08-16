"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, StickerPanel } from "@/components/widget/WidgetPanels";

export default function StickerWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="sticker" title="CRONOS  ·  스티커 보드" authed={authed} />;
    }

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


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
