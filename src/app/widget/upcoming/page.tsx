"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, UpcomingPanel } from "@/components/widget/WidgetPanels";

export default function UpcomingWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="upcoming" title="CRONOS  ·  다가오는 일정" authed={authed} />;
    }

    return (
        <WidgetShell kind="upcoming" title="CRONOS  ·  다가오는 일정">
            <Wrap>
                <Framed>
                    <UpcomingPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
