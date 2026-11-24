"use client";

import { useLayoutEffect, useRef } from "react";
import { GemFrameOverlay } from "../gemCalendarStyles";
import useThemeMotion from "@/hooks/useThemeMotion";

type Box = { x: number; y: number; width: number; height: number };

function position({ x, y, width, height }: Box) {
    return { transform: `translate(${x}px, ${y}px)`, width: `${width}px`, height: `${height}px` };
}

export default function GemSelectionFrame({ period, selected }: {
    period: string | number;
    selected: string | null | undefined;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const run = useRef<Animation | null>(null);
    const previous = useRef<{ period: typeof period; selected: typeof selected; box: Box } | null>(null);
    const motion = useThemeMotion();

    useLayoutEffect(() => {
        const frame = ref.current;
        const container = frame?.parentElement;
        const cell = container?.querySelector<HTMLElement>("[data-gem-frame-anchor]");
        if (!frame || !container) return;
        if (!cell || selected == null) {
            run.current?.cancel();
            run.current = null;
            frame.style.display = "none";
            previous.current = null;
            return;
        }

        const update = (move: boolean) => {
            const root = container.getBoundingClientRect();
            const anchor = cell.getBoundingClientRect();
            const scaleX = root.width / container.offsetWidth || 1;
            const scaleY = root.height / container.offsetHeight || 1;
            const xFromScreen = (x: number) => (x - root.left) / scaleX + container.scrollLeft - container.clientLeft;
            const yFromScreen = (y: number) => (y - root.top) / scaleY + container.scrollTop - container.clientTop;
            const inset = parseFloat(getComputedStyle(container).getPropertyValue("--gem-frame-inset")) || 0;
            const next = {
                x: xFromScreen(anchor.left) + inset,
                y: yFromScreen(anchor.top) + inset,
                width: Math.max(0, anchor.width / scaleX - 2 * inset),
                height: Math.max(0, anchor.height / scaleY - 2 * inset),
            };
            const before = previous.current;
            const changed = !before || Math.abs(next.x - before.box.x) > .1 || Math.abs(next.y - before.box.y) > .1
                || Math.abs(next.width - before.box.width) > .1 || Math.abs(next.height - before.box.height) > .1;
            const nextPosition = position(next);
            const shouldMove = move && changed && before?.period === period && before.selected !== selected && motion !== "off";
            const drawn = shouldMove ? frame.getBoundingClientRect() : null;

            if (changed || move) {
                run.current?.cancel();
                run.current = null;
                Object.assign(frame.style, nextPosition, { display: "block" });
            }
            previous.current = { period, selected, box: next };
            if (drawn && drawn.width && drawn.height) {
                // Rapid clicks start from the in-flight frame, so it never jumps back to a cell.
                run.current = frame.animate([
                    position({ x: xFromScreen(drawn.left), y: yFromScreen(drawn.top), width: drawn.width / scaleX, height: drawn.height / scaleY }),
                    nextPosition,
                ], { duration: motion === "gentle" ? 140 : 300, easing: "cubic-bezier(.22, .82, .25, 1)", fill: "backwards" });
            } else if (move && before?.period !== period && motion !== "off") {
                run.current = frame.animate([{ opacity: .25 }, { opacity: 1 }], {
                    duration: motion === "gentle" ? 120 : 190, easing: "ease-out",
                });
            }
        };

        update(true);
        const observer = new ResizeObserver(() => update(false));
        observer.observe(container);
        observer.observe(cell);
        return () => observer.disconnect();
    }, [period, selected, motion]);

    useLayoutEffect(() => () => { run.current?.cancel(); }, []);

    return <GemFrameOverlay ref={ref} aria-hidden="true" />;
}
