"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import styled, { css, keyframes } from "styled-components";
import { MOBILE, SAFE_B } from "@/styles/breakpoints";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import CelestialTimeDial from "./CelestialTimeDial";

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

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const POP_WIDTH = 272;

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

        const left = Math.max(8, Math.min(rect.left, window.innerWidth - POP_WIDTH - 8));

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
            <Trigger ref={triggerRef} type="button" $open={open} onClick={() => (open ? setOpen(false) : openPopover())}>
                <CalendarDays size={14} />
                <span>{label}</span>
            </Trigger>

            {open && pos && typeof document !== "undefined" && createPortal(
                <Popover ref={popRef} $up={pos.up} style={{ top: pos.top, left: pos.left }} onKeyDown={onGridKey} tabIndex={-1}>
                    <MonthNav>
                        <button type="button" onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}>
                            <ChevronLeft size={15} />
                        </button>
                        <strong>{view.getFullYear()}. {view.getMonth() + 1}</strong>
                        <button type="button" onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}>
                            <ChevronRight size={15} />
                        </button>
                    </MonthNav>

                    <WeekHead>
                        {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
                    </WeekHead>

                    {range && (
                        <EdgeTabs role="group" aria-label="잡을 끝">
                            <button type="button" data-on={edge === "start" ? "1" : "0"} onClick={() => setEdge("start")}>
                                시작 · {startKey.slice(5).replace("-", ".")}
                            </button>
                            <button type="button" data-on={edge === "end" ? "1" : "0"} onClick={() => setEdge("end")}>
                                종료 · {endKey.slice(5).replace("-", ".")}
                            </button>
                        </EdgeTabs>
                    )}

                    <Grid ref={gridRef}>
                        {grid.map((d, i) => {
                            const key = toKey(d);
                            const isStart = !!range && key === startKey;
                            const isEnd = !!range && key === endKey;
                            const between = !!range && startKey < endKey && key > startKey && key < endKey;
                            return (
                                <Day
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
                                </Day>
                            );
                        })}
                    </Grid>

                    {mode === "datetime" && (
                        <TimeArea>
                            <TimeLabel>
                                <Clock size={12} /> 시간
                                <b>{pad(hour)}:{pad(minute)}</b>
                            </TimeLabel>
                            <CelestialTimeDial
                                hour={hour}
                                minute={minute}
                                onChange={(h, m) => onChange(emit(selected, h, m, mode))}
                            />
                        </TimeArea>
                    )}

                    <Foot>
                        <button type="button" onClick={pickNow}>{mode === "datetime" ? "지금" : "오늘"}</button>
                        <button type="button" className="ok" onClick={() => setOpen(false)}>완료 ✦</button>
                    </Foot>
                </Popover>,
                document.body,
            )}
        </>
    );
}

const popIn = keyframes`
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: none; }
`;

const popInUp = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: none; }
`;

const Trigger = styled.button<{ $open: boolean }>`
    flex: 1;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    font-size: 0.82rem;
    font-family: inherit;
    letter-spacing: 0.3px;
    text-align: left;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}${p => (p.$open ? "" : "44")};
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    svg { color: ${p => p.theme.colors.primary}; flex: 0 0 auto; }
    span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

    &:hover { border-color: ${p => p.theme.colors.primary}; }

    ${p => p.$open && css`
        box-shadow: 0 0 8px ${p.theme.colors.primary}44;
    `}
`;

const Popover = styled.div<{ $up: boolean }>`
    position: fixed;
    z-index: 1100;
    width: ${POP_WIDTH}px;
    padding: 12px;
    background: ${p => p.theme.colors.surface};
    border: 1px solid ${p => p.theme.colors.primary}57;
    box-shadow: 0 10px 26px -12px rgba(0, 0, 0, 0.34);
    outline: none;
    animation: ${p => (p.$up ? popInUp : popIn)} 0.18s ease-out;

    ${MOBILE} {
        top: auto !important;
        left: 0 !important;
        right: 0;
        bottom: 0;
        width: auto;
        max-height: 88dvh;
        overflow-y: auto;
        padding: 14px 16px calc(14px + ${SAFE_B});
        border: none;
        border-top: 1px solid ${p => p.theme.colors.primary};
        animation: ${popIn} 0.2s ease-out;
    }
