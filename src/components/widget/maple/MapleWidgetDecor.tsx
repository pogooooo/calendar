"use client";
/**
 * Maple 위젯의 바탕 무늬 — 앱의 도감을 닮게: 먹으로 그린 카드 테(네 귀퉁이에 잎), 오른쪽 아래 구석에서 들어오는 수채 단풍 가지 한 줄기.
 * 종이결은 위젯 판(PaperLayer)이 깐다. 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0).
 * 커서가 들어오면 가지가 바람에 한 번 흔들린다(useHoverOnce). 글 뒤에 깔리고 누르는 것은 받지 않는다.
 * 칸이 판을 채우는 위젯(달력·주간, busy)에서는 가지를 작고 옅게 — 날짜 숫자 뒤에 잎이 겹쳐 읽기 어려웠다.
 */
import { useRef } from "react";
import * as S from "./MapleWidgetDecor.styles";
import useHoverOnce from "@/hooks/useHoverOnce";
import type { WidgetKind } from "@/store/useWidgetStore";

export default function MapleWidgetDecor({ busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 2200);
    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor" data-busy={busy || undefined}>
            <span className="frame" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="branch" src="/themes/maple/hero-branch.webp" alt="" draggable={false} />
        </S.Decor>
    );
}
