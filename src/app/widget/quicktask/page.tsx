"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, QuickTaskPanel } from "@/components/widget/WidgetPanels";

export default function QuickTaskWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="quicktask" title="CRONOS  ·  임시 작업" authed={authed} />;
    }

    return (
        <WidgetShell kind="quicktask" title="CRONOS  ·  임시 작업">
            <Wrap>
                <Framed>
                    <QuickTaskPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
