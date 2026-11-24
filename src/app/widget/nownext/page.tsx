"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function NowNextWidget() {
    const title = useWidgetTitle("nownext");
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="nownext" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="nownext" title={title}>
            <WidgetContent kind="nownext" />
        </WidgetShell>
    );
}
