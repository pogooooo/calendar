"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { NowNextPanel } from "@/components/widget/WidgetPanels";

export default function NowNextWidget() {
    const title = useWidgetTitle("nownext");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="nownext" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="nownext" title={title}>
            <Wrap>
                <NowNextPanel />
            </Wrap>
        </WidgetShell>
    );
}

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
