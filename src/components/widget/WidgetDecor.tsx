"use client";
import { GemWidgetDecor } from '@/assets/gem/GemAssets';
import { usePickTheme } from "@/styles/themed";
import type { WidgetKind } from "@/store/useWidgetStore";
import CelestialWidgetDecor from "./celestial/CelestialWidgetDecor";
import MapleWidgetDecor from "./maple/MapleWidgetDecor";
import OceanWidgetDecor from "./ocean/OceanWidgetDecor";

const VIEWS = { celestial: CelestialWidgetDecor, maple: MapleWidgetDecor, ocean: OceanWidgetDecor , gem: GemWidgetDecor };

/**
 * 위젯 판의 바탕 무늬 — 갈래마다 앱의 바탕을 닮게(사용자: "위젯도 테마랑 같은 느낌이면, 너무 평범해").
 * Celestial 은 별과 금선 두 겹 테·혼천의, Maple 은 먹 카드 테와 단풍 가지, Ocean 은 빛 그물·햇살·유리 방울.
 * 멈춘 그림이고 커서가 들어올 때만 한 번 살아난다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0).
 * 배경과 독립적인 장식 불투명도를 쓴다. 칸이 판을 가득 채우는 위젯(달력·주간)에서는 큰 그림(혼천의·가지·방울)을
 * 줄인다(busy) — 날짜 숫자 뒤에 겹쳐 읽기 어려웠다.
 */
export default function WidgetDecor({ kind, locked, intensity=1 }: { kind: WidgetKind; locked: boolean; intensity?: number }) {
    const View = usePickTheme(VIEWS);
    const busy = kind === "monthly" || kind === "weekly";
    return (
        <div data-widget-decoration aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: intensity }}>
            {/* usePickTheme selects a module component; no new component is created here. */}
            {/* eslint-disable-next-line react-hooks/static-components */}
            <View kind={kind} locked={locked} busy={busy} />
        </div>
    );
}
