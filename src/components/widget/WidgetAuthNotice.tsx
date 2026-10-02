"use client";

import WidgetShell from "@/components/widget/WidgetShell";
import type { WidgetKind } from "@/store/useWidgetStore";
import { useT } from "@/i18n/useT";

import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialWidgetAuthNotice.styles";
import * as MapleS from "./maple/MapleWidgetAuthNotice.styles";
import * as OceanS from './ocean/OceanWidgetAuthNotice.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

/**
 * 인증 전/실패 상태에서도 셸(제목줄·닫기 버튼)을 그린다.
 * 맨몸 텍스트만 띄우면 사용자가 그 위젯을 끌 방법이 없다.
 */
export default function WidgetAuthNotice({
    kind,
    title,
    authed,
}: {
    kind: WidgetKind;
    title: string;
    authed: boolean;
}) {
    const S = usePickTheme(STYLES);
    const t = useT();
    return (
        <WidgetShell kind={kind} title={title}>
            <S.Center>
                {authed ? t.widget.loading : t.widget.waiting}
                {!authed && <S.Sub>{t.widget.waitingSub}</S.Sub>}
            </S.Center>
        </WidgetShell>
    );
}
