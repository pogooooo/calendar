"use client";
/**
 * Ocean 위젯의 바탕 무늬 — 앱의 물을 유리 너머로 보는 듯: 물빛(위는 청록, 아래로 얕아져 모래빛), 물바닥에 어른거리는 빛 그물,
 * 위에서 비스듬히 내려오는 햇살. 빛 그물은 앱의 물 셰이더와 같은 식으로 멈춘 한 장을 그린다(caustic.ts) —
 * 예전의 SVG 난류는 구겨진 비닐처럼 보였다(사용자: "물결 무늬가 부자연스러워"). 떠 있던 유리 방울은 걷었다("물방울 지워줘").
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 들어오면 빛 그물이 조금 흘렀다 돌아온다
 * (useHoverOnce — 다시 그리지 않고 겹 하나를 옮길 뿐). 글 뒤에 깔리고 누르는 것은 받지 않는다.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import * as S from "./OceanWidgetDecor.styles";
import useHoverOnce from "@/hooks/useHoverOnce";
import { seededRandom } from "../seededRandom";
import { paintCaustics } from "./caustic";
import type { WidgetKind } from "@/store/useWidgetStore";

/** 첫 겹의 한 주기 폭(CSS px). 위젯 크기와 상관없이 물결 크기가 같다 — 겹을 비틀어 겹쳐 되풀이는 보이지 않는다 */
const CELL = 320;
/** 흐를 자리 — 겹을 판보다 이만큼 크게 깐다(스타일의 inset 과 같아야 한다) */
const BLEED = 14;

export default function OceanWidgetDecor({ kind }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    useHoverOnce(ref, 2200);
    const dark = useTheme().mode === "dark";

    useEffect(() => {
        const box = ref.current;
        const cv = canvas.current;
        if (!box || !cv) return;
        // 위젯마다 다른 한 장 — 같은 위젯은 늘 같은 무늬
        const t = 4 + seededRandom(`ocean:${kind}`)() * 30;
        let last = "";
        const draw = () => {
            const w = box.clientWidth + BLEED * 2;
            const h = box.clientHeight + BLEED * 2;
            const key = `${w}x${h}`;
            if (key === last || box.clientWidth <= 0 || box.clientHeight <= 0) return;
            last = key;
            paintCaustics(cv, w, h, { t, cell: CELL, gain: 2.3, rgb: dark ? [128, 242, 222] : [255, 255, 248] });
        };
        draw();
        // 위젯 크기를 바꾸면 다시 그린다 — 늘린 그림은 물결이 퍼져 보인다
        let raf = 0;
        const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); });
        ro.observe(box);
        return () => { ro.disconnect(); cancelAnimationFrame(raf); };
    }, [kind, dark]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor">
            <span className="tint" />
            <canvas ref={canvas} className="caustics" />
            <span className="rays" />
        </S.Decor>
    );
}
