"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, ProjectDetailPanel } from "@/components/widget/WidgetPanels";

export default function ProjectDetailWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="projectdetail" title="CRONOS  ·  프로젝트 상세" authed={authed} />;
    }

    return (
        <WidgetShell kind="projectdetail" title="CRONOS  ·  프로젝트 상세">
            <Wrap>
                <Framed>
                    <ProjectDetailPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
