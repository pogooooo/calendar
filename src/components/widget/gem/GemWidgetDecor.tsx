"use client";

import type { WidgetKind } from "@/lib/widgetKinds";
import { Setting } from "./GemWidgetDecor.styles";

export default function GemWidgetDecor({ busy, locked }: { kind: WidgetKind; busy: boolean; locked: boolean }) {
    return <Setting data-gem-widget-setting data-busy={busy} data-locked={locked}><i /></Setting>;
}
