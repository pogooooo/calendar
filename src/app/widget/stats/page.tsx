"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function StatsWidget() {
    const title = useWidgetTitle("stats");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="stats" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="stats" title={title}>
            <WidgetContent kind="stats" />
        </WidgetShell>
    );
}
