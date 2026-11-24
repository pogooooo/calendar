"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function ChallengeWidget() {
    const title = useWidgetTitle("challenge");
    const { ready, authed } = useWidgetInit(["challenges"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="challenge" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="challenge" title={title}>
            <WidgetContent kind="challenge" />
        </WidgetShell>
    );
}
