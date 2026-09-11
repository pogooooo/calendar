"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { StatsPanel } from "@/components/widget/WidgetPanels";

export default function StatsWidget() {
    const title = useWidgetTitle("stats");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="stats" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="stats" title={title}>
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
