"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import * as S from "./CelestialTimeDial.styles";

interface Props {
    hour: number;
    minute: number;
    onChange: (hour: number, minute: number) => void;
    step?: number;
}

const ROMAN = [
    "XXIV", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
    "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII",
];

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

export default function CelestialTimeDial({ hour, minute, onChange, step = 5 }: Props) {
    const f = useT().form;
    const svgRef = React.useRef<SVGSVGElement>(null);
    const dragging = React.useRef(false);

    const total = hour * 60 + minute;
    const targetHourAngle = (total / 1440) * 360;
    const targetMinAngle = (minute / 60) * 360;

    const angles = React.useRef({ h: targetHourAngle, m: targetMinAngle });
    angles.current = {
        h: continueAngle(angles.current.h, targetHourAngle),
        m: continueAngle(angles.current.m, targetMinAngle),
    };

    const wheelRef = React.useRef({ total, step, onChange });
    wheelRef.current = { total, step, onChange };

    React.useEffect(() => {
        const el = svgRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const { total: cur, step: s, onChange: cb } = wheelRef.current;
            const next = ((cur + (e.deltaY > 0 ? s : -s)) % 1440 + 1440) % 1440;
            wheelRef.current.total = next;
            cb(Math.floor(next / 60), next % 60);
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const apply = React.useCallback((clientX: number, clientY: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        const ang = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
        const mins = (Math.round((ang / 360) * 1440 / step) * step) % 1440;
        onChange(Math.floor(mins / 60), mins % 60);
    }, [onChange, step]);

    return (
        <S.Wrap>
            <S.Dial
                ref={svgRef}
                viewBox="0 0 100 100"
                role="slider"
                aria-label={f.timeAria}
                aria-valuetext={f.timeValue(pad(hour), pad(minute))}
                onPointerDown={(e) => {
                    e.preventDefault();
                    dragging.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    apply(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => { if (dragging.current) apply(e.clientX, e.clientY); }}
                onPointerUp={() => { dragging.current = false; }}
                onPointerCancel={() => { dragging.current = false; }}
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

                {HOUR_LABELS.map(i => {
                    const [x, y] = polar(41.5, i * 15);
                    const on = hour === i;
                    return (
                        <text key={`t${i}`} x={x} y={y + 1.8} textAnchor="middle" className={on ? "num on" : "num"}>
                            {ROMAN[i]}
                        </text>
                    );
                })}
                {MIN_LABELS.map(v => {
                    const [x, y] = polar(20, (v / 60) * 360);
                    return <text key={`mm${v}`} x={x} y={y + 1.4} textAnchor="middle" className="mnum">{pad(v)}</text>;
                })}

                <rect x="47.4" y="47.4" width="5.2" height="5.2" transform="rotate(45 50 50)" className="hub" />
            </S.Dial>
        </S.Wrap>
    );
}
