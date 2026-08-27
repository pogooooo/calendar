"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { MemoPanel } from "@/components/widget/WidgetPanels";

export default function MemoWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="memo" title="CRONOS  ·  일일 메모" authed={authed} />;
    }

    return (
        <WidgetShell kind="memo" title="CRONOS  ·  일일 메모">
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
