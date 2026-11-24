"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function QuickTaskWidget() {
    const title = useWidgetTitle("quicktask");
    const { ready, authed } = useWidgetInit(["daily"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="quicktask" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="quicktask" title={title}>
            <WidgetContent kind="quicktask" />
        </WidgetShell>
    );
}
