"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, ProjectTimelinePanel } from "@/components/widget/WidgetPanels";

export default function ProjectTimelineWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="projecttimeline" title="CRONOS  ·  프로젝트 타임라인" authed={authed} />;
    }

    return (
        <WidgetShell kind="projecttimeline" title="CRONOS  ·  프로젝트 타임라인">
            <Wrap>
                <Framed>
                    <ProjectTimelinePanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
