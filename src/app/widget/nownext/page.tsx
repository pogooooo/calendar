"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { NowNextPanel } from "@/components/widget/WidgetPanels";

export default function NowNextWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="nownext" title="CRONOS  ·  지금 · 다음" authed={authed} />;
    }

    return (
        <WidgetShell kind="nownext" title="CRONOS  ·  지금 · 다음">
            <Wrap>
                <NowNextPanel />
            </Wrap>
        </WidgetShell>
    );
}

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
