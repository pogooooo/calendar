"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { TodayPanel } from "@/components/widget/WidgetPanels";

export default function TodayWidget() {
    const title = useWidgetTitle("today");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="today" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="today" title={title}>
            <Wrap>
                <TodayPanel />
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
