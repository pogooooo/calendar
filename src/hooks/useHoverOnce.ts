"use client";
/**
 * 커서가 들어올 때마다 한 번 — 받은 요소에 data-glint 를 잠깐 켠다. CSS 가 그동안 한 번만 도는 몸짓을 건다.
 * 데스크톱 위젯처럼 끝없이 움직이면 안 되는 자리(투명 창은 계속 다시 칠하면 깜빡인다 — BUGS 1.2.0)에서
 * 가만히 있다가 손이 닿을 때만 살아나게 한다. 듣는 곳은 위젯 판([data-widget]) — 없으면 그 요소의 부모. 움직임 '끄기'면 하지 않는다.
 */
import { useEffect, type RefObject } from "react";
import useThemeMotion from "@/hooks/useThemeMotion";

export default function useHoverOnce(ref: RefObject<HTMLElement | null>, ms = 1800) {
    const motion = useThemeMotion();
    useEffect(() => {
        const el = ref.current;
        const host = el?.closest<HTMLElement>("[data-widget]") ?? el?.parentElement;
        if (!el || !host || motion === "off") return;
        let timer = 0;
        const play = () => {
            el.removeAttribute("data-glint");
            void el.getBoundingClientRect(); // 다시 걸리도록 한 번 비운다
            el.setAttribute("data-glint", "");
            window.clearTimeout(timer);
            timer = window.setTimeout(() => el.removeAttribute("data-glint"), ms);
        };
        host.addEventListener("pointerenter", play);
        return () => {
            host.removeEventListener("pointerenter", play);
            window.clearTimeout(timer);
            el.removeAttribute("data-glint");
        };
    }, [ref, motion, ms]);
}
