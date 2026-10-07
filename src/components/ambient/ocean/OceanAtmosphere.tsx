"use client";
/**
 * 바다의 바탕 장면 — 화면 전체를 덮는 물(three.js) 한 장과 고운 결(grain) 한 겹.
 * 그리고 커서 빛: 커서 아래에 있는 유리 판(--ocean-glass: 1 이 붙은 판 — water.ts 의 surface·sand)에
 * 커서 자리(--gx·--gy)를 적어 주면 판이 그 자리에 빛을 모은다. 판이 여럿 겹치면(판 안의 카드) 모두.
 * 내용 뒤(z-index -1)에 깔리고, 화면을 누르는 것은 받지 않는다. 움직임 '끄기'·위젯 창에서는 커서 빛도 없다.
 */
import { useEffect } from "react";
import useThemeMotion from "@/hooks/useThemeMotion";
import OceanCaustics from "./OceanCaustics";
import * as S from "./OceanAtmosphere.styles";

/** 커서 아래 유리 판들에 빛 자리를 적는다 (rAF 로 한 번에) */
function useGlassSpotlight(enabled: boolean) {
    useEffect(() => {
        if (!enabled || window.matchMedia("(hover: none)").matches) return;
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
    useGlassSpotlight(motion !== "off");
    return (
        <S.Sea aria-hidden="true" data-ambient="ocean">
            <OceanCaustics />
            <S.Grain />
        </S.Sea>
    );
}
