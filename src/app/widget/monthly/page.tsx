"use client";

import WidgetContent from "@/components/widget/WidgetContent";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";

export default function MonthlyWidget() {
    const title = useWidgetTitle("monthly");
    const { authed, authChecked } = useWidgetInit();

    // 인증만 확인되면 즉시 그리드를 그리고 데이터는 도착하는 대로 채운다
    if (!authChecked || !authed) {
        return <WidgetAuthNotice kind="monthly" title={title} authed={authChecked && authed} />;
    }

    return (
        <WidgetShell kind="monthly" title={title}>
            <WidgetContent kind="monthly" />
        </WidgetShell>
    );
}
