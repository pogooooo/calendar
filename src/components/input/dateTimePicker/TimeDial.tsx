"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialTimeDial.styles";
import * as MapleS from "./maple/MapleTimeDial.styles";
import * as OceanS from './ocean/OceanTimeDial.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

interface Props {
    hour: number;
    minute: number;
    onChange: (hour: number, minute: number) => void;
    step?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

const polar = (r: number, deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
};

const continueAngle = (from: number, to: number) => from + (((to - from + 540) % 360) - 180);

const HOUR_TICKS = Array.from({ length: 24 }, (_, i) => i);
const MIN_TICKS = Array.from({ length: 12 }, (_, i) => i);
const HOUR_LABELS = HOUR_TICKS.filter(i => i % 2 === 0);
const MIN_LABELS = [0, 15, 30, 45];
/** 다이얼 밑에서 한 번에 맞추는 분 */
const QUICK_MINUTES = [0, 10, 15, 20, 30, 40, 45, 50];

/** 바깥 고리(시)와 안쪽 고리(분)의 경계 — viewBox 단위. 안쪽 테두리 27, 바깥 46 의 사이 */
const RING_SPLIT = 31;
/** 손가락 한 바퀴에 흐르는 분. 바깥 고리는 멀리 갈 때, 안쪽 고리는 맞출 때 */
const MINUTES_PER_TURN = { outer: 360, inner: 60 } as const;

/**
 * 시각 다이얼 — 시계 용두를 돌리듯 쓴다.
 *
 * 짚는다고 값이 튀지 않는다. 손가락을 둘레로 돌린 각도만큼 시각이 흐른다:
 * 바깥 고리에서 한 바퀴 6시간(멀리 갈 때), 안쪽 고리에서 한 바퀴 1시간(맞출 때 — 5분이 30°).
 *
 * 왜 이렇게 — 예전에는 "짚은 각도 = 하루 중 시각" 이었다. 한 바퀴가 24시간이라 5분이 1.25°,
 * 다이얼 가장자리에서 2px 였다. 데스크톱은 휠로 5분씩 맞출 수 있었지만 폰에는 휠이 없어
 * 짚는 순간 ±50분이 흔들렸다. 그림(로마 숫자 고리·두 바늘)은 그대로 두고 손맛만 바꿨다.
 * 다이얼 밑의 단추(시 ±1 · 분 ±5)는 마지막 한 칸을 맞추는 용도다. 휠(5분)은 그대로.
 *
 * 데스크톱에서는 손가락 대신 자판과 마우스 포인터가 있다. 그래서 세 가지 길을 함께 둔다:
 *   - 적기: 다이얼 위 칸에 "14" "35" 를 바로 친다. 칸 안에서 ↑↓ 는 한 칸씩, 옆의 작은 화살표도 같은 일을 한다
 *   - 짚기: 문자판의 숫자(갈래마다 — S.HOUR_NAMES, Celestial 은 로마 숫자)를 누르면 그 시로 간다 (마우스는 정확하니까 짚어도 튀지 않는다)
 *   - 자주 쓰는 분(00·15·30·45)은 한 번 누르면 맞는다
 * 손가락은 여전히 다이얼을 돌린다.
 */
export default function TimeDial({ hour, minute, onChange, step = 5 }: Props) {
    const S = usePickTheme(STYLES);
    const f = useT().form;
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [grab, setGrab] = React.useState<"outer" | "inner" | null>(null);

    const total = hour * 60 + minute;
    const targetHourAngle = (total / 1440) * 360;
    const targetMinAngle = (minute / 60) * 360;

    const angles = React.useRef({ h: targetHourAngle, m: targetMinAngle });
    angles.current = {
        h: continueAngle(angles.current.h, targetHourAngle),
        m: continueAngle(angles.current.m, targetMinAngle),
    };

    // 이벤트 핸들러는 한 번만 붙이고, 최신 값은 ref 로 본다
    const live = React.useRef({ total, step, onChange });
    live.current = { total, step, onChange };

    const emitTotal = React.useCallback((next: number) => {
        const t = ((next % 1440) + 1440) % 1440;
        live.current.total = t;
        live.current.onChange(Math.floor(t / 60), t % 60);
    }, []);

    React.useEffect(() => {
        const el = svgRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const { total: cur, step: s } = live.current;
            emitTotal(cur + (e.deltaY > 0 ? s : -s));
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [emitTotal]);

    /** 손가락 자리 → 중심 기준 각도(0~360)와 거리(viewBox 단위) */
    const locate = React.useCallback((clientX: number, clientY: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return null;
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        return {
            ang: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360,
            dist: Math.hypot(dx, dy) / (rect.width / 100),
        };
    }, []);

    // 돌리는 동안의 상태: 마지막 각도, 아직 한 칸(step)이 안 된 자투리 분, 잡은 고리
    const drag = React.useRef<{ last: number; acc: number; ring: "outer" | "inner" } | null>(null);

    const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        e.preventDefault();
        const at = locate(e.clientX, e.clientY);
        if (!at) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const ring = at.dist > RING_SPLIT ? "outer" : "inner";
        drag.current = { last: at.ang, acc: 0, ring };
        setGrab(ring);
    };

    const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        const d = drag.current;
        if (!d) return;
        const at = locate(e.clientX, e.clientY);
        if (!at) return;
        // 0°/360° 경계를 넘어도 짧은 쪽으로 잰다
        let delta = at.ang - d.last;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        d.last = at.ang;

        d.acc += (delta * MINUTES_PER_TURN[d.ring]) / 360;
        const { step: s } = live.current;
        const steps = Math.trunc(d.acc / s);
        if (steps !== 0) {
            d.acc -= steps * s;
            emitTotal(live.current.total + steps * s);
        }
    };

