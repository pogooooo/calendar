"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { DuePanel } from "@/components/widget/WidgetPanels";

export default function DueWidget() {
    const title = useWidgetTitle("due");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="due" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="due" title={title}>
            <Wrap>
                <DuePanel />
            </Wrap>
        </WidgetShell>
    );
}

const Wrap = styled.div`
    height: 100%;
`;
