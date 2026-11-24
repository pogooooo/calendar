"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function AnniversaryWidget() {
    const title = useWidgetTitle("anniversary");
    const { ready, authed } = useWidgetInit(["anniversaries"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="anniversary" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="anniversary" title={title}>
            <WidgetContent kind="anniversary" />
        </WidgetShell>
    );
}
