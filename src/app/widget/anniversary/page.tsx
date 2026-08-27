"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { AnniversaryPanel } from "@/components/widget/WidgetPanels";

export default function AnniversaryWidget() {
    const { ready, authed } = useWidgetInit(["anniversaries"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="anniversary" title="CRONOS  ·  다가오는 기념일" authed={authed} />;
    }

    return (
        <WidgetShell kind="anniversary" title="CRONOS  ·  다가오는 기념일">
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
