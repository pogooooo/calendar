"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function DueWidget() {
    const title = useWidgetTitle("due");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="due" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="due" title={title}>
            <WidgetContent kind="due" />
        </WidgetShell>
    );
}
