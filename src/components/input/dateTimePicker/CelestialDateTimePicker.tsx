"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import CelestialTimeDial from "./CelestialTimeDial";
import * as S from "./CelestialDateTimePicker.styles";

interface CelestialDateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    mode?: "datetime" | "date";
    range?: {
        start: string;
        end: string;
        edge: "start" | "end";
        onRangeChange: (start: string, end: string) => void;
    };
}


const pad = (n: number) => String(n).padStart(2, "0");

const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function parseValue(value: string, mode: "datetime" | "date") {
    const d = value ? new Date(mode === "date" ? `${value.slice(0, 10)}T00:00` : value) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
}

function emit(date: Date, hour: number, minute: number, mode: "datetime" | "date") {
    const base = toKey(date);
    return mode === "date" ? base : `${base}T${pad(hour)}:${pad(minute)}`;
}

function buildGrid(view: Date) {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

export default function CelestialDateTimePicker({ value, onChange, mode = "datetime", range }: CelestialDateTimePickerProps) {
    const f = useT().form;
    const WEEKDAYS = f.weekdays;
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const popRef = React.useRef<HTMLDivElement>(null);
    const gridRef = React.useRef<HTMLDivElement>(null);

    const [open, setOpen] = React.useState(false);
    const [pos, setPos] = React.useState<{ top: number; left: number; up: boolean } | null>(null);

    const selected = parseValue(value, mode);
    const [view, setView] = React.useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

    const hour = selected.getHours();
    const minute = selected.getMinutes();

    const openPopover = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const left = Math.max(8, Math.min(rect.left, window.innerWidth - S.POP_WIDTH - 8));

        setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
        setPos({ top: rect.bottom + 6, left, up: false });
        setOpen(true);
    };

    React.useLayoutEffect(() => {
        if (!open) return;
        const el = popRef.current;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!el || !rect) return;

        const h = el.offsetHeight;
        let top = rect.bottom + 6;
        let up = false;

        if (top + h > window.innerHeight - 8) {
            if (rect.top - h - 6 > 8) {
                top = rect.top - h - 6;
                up = true;
            } else {
                top = Math.max(8, window.innerHeight - h - 8);
            }
        }

        setPos(p => (p && p.top === top && p.up === up ? p : p ? { ...p, top, up } : p));
    }, [open]);

    React.useEffect(() => {
        if (!open) return;

        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopImmediatePropagation();
                e.stopPropagation();
                setOpen(false);
            }
        };

        window.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey, true);
        return () => {
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey, true);
        };
    }, [open]);

    const [edge, setEdge] = React.useState<"start" | "end">(range?.edge ?? "start");
    React.useEffect(() => { if (open) setEdge(range?.edge ?? "start"); }, [open, range?.edge]);

    const rangeStart = range ? parseValue(range.start, mode) : null;
    const rangeEnd = range ? parseValue(range.end, mode) : null;
    const startKey = rangeStart ? toKey(rangeStart) : "";
    const endKey = rangeEnd ? toKey(rangeEnd) : "";

    const pickDay = (d: Date) => {
        if (!range) {
            onChange(emit(d, hour, minute, mode));
            if (mode === "date") setOpen(false);
            return;
        }

        const picked = emit(d, hour, minute, mode);
        const otherRaw = edge === "start" ? range.end : range.start;
        const other = parseValue(otherRaw, mode);
        const inverted = edge === "start"
            ? toKey(d) > toKey(other)
            : toKey(d) < toKey(other);

        if (edge === "start") {
            range.onRangeChange(picked, inverted ? picked : range.end);
            setEdge("end");
        } else {
            range.onRangeChange(inverted ? picked : range.start, picked);
            setEdge("start");
        }
    };

    const pickNow = () => {
        const now = new Date();
        now.setMinutes(Math.round(now.getMinutes() / 5) * 5, 0, 0);
        setView(new Date(now.getFullYear(), now.getMonth(), 1));
        onChange(emit(now, now.getHours(), now.getMinutes(), mode));
        if (mode === "date") setOpen(false);
    };

    const shiftActive = (delta: number) => {
        const base = range ? parseValue(edge === "start" ? range.start : range.end, mode) : selected;
        const next = new Date(base);
        next.setDate(next.getDate() + delta);
        setView(new Date(next.getFullYear(), next.getMonth(), 1));

        if (!range) {
            onChange(emit(next, hour, minute, mode));
            return;
        }

        const picked = emit(next, hour, minute, mode);
        if (edge === "start") {
            const other = parseValue(range.end, mode);
            range.onRangeChange(picked, toKey(next) > toKey(other) ? picked : range.end);
        } else {
            const other = parseValue(range.start, mode);
            range.onRangeChange(toKey(next) < toKey(other) ? picked : range.start, picked);
        }
    };

    const shiftRef = React.useRef(shiftActive);
    shiftRef.current = shiftActive;

    React.useEffect(() => {
        const el = gridRef.current;
        if (!open || !el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            shiftRef.current(e.deltaY > 0 ? 1 : -1);
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [open]);

    const onGridKey = (e: React.KeyboardEvent) => {
        const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (map[e.key] !== undefined) {
            e.preventDefault();
            shiftActive(map[e.key]);
        } else if (e.key === "Enter") {
            e.preventDefault();
            setOpen(false);
        }
    };

    const grid = buildGrid(view);
    const todayKey = toKey(new Date());
    const selectedKey = toKey(selected);

    const label = `${selected.getFullYear()}. ${selected.getMonth() + 1}. ${selected.getDate()} (${WEEKDAYS[selected.getDay()]})`
        + (mode === "datetime" ? ` · ${pad(hour)}:${pad(minute)}` : "");

    return (
        <>
            <S.Trigger ref={triggerRef} type="button" $open={open} onClick={() => (open ? setOpen(false) : openPopover())}>
                <CalendarDays size={14} />
                <span>{label}</span>
            </S.Trigger>

            {open && pos && typeof document !== "undefined" && createPortal(
                <S.Popover ref={popRef} $up={pos.up} style={{ top: pos.top, left: pos.left }} onKeyDown={onGridKey} tabIndex={-1}>
                    <S.MonthNav>
                        <button type="button" onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}>
                            <ChevronLeft size={15} />
                        </button>
                        <strong>{view.getFullYear()}. {view.getMonth() + 1}</strong>
                        <button type="button" onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}>
                            <ChevronRight size={15} />
                        </button>
                    </S.MonthNav>

                    <S.WeekHead>
                        {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
                    </S.WeekHead>

                    {range && (
                        <S.EdgeTabs role="group" aria-label={f.pickedEdge}>
                            <button type="button" data-on={edge === "start" ? "1" : "0"} onClick={() => setEdge("start")}>
                                {f.start} · {startKey.slice(5).replace("-", ".")}
                            </button>
                            <button type="button" data-on={edge === "end" ? "1" : "0"} onClick={() => setEdge("end")}>
                                {f.end} · {endKey.slice(5).replace("-", ".")}
                            </button>
                        </S.EdgeTabs>
                    )}

                    <S.Grid ref={gridRef}>
                        {grid.map((d, i) => {
                            const key = toKey(d);
                            const isStart = !!range && key === startKey;
                            const isEnd = !!range && key === endKey;
                            const between = !!range && startKey < endKey && key > startKey && key < endKey;
                            return (
                                <S.Day
                                    key={i}
                                    type="button"
                                    $out={d.getMonth() !== view.getMonth()}
                                    $today={key === todayKey}
                                    $selected={range ? (isStart || isEnd) : key === selectedKey}
                                    $inRange={between}
                                    $edgeStart={isStart && startKey < endKey}
                                    $edgeEnd={isEnd && startKey < endKey}
                                    onClick={() => pickDay(d)}
                                >
                                    <span>{d.getDate()}</span>
                                </S.Day>
                            );
                        })}
                    </S.Grid>

                    {mode === "datetime" && (
                        <S.TimeArea>
                            <S.TimeLabel>
                                <Clock size={12} /> {f.time}
                                <b>{pad(hour)}:{pad(minute)}</b>
                            </S.TimeLabel>
                            <CelestialTimeDial
                                hour={hour}
                                minute={minute}
                                onChange={(h, m) => onChange(emit(selected, h, m, mode))}
                            />
                        </S.TimeArea>
                    )}

                    <S.Foot>
                        <button type="button" onClick={pickNow}>{mode === "datetime" ? f.now : f.today}</button>
                        <button type="button" className="ok" onClick={() => setOpen(false)}>{f.done} ✦</button>
                    </S.Foot>
                </S.Popover>,
                document.body,
            )}
        </>
    );
}
