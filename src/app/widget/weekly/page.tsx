"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function WeeklyWidget() {
    const title = useWidgetTitle("weekly");
    const { ready, authed } = useWidgetInit();
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="weekly" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="weekly" title={title}>
            <WidgetContent kind="weekly" />
        </WidgetShell>
    );
}
