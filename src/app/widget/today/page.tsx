"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, TodayPanel } from "@/components/widget/WidgetPanels";

export default function TodayWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="today" title="CRONOS  ·  오늘 할 일" authed={authed} />;
    }

    return (
        <WidgetShell kind="today" title="CRONOS  ·  오늘 할 일">
            <Wrap>
                <Framed>
                    <TodayPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
