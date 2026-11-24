"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useT } from "@/i18n/useT";

const minimum = { todos: 110, timeline: 170, challenge: 94, task: 150, memo: 150 };
export type DayPanel = keyof typeof minimum;
const max = 2400;

export default function PanelHeightHandle({ panel, label, mobile }: { panel: DayPanel; label: string; mobile: boolean }) {
    const t = useT();
    const ref = useRef<HTMLDivElement>(null);
    const drag = useRef<{ id: number; y: number; height: number; previous: string } | null>(null);
    const [actual, setActual] = useState(minimum[panel]);
    const key = `cronos-day-height-${mobile ? "mobile" : "desktop"}-${panel}`;
    const clamp = (n: number) => Math.round(Math.max(minimum[panel], Math.min(max, n)));
    useLayoutEffect(() => {
        const host = ref.current?.parentElement;
        if (!host) return;
        try {
            const saved = Number(localStorage.getItem(key));
            if (saved >= minimum[panel] && saved <= max) host.style.setProperty("--panel-height", saved + "px");
        } catch { /* Storage can be unavailable in a webview. */ }
        host.toggleAttribute("data-panel-sized", !!host.style.getPropertyValue("--panel-height"));
        const observer = new ResizeObserver(() => setActual(Math.round(host.getBoundingClientRect().height)));
        observer.observe(host);
        return () => {
            observer.disconnect();
            host.style.removeProperty("--panel-height");
            host.removeAttribute("data-panel-sized");
            drag.current = null;
        };
    }, [key, panel]);
    function apply(value: string, persist = false) {
        const host = ref.current?.parentElement;
        if (!host) return;
        host.style.setProperty("--panel-height", value);
        host.toggleAttribute("data-panel-sized", !!value);
        if (persist) {
            try {
                if (value) localStorage.setItem(key, String(parseInt(value, 10)));
                else localStorage.removeItem(key);
            } catch { /* The current window still uses the chosen height. */ }
        }
    }
    const cancel = () => { if (drag.current) apply(drag.current.previous); drag.current = null; };
    return <Handle ref={ref} data-resize-panel={panel} role="separator" tabIndex={0}
        aria-label={t.calendar.resizePanel(label)} aria-orientation="horizontal"
        aria-valuemin={minimum[panel]} aria-valuemax={max} aria-valuenow={Math.max(minimum[panel], Math.min(max, actual))}
        title={t.calendar.resizePanel(label) + " · " + t.calendar.resizeHelp}
        onPointerDown={e => {
            if (!e.isPrimary || e.button !== 0) return;
            const host = e.currentTarget.parentElement!;
            drag.current = { id: e.pointerId, y: e.clientY, height: host.getBoundingClientRect().height, previous: host.style.getPropertyValue("--panel-height") };
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.focus({ preventScroll: true });
            e.preventDefault();
        }}
        onPointerMove={e => {
            const start = drag.current;
            if (start?.id === e.pointerId) apply(clamp(start.height + e.clientY - start.y) + "px");
        }}
        onPointerUp={e => {
            const start = drag.current;
            if (start?.id !== e.pointerId) return;
            if (e.clientY !== start.y) apply(clamp(start.height + e.clientY - start.y) + "px", true);
            else apply(start.previous);
            drag.current = null;
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onLostPointerCapture={cancel} onPointerCancel={cancel} onDoubleClick={() => apply("", true)}
        onKeyDown={e => {
            if (e.key === "Escape" && drag.current) { cancel(); return; }
            if (!["ArrowUp", "ArrowDown", "Home"].includes(e.key)) return;
            e.preventDefault();
            const h = e.currentTarget.parentElement!.getBoundingClientRect().height;
            apply(e.key === "Home" ? "" : clamp(h + (e.key === "ArrowUp" ? -1 : 1) * (e.shiftKey ? 48 : 12)) + "px", true);
        }} />;
}

const Handle = styled.div`
    flex: 0 0 15px; width: 100%; margin-top: auto; display: grid; place-items: center;
    cursor: ns-resize; touch-action: none; user-select: none; color: ${p => p.theme.colors.textSecondary};
    &::before { content: ""; width: 26px; height: 3px; border-radius: 3px; background: currentColor; opacity: .55; }
    &:hover::before, &:focus-visible::before { opacity: 1; }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
    @media (pointer: coarse) { flex-basis: 26px; }
`;
