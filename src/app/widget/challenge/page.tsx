"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, ChallengePanel } from "@/components/widget/WidgetPanels";

export default function ChallengeWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="challenge" title="CRONOS  ·  챌린지" authed={authed} />;
    }

    return (
        <WidgetShell kind="challenge" title="CRONOS  ·  챌린지">
            <Wrap>
                <Framed>
                    <ChallengePanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
