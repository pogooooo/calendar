"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { StatsPanel } from "@/components/widget/WidgetPanels";

export default function StatsWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="stats" title="CRONOS  ·  이번 주 통계" authed={authed} />;
    }

    return (
        <WidgetShell kind="stats" title="CRONOS  ·  이번 주 통계">
            <Wrap>
                <StatsPanel />
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