`;

const MonthNav = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    strong {
        font-family: ${p => p.theme.fonts.celestial};
        font-size: 0.92rem;
        font-weight: 400;
        letter-spacing: 2px;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}33;
        color: ${p => p.theme.colors.textSecondary};
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;

        &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }
    }
`;

const WeekHead = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 3px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}44;

    span {
        text-align: center;
        font-size: 0.64rem;
        letter-spacing: 1px;
        color: ${p => p.theme.colors.textSecondary};
    }

    span:first-child { color: #d97878; }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
`;

const EdgeTabs = styled.div`
    display: flex;
    margin-bottom: 6px;
    border: 1px solid ${p => p.theme.colors.primary}33;

    button {
        flex: 1;
        background: none;
        border: 0;
        padding: 5px 0;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.68rem;
        letter-spacing: 0.04em;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    button + button { border-left: 1px solid ${p => p.theme.colors.primary}33; }

    button[data-on="1"] {
        background-color: ${p => p.theme.colors.primary}1F;
        color: ${p => p.theme.colors.primary};
    }
`;

const Day = styled.button<{
    $out: boolean;
    $today: boolean;
    $selected: boolean;
    $inRange?: boolean;
    $edgeStart?: boolean;
    $edgeEnd?: boolean;
}>`
    position: relative;
    height: 30px;
    font-size: 0.74rem;
    font-family: inherit;
    background: none;
    border: 0;
    color: ${p => p.theme.colors.text};
    opacity: ${p => (p.$out ? 0.38 : 1)};
    cursor: pointer;

    span {
        position: relative;
        z-index: 2;
    }

    &:hover span { color: ${p => p.theme.colors.primary}; }

    &:focus-visible {
        outline: 2px solid ${p => p.theme.colors.primary};
        outline-offset: -2px;
    }

    ${p => (p.$inRange || p.$edgeStart || p.$edgeEnd) && css`
        &::before {
            content: "";
            position: absolute;
            top: 50%;
            height: 1px;
            background-color: ${p.theme.colors.primary}88;
            left: ${p.$edgeStart && !p.$edgeEnd ? "50%" : "0"};
            right: ${p.$edgeEnd && !p.$edgeStart ? "50%" : "0"};
        }
    `}

    ${p => p.$today && !p.$selected && css`
        span {
            text-decoration: underline;
            text-decoration-color: ${p.theme.colors.primary};
            text-underline-offset: 3px;
        }
    `}

    ${p => p.$selected && css`
        &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 22px;
            height: 22px;
            margin: -11px 0 0 -11px;
            border: 1px solid ${p.theme.colors.primary};
            background-color: ${p.theme.colors.surface};
            transform: rotate(45deg);
            z-index: 1;
        }
        span { color: ${p.theme.colors.primary}; font-weight: 600; }
    `}
`;

const TimeArea = styled.div`
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed ${p => p.theme.colors.primary}44;
`;

const TimeLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 6px;
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};

    svg { color: ${p => p.theme.colors.primary}; }
`;

const Foot = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid ${p => p.theme.colors.primary}44;

    button {
        padding: 5px 12px;
        font-size: 0.72rem;
        font-family: inherit;
        letter-spacing: 1px;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}44;
        color: ${p => p.theme.colors.textSecondary};
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;

        &:hover {
            border-color: ${p => p.theme.colors.primary};
            color: ${p => p.theme.colors.primary};
        }
    }

    .ok {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};

        &:hover { box-shadow: 0 0 8px ${p => p.theme.colors.primary}55; }
    }
`;
