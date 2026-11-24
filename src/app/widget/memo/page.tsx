"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function MemoWidget() {
    const title = useWidgetTitle("memo");
    const { ready, authed } = useWidgetInit(["daily"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="memo" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="memo" title={title}>
            <WidgetContent kind="memo" />
        </WidgetShell>
    );
}