    const endDrag = () => {
        drag.current = null;
        setGrab(null);
    };

    const bump = (minutes: number) => emitTotal(live.current.total + minutes);
    /** 문자판의 숫자를 짚었을 때 — 분은 그대로 두고 시만 옮긴다 */
    const pickHour = (h: number) => emitTotal(h * 60 + (live.current.total % 60));
    /** 자주 쓰는 분 — 시는 그대로 */
    const pickMinute = (m: number) => emitTotal(Math.floor(live.current.total / 60) * 60 + m);

    /* ── 적어 넣기 ────────────────────────────────────────────────────
       적는 동안에는 칸의 글자를 그대로 둔다("0" 을 치자마자 00 으로 튀지 않게).
       숫자가 자리에 맞으면 곧바로 반영하고, 칸을 떠나면 다시 값이 다스린다. */
    const [typing, setTyping] = React.useState<{ field: "h" | "m"; text: string } | null>(null);
    const shown = (field: "h" | "m") =>
        typing?.field === field ? typing.text : pad(field === "h" ? hour : minute);

    const onType = (field: "h" | "m", raw: string) => {
        const text = raw.replace(/\D/g, "").slice(0, 2);
        setTyping({ field, text });
        if (text === "") return;
        const n = Number(text);
        const cur = live.current.total;
        if (field === "h") {
            if (n > 23) return;
            emitTotal(n * 60 + (cur % 60));
        } else {
            if (n > 59) return;
            emitTotal(Math.floor(cur / 60) * 60 + n);
        }
    };

    const onTypeKey = (field: "h" | "m", e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        // 창 전체가 ↑↓ 로 날짜를 옮긴다 — 여기서 멈추지 않으면 시각을 올린 직후 날짜 쪽이 옛 시각으로 되돌린다
        e.preventDefault();
        e.stopPropagation();
        setTyping(null);
        const unit = field === "h" ? 60 : live.current.step;
        bump(e.key === "ArrowUp" ? unit : -unit);
    };

