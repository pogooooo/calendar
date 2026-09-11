"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { QuickTaskPanel } from "@/components/widget/WidgetPanels";

export default function QuickTaskWidget() {
    const title = useWidgetTitle("quicktask");
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="quicktask" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="quicktask" title={title}>
            <Wrap>
                <QuickTaskPanel />
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
