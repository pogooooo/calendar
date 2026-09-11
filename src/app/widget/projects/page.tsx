"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { ProjectsPanel } from "@/components/widget/WidgetPanels";

export default function ProjectsWidget() {
    const title = useWidgetTitle("projects");
    const { ready, authed } = useWidgetInit(["projects"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="projects" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="projects" title={title}>
            <Wrap>
                <ProjectsPanel />
            </Wrap>
        </WidgetShell>
    );
}

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
