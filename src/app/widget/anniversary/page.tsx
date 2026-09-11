"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { AnniversaryPanel } from "@/components/widget/WidgetPanels";

export default function AnniversaryWidget() {
    const title = useWidgetTitle("anniversary");
    const { ready, authed } = useWidgetInit(["anniversaries"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="anniversary" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="anniversary" title={title}>
            <Wrap>
                <AnniversaryPanel />
            </Wrap>
        </WidgetShell>
    );
}

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
