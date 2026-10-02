"use client";
import * as React from "react";

/** Mouse drag or touch long-press. A normal touch scroll never starts a drag. */
export default function useDragTarget<T>(attribute: string, onDrop: (source: T, target: string) => void) {
    const callback = React.useRef(onDrop);
    callback.current = onDrop;
    const [drag, setDrag] = React.useState<{ source: T; target: string | null; x: number; y: number } | null>(null);
    const session = React.useRef<{ source: T; id: number; x: number; y: number; active: boolean; touch: boolean; timer?: ReturnType<typeof setTimeout>; element: HTMLElement } | null>(null);
    const clickedAfterDrag = React.useRef(false);

    React.useEffect(() => {
        let frame = 0;
        const targetAt = (x: number, y: number) => document.elementFromPoint(x, y)?.closest(`[${attribute}]`)?.getAttribute(attribute) ?? null;
        const end = () => {
            const s = session.current;
            if (s?.timer) clearTimeout(s.timer);
            if (s?.element.hasPointerCapture(s.id)) s.element.releasePointerCapture(s.id);
            session.current = null;
            cancelAnimationFrame(frame);
            document.documentElement.removeAttribute("data-drag-active");
            setDrag(null);
        };
        const move = (e: PointerEvent) => {
            const s = session.current;
            if (!s || e.pointerId !== s.id) return;
            const distance = Math.hypot(e.clientX - s.x, e.clientY - s.y);
            if (!s.active && s.touch && distance > 10) { end(); return; }
            if (!s.active && !s.touch && distance > 6) s.active = true;
            if (!s.active) return;
            e.preventDefault();
            clickedAfterDrag.current = true;
            document.documentElement.setAttribute("data-drag-active", "true");
            if (!s.element.hasPointerCapture(s.id)) s.element.setPointerCapture(s.id);
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setDrag({ source: s.source, target: targetAt(e.clientX, e.clientY), x: e.clientX, y: e.clientY }));
        };
        const up = (e: PointerEvent) => {
            const s = session.current;
            if (!s || e.pointerId !== s.id) return;
            const target = targetAt(e.clientX, e.clientY);
            const source = s.source;
            const active = s.active;
            end();
            if (active && target) callback.current(source, target);
        };
        const key = (e: KeyboardEvent) => { if (e.key === "Escape" && session.current) { e.preventDefault(); end(); } };
        document.addEventListener("pointermove", move, { passive: false });
        document.addEventListener("pointerup", up);
        document.addEventListener("pointercancel", end);
        document.addEventListener("keydown", key);
        window.addEventListener("blur", end);
        return () => {
            end();
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerup", up);
            document.removeEventListener("pointercancel", end);
            document.removeEventListener("keydown", key);
            window.removeEventListener("blur", end);
        };
    }, [attribute]);

    const begin = (e: React.PointerEvent<HTMLElement>, source: T) => {
        if (!e.isPrimary || e.button !== 0 || session.current) return;
        clickedAfterDrag.current = false;
        const current = { source, id: e.pointerId, x: e.clientX, y: e.clientY, active: false, touch: e.pointerType === "touch", element: e.currentTarget };
        session.current = current;
        if (current.touch) {
            session.current.timer = setTimeout(() => {
                if (session.current !== current) return;
                current.active = true;
                clickedAfterDrag.current = true;
                document.documentElement.setAttribute("data-drag-active", "true");
                current.element.setPointerCapture(current.id);
                setDrag({ source, target: null, x: current.x, y: current.y });
            }, 350);
        }
    };
    const consumeClick = () => {
        const value = clickedAfterDrag.current;
        clickedAfterDrag.current = false;
        return value;
    };
    return { drag, begin, consumeClick };
}
