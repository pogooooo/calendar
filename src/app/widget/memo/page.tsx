"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { MemoPanel } from "@/components/widget/WidgetPanels";

export default function MemoWidget() {
    const title = useWidgetTitle("memo");
    const { ready, authed } = useWidgetInit(["daily"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="memo" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="memo" title={title}>
            <Wrap>
                <MemoPanel />
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
