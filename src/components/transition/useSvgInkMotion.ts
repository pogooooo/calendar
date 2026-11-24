"use client";

import { useEffect } from "react";
import type useThemeMotion from "@/hooks/useThemeMotion";

const ownerSelector = 'button, a[href], summary, label, [role="button"], [role="switch"], [role="tab"], [role="menuitem"], [data-svg-owner]';
const shapes = "path, circle, ellipse, line, polyline, polygon, rect, use";
const nonPainting = "defs, clipPath, mask, marker, pattern, symbol, [data-ambient], [data-motion-snapshot], [inert]";

function ownerOf(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;
    return target.closest(ownerSelector) ?? target.closest("svg");
}

/** Accentuate individual marks in existing inline artwork without moving its bounds or hit area. */
export function useSvgInkMotion(level: ReturnType<typeof useThemeMotion>) {
    useEffect(() => {
        if (level === "off") return;
        const running = new Map<SVGElement, Animation>();
        const stop = () => {
            for (const animation of running.values()) animation.cancel();
            running.clear();
        };
        const play = (owner: Element | null) => {
            if (!owner || document.hidden || owner.closest(nonPainting + ', [data-widget-motion="off"], :disabled, [aria-disabled="true"]')) return;
            const gentle = level === "gentle" || !!owner.closest('[data-widget-motion="gentle"]');
            const drawings = owner instanceof SVGSVGElement ? [owner] : Array.from(owner.querySelectorAll("svg"))
                .filter(svg => svg.closest(ownerSelector) === owner);
            for (const svg of drawings) {
                if (svg.closest(nonPainting) || !svg.getClientRects().length) continue;
                const marks = Array.from(svg.querySelectorAll<SVGElement>(shapes)).filter(part =>
                    part.closest("svg") === svg && !part.closest(nonPainting));
                // Sample across dense engravings so a pointer entry never starts hundreds of animations.
                const count = Math.min(marks.length, gentle ? 3 : 8);
                for (let i = 0; i < count; i++) {
                    const part = marks[count === 1 ? 0 : Math.round(i * (marks.length - 1) / (count - 1))];
                    if (running.has(part)) continue;
                    const style = getComputedStyle(part);
                    if (style.visibility !== "visible" || style.display === "none" || Number(style.opacity) === 0) continue;
                    const weight = parseFloat(style.strokeWidth);
                    const strokes = style.stroke !== "none" && weight > 0;
                    const baseFilter = style.filter === "none" ? "" : style.filter + " ";
                    const base: Keyframe = { filter: style.filter };
                    const lit: Keyframe = { filter: baseFilter + (gentle ? "brightness(1.20)" : "brightness(1.35) drop-shadow(0 0 .8px currentColor)") };
                    if (strokes) {
                        base.strokeWidth = style.strokeWidth;
                        lit.strokeWidth = weight * (gentle ? 1.14 : 1.36) + "px";
                    }
                    const animation = part.animate([base, { ...lit, offset: .38 }, base], {
                        duration: gentle ? 220 : 490, delay: i * (gentle ? 15 : 34), easing: "ease-in-out",
                    });
                    animation.id = "cronos-svg-ink";
                    running.set(part, animation);
                    animation.onfinish = animation.oncancel = () => {
                        if (running.get(part) === animation) running.delete(part);
                    };
                }
            }
        };
        const enter = (e: PointerEvent) => {
            const owner = ownerOf(e.target);
            if (e.pointerType !== "touch" && owner && owner !== ownerOf(e.relatedTarget)) play(owner);
        };
        const press = (e: PointerEvent) => { if (e.button === 0) play(ownerOf(e.target)); };
        const focus = (e: FocusEvent) => { if (e.target instanceof Element && e.target.matches(":focus-visible")) play(ownerOf(e.target)); };
        const visibility = () => { if (document.hidden) stop(); };
        document.addEventListener("pointerover", enter, { passive: true });
        document.addEventListener("pointerdown", press, { passive: true, capture: true });
        document.addEventListener("focusin", focus);
        document.addEventListener("visibilitychange", visibility);
        return () => {
            document.removeEventListener("pointerover", enter);
            document.removeEventListener("pointerdown", press, true);
            document.removeEventListener("focusin", focus);
            document.removeEventListener("visibilitychange", visibility);
            stop();
        };
    }, [level]);
}