    return (
        <S.Wrap>
            <S.Entry>
                <S.Field>
                    <input
                        value={shown("h")}
                        onChange={(e) => onType("h", e.target.value)}
                        onKeyDown={(e) => onTypeKey("h", e)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={() => setTyping(null)}
                        inputMode="numeric"
                        maxLength={2}
                        aria-label={f.hourStep}
                    />
                    <span className="spin">
                        <button type="button" tabIndex={-1} aria-label={f.stepUp(f.hourStep)} onClick={() => bump(60)}>▲</button>
                        <button type="button" tabIndex={-1} aria-label={f.stepDown(f.hourStep)} onClick={() => bump(-60)}>▼</button>
                    </span>
                    <em>{f.hourStep}</em>
                </S.Field>
                <b>:</b>
                <S.Field>
                    <input
                        value={shown("m")}
                        onChange={(e) => onType("m", e.target.value)}
                        onKeyDown={(e) => onTypeKey("m", e)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={() => setTyping(null)}
                        inputMode="numeric"
                        maxLength={2}
                        aria-label={f.minuteStep}
                    />
                    <span className="spin">
                        <button type="button" tabIndex={-1} aria-label={f.stepUp(f.minuteStep)} onClick={() => bump(step)}>▲</button>
                        <button type="button" tabIndex={-1} aria-label={f.stepDown(f.minuteStep)} onClick={() => bump(-step)}>▼</button>
                    </span>
                    <em>{f.minuteStep}</em>
                </S.Field>
            </S.Entry>
            <S.Dial
                ref={svgRef}
                viewBox="0 0 100 100"
                role="slider"
                aria-label={f.timeAria}
                aria-valuetext={f.timeValue(pad(hour), pad(minute))}
                data-grab={grab ?? undefined}
                className={grab ? "dragging" : undefined}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
            >
                <circle cx="50" cy="50" r="46" className="rim" />
                {HOUR_TICKS.map(i => {
                    const long = i % 6 === 0;
                    const [x1, y1] = polar(long ? 45.6 : 46.8, i * 15);
                    const [x2, y2] = polar(48.2, i * 15);
                    return <line key={`h${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className={long ? "tick long" : "tick"} />;
                })}

                <circle cx="50" cy="50" r="27" className="rim inner" />
                {MIN_TICKS.map(i => {
                    const [x1, y1] = polar(25.2, i * 30);
                    const [x2, y2] = polar(27, i * 30);
                    return <line key={`m${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="tick faint" />;
                })}

                <g className="mhand" style={{ transform: `rotate(${angles.current.m}deg)` }}>
                    <line x1="50" y1="50" x2="50" y2="21.5" className="stem thin" />
                    <line x1="46.8" y1="26" x2="53.2" y2="26" className="cross thin" />
                </g>

                <g className="hand" style={{ transform: `rotate(${angles.current.h}deg)` }}>
                    <line x1="50" y1="50" x2="50" y2="6.5" className="stem" />
                    <line x1="45.4" y1="15" x2="54.6" y2="15" className="cross" />
                    <line x1="47.4" y1="22" x2="52.6" y2="22" className="cross faintCross" />
                    <rect x="47.6" y="4.1" width="4.8" height="4.8" transform="rotate(45 50 6.5)" className="tip" />
                </g>

                {/* 숫자를 짚으면 그 시로. 손가락으로 돌리던 사람에게는 그대로 돌아가는 다이얼이다 */}
                {HOUR_LABELS.map(i => {
                    const [x, y] = polar(41.5, i * 15);
                    const on = hour === i;
                    return (
                        <text
                            key={`t${i}`} x={x} y={y + 1.8} textAnchor="middle"
                            className={on ? "num on" : "num"}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => pickHour(i)}
                        >
                            {S.HOUR_NAMES[i]}
                        </text>
                    );
                })}
                {MIN_LABELS.map(v => {
                    const [x, y] = polar(20, (v / 60) * 360);
                    return <text key={`mm${v}`} x={x} y={y + 1.4} textAnchor="middle" className="mnum">{pad(v)}</text>;
                })}

                <rect x="47.4" y="47.4" width="5.2" height="5.2" transform="rotate(45 50 50)" className="hub" />
            </S.Dial>

            {/* 자주 쓰는 분 — 한 번에 맞춘다. 그 사이 값은 칸에 적거나 다이얼을 돌린다 */}
            <S.Quick role="group" aria-label={f.minuteStep}>
                {QUICK_MINUTES.map(v => (
                    <button
                        key={v} type="button"
                        data-on={minute === v ? "1" : "0"}
                        onClick={() => pickMinute(v)}
                        aria-label={`${f.minuteStep} ${pad(v)}`}
                    >
                        {pad(v)}
                    </button>
                ))}
            </S.Quick>
        </S.Wrap>
    );
}
