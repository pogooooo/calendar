"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { ChallengePanel } from "@/components/widget/WidgetPanels";

export default function ChallengeWidget() {
    const title = useWidgetTitle("challenge");
    const { ready, authed } = useWidgetInit(["challenges"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="challenge" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="challenge" title={title}>
            <Wrap>
                <ChallengePanel />
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
`;
