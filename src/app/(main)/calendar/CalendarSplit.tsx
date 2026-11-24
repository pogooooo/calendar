"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useT } from "@/i18n/useT";
import useIsMobile from "@/hooks/useIsMobile";
import type { CalendarLayoutProps } from "./CalendarLayout.types";
import { Split, Divider } from "./CalendarSplit.styles";

const DEFAULT = 65;

export default function CalendarSplit({ month, day, dayFirst = false, stacked = false }: CalendarLayoutProps & { dayFirst?: boolean; stacked?: boolean }) {
    const narrow = useIsMobile(1250);
    const verticalStack = stacked || narrow;
    const t = useT().calendar;
    const monthId = useId();
    const key = "cronos-calendar-month-share-" + (verticalStack ? "stack" : "row");
    const [share, setShare] = useState(DEFAULT);
    const grid = useRef<HTMLDivElement>(null);
    const drag = useRef<{ id: number; offset: number; value: number } | null>(null);

    useEffect(() => {
        drag.current = null;
        try {
            const raw = localStorage.getItem(key);
            const saved = raw === null
                ? (localStorage.getItem("cronos-day-collapsed") === "1" ? 100 : DEFAULT)
                : Number(raw);
            setShare(Number.isFinite(saved) ? Math.min(100, Math.max(0, saved)) : DEFAULT);
        } catch { setShare(DEFAULT); }
    }, [key]);

    function save(value: number) {
        setShare(value);
        try { localStorage.setItem(key, String(value)); } catch {}
    }

    function move(event: PointerEvent<HTMLDivElement>) {
        const current = drag.current;
        if (!current || current.id !== event.pointerId || !grid.current) return;
        const box = grid.current.getBoundingClientRect();
        const handle = event.currentTarget.getBoundingClientRect();
        const size = verticalStack ? box.height - handle.height : box.width - handle.width;
        if (size <= 0) return;
        const pos = verticalStack ? event.clientY - box.top : event.clientX - box.left;
        const first = Math.max(0, Math.min(100, Math.round((pos - current.offset) / size * 100)));
        current.value = dayFirst ? 100 - first : first;
        setShare(current.value);
    }

    const separator = <Divider role="separator" tabIndex={0} aria-orientation={verticalStack ? "horizontal" : "vertical"}
        aria-label={t.resizeCalendars} aria-controls={monthId} title={t.resizeCalendars}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={share}
        aria-valuetext={t.monthView + " " + share + "% · " + t.dayView + " " + (100-share) + "%"}
        onPointerDown={event => {
            if (!event.isPrimary || event.button !== 0) return;
            const box = event.currentTarget.getBoundingClientRect();
            const offset = verticalStack ? event.clientY - box.top : event.clientX - box.left;
            drag.current = { id: event.pointerId, offset, value: share };
            event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={move}
        onLostPointerCapture={() => {
            if (drag.current) save(drag.current.value);
            drag.current = null;
        }}
        onDoubleClick={() => save(DEFAULT)}
        onKeyDown={event => {
            const less = verticalStack ? "ArrowUp" : "ArrowLeft";
            const more = verticalStack ? "ArrowDown" : "ArrowRight";
            const step = dayFirst ? -5 : 5;
            const values: Record<string, number> = { [less]: share-step, [more]: share+step, Home: 0, End: 100 };
            if (!(event.key in values)) return;
            event.preventDefault();
            save(Math.min(100, Math.max(0, values[event.key])));
        }}
    />;
    const monthRegion = <div id={monthId} data-calendar-region="month" hidden={share === 0}>{month}</div>;
    const dayRegion = <div data-calendar-region="day" hidden={share === 100}>{day}</div>;
    const first = dayFirst ? 100-share : share;
    return <Split ref={grid} data-stack={verticalStack || undefined} data-day-first={dayFirst || undefined}
        style={{ "--first": first+"fr", "--last": (100-first)+"fr" } as CSSProperties}>
        {dayFirst ? dayRegion : monthRegion}
        {separator}
        {dayFirst ? monthRegion : dayRegion}
    </Split>;
}
