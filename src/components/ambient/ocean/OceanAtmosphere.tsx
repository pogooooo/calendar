"use client";
/**
 * 바다의 바탕 장면 — 화면 전체를 덮는 물(three.js) 한 장과 고운 결(grain) 한 겹.
 * 그리고 커서 빛: 커서 아래에 있는 유리 판(--ocean-glass: 1 이 붙은 판 — water.ts 의 surface·sand)에
 * 커서 자리(--gx·--gy)를 적어 주면 판이 그 자리에 빛을 모은다. 판이 여럿 겹치면(판 안의 카드) 모두.
 * 내용 뒤(z-index -1)에 깔리고, 화면을 누르는 것은 받지 않는다. 움직임 '끄기'·위젯 창에서는 커서 빛도 없다.
 */
import { useEffect, useState } from "react";
import useThemeMotion from "@/hooks/useThemeMotion";
import OceanCaustics from "./OceanCaustics";
import * as S from "./OceanAtmosphere.styles";

/** 커서 아래 유리 판들에 빛 자리를 적는다 (rAF 로 한 번에) */
function useGlassSpotlight(enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;
        const glassy = new WeakMap<Element, boolean>();
        const isGlass = (el: Element) => {
            let v = glassy.get(el);
            if (v === undefined) {
                v = getComputedStyle(el).getPropertyValue("--ocean-glass").trim() === "1";
                glassy.set(el, v);
            }
            return v;
        };
        let lit: HTMLElement[] = [];
        let frame = 0;
        let px = 0, py = 0, target: Element | null = null;

        const paint = () => {
            frame = 0;
            const next: HTMLElement[] = [];
            for (let el = target; el && el !== document.body; el = el.parentElement) {
                if (el instanceof HTMLElement && isGlass(el)) next.push(el);
            }
            lit.forEach((el) => { if (!next.includes(el)) { el.style.removeProperty("--gx"); el.style.removeProperty("--gy"); } });
            next.forEach((el) => {
                const r = el.getBoundingClientRect();
                el.style.setProperty("--gx", `${(px - r.left).toFixed(0)}px`);
                el.style.setProperty("--gy", `${(py - r.top).toFixed(0)}px`);
            });
            lit = next;
        };
        const onMove = (e: PointerEvent) => {
            // 마우스(펜)만 — 손가락 기기 판정(hover: none) 대신 움직임의 종류로 가린다(터치스크린 노트북도 마우스면 비춘다)
            if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
            px = e.clientX; py = e.clientY; target = e.target as Element | null;
            if (!frame) frame = requestAnimationFrame(paint);
        };
        const onLeave = () => { target = null; if (!frame) frame = requestAnimationFrame(paint); };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            cancelAnimationFrame(frame);
            lit.forEach((el) => { el.style.removeProperty("--gx"); el.style.removeProperty("--gy"); });
        };
    }, [enabled]);
}

export default function OceanAtmosphere() {
    const motion = useThemeMotion();
    // WebGL 이 없는 기기 — 물 대신 CSS 물빛이 일렁인다
    const [flat, setFlat] = useState(false);
    useGlassSpotlight(motion !== "off");
    return (
        <S.Sea aria-hidden="true" data-ambient="ocean">
            {flat ? <S.FlatWater /> : <OceanCaustics onFail={() => setFlat(true)} />}
            <S.Grain />
        </S.Sea>
    );
}
