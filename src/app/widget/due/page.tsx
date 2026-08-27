"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { DuePanel } from "@/components/widget/WidgetPanels";

export default function DueWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="due" title="CRONOS  ·  마감 임박" authed={authed} />;
    }

    return (
        <WidgetShell kind="due" title="CRONOS  ·  마감 임박">
            <Wrap>
                <DuePanel />
            </Wrap>
        </WidgetShell>
    );
}

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
