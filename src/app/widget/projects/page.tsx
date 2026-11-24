"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function ProjectsWidget() {
    const title = useWidgetTitle("projects");
    const { ready, authed } = useWidgetInit(["projects"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="projects" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="projects" title={title}>
            <WidgetContent kind="projects" />
        </WidgetShell>
    );
}
