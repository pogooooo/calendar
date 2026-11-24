"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function TodayWidget() {
    const title = useWidgetTitle("today");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="today" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="today" title={title}>
            <WidgetContent kind="today" />
        </WidgetShell>
    );
}
