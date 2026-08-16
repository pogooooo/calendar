"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, ProjectBoardPanel } from "@/components/widget/WidgetPanels";

export default function ProjectBoardWidget() {
    const { ready, authed } = useWidgetInit([]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="projectboard" title="CRONOS  ·  프로젝트 보드" authed={authed} />;
    }

    return (
        <WidgetShell kind="projectboard" title="CRONOS  ·  프로젝트 보드">
            <Wrap>
                <Framed>
                    <ProjectBoardPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
