"use client";
/**
 * Celestial 의 문양 — 금 선화. 직선(가로·세로)·동그라미·달·별·혼천의만 쓴다. 비스듬한 선·마름모는 쓰지 않는다
 * (사용자: "사선 디자인은 없애고 직선·달·별 문양·혼천의로, 대신 빈도·밀도는 높게").
 * 모두 currentColor 의 선이라 놓는 자리의 color 를 따른다. 글 위에 겹치지 않는 자리(여백·괘선·모서리)에만 놓는다.
 *
 * 좌표는 각 그림의 가운데(cx, cy)를 받는 <g> 조각이다 — 큰 그림(사이드바 기둥·바탕) 안에 그대로 끼워 넣는다.
 * 따로 쓸 때는 <OrnamentSvg> 로 감싼다.
 */
import * as React from "react";
import * as S from "./CelestialOrnaments.styles";

/** 좌표는 소수 둘째 자리까지 — 서버(Node)와 브라우저의 Math.cos·sin 은 끝자리가 달라, 그대로 쓰면 하이드레이션이 어긋났다 */
export const f = (n: number) => Number(n.toFixed(2));

/* ── 별 ─────────────────────────────────────────────────────────────── */

/** 네 갈래 별(오목한 반짝임) */
export const star4Path = (cx: number, cy: number, r: number) => {
    const k = r * 0.16;
    return `M${f(cx)} ${f(cy - r)}C${f(cx + k * 0.5)} ${f(cy - k * 1.5)} ${f(cx + k * 1.5)} ${f(cy - k * 0.5)} ${f(cx + r)} ${f(cy)}`
        + `C${f(cx + k * 1.5)} ${f(cy + k * 0.5)} ${f(cx + k * 0.5)} ${f(cy + k * 1.5)} ${f(cx)} ${f(cy + r)}`
        + `C${f(cx - k * 0.5)} ${f(cy + k * 1.5)} ${f(cx - k * 1.5)} ${f(cy + k * 0.5)} ${f(cx - r)} ${f(cy)}`
        + `C${f(cx - k * 1.5)} ${f(cy - k * 0.5)} ${f(cx - k * 0.5)} ${f(cy - k * 1.5)} ${f(cx)} ${f(cy - r)}Z`;
};

/** 여덟 갈래 별 — 가로·세로는 길고 사이는 짧다 */
export const star8Path = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8 - Math.PI / 2;
        const rr = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.5 : r * 0.17;
        pts.push(`${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`);
    }
    return `M${pts.join("L")}Z`;
};

export const Star4 = ({ cx, cy, r, className }: { cx: number; cy: number; r: number; className?: string }) =>
    <path className={className ?? "fill"} d={star4Path(cx, cy, r)} />;

export const Star8 = ({ cx, cy, r, className }: { cx: number; cy: number; r: number; className?: string }) =>
    <path className={className ?? "fill"} d={star8Path(cx, cy, r)} />;

/* ── 달 ─────────────────────────────────────────────────────────────── */

/**
 * 위상(0 삭 · 0.25 상현 · 0.5 보름 · 0.75 하현)의 밝은 쪽 — 북반구에서 보는 대로(차오를 때 오른쪽이 밝다).
 * 경계(터미네이터)는 가로 반지름 r·|cos 2πp| 의 타원 호다.
 */
export const litPath = (cx: number, cy: number, r: number, phase: number) => {
    const p = ((phase % 1) + 1) % 1;
    if (p < 0.005 || p > 0.995) return "";
    const rx = f(r * Math.abs(Math.cos(2 * Math.PI * p)));
    const top = `${f(cx)} ${f(cy - r)}`, bottom = `${f(cx)} ${f(cy + r)}`;
    if (p < 0.5) {
        // 차오름 — 오른쪽 반원, 경계는 초승(p<.25)이면 오른쪽으로, 상현 넘어 둥글면 왼쪽으로 부푼다
        return `M${top}A${r} ${r} 0 0 1 ${bottom}A${rx} ${r} 0 0 ${p < 0.25 ? 0 : 1} ${top}Z`;
    }
    // 이지러짐 — 왼쪽 반원
    return `M${top}A${r} ${r} 0 0 0 ${bottom}A${rx} ${r} 0 0 ${p < 0.75 ? 0 : 1} ${top}Z`;
};

/** 테두리 동그라미 + 그 위상만큼 찬 달 */
export const MoonDisc = ({ cx, cy, r, phase, ring = true }: { cx: number; cy: number; r: number; phase: number; ring?: boolean }) => (
    <g>
        {ring && <circle className="line" cx={f(cx)} cy={f(cy)} r={r} />}
        {Math.abs(phase - 0.5) < 0.005
            ? <circle className="fill" cx={f(cx)} cy={f(cy)} r={r} />
            : <path className="fill" d={litPath(cx, cy, r, phase)} />}
    </g>
);

/** 초승달 (C 꼴, 열린 쪽이 오른쪽) — 바깥 호와 안쪽 호 */
export const crescentPath = (cx: number, cy: number, r: number) => {
    const inner = r * .86, offset = r * .46;
    // Both arcs meet at the actual intersection of their circles. An undersized
    // inner radius made SVG enlarge the old arc, deforming the crescent.
    const x = (r*r - inner*inner + offset*offset) / (2*offset);
    const y = Math.sqrt(Math.max(0,r*r - x*x));
    const top = `${f(cx+x)} ${f(cy-y)}`, bottom = `${f(cx+x)} ${f(cy+y)}`;
    return `M${top}A${f(r)} ${f(r)} 0 1 0 ${bottom}A${f(inner)} ${f(inner)} 0 ${x>offset?1:0} 1 ${top}Z`;
};

/* ── 해와 달 문장 (가운데 초승달, 둘레에 빛살, 점선 테) ───────────────────── */

export const SunMoon = ({ cx, cy, r, rays = 32 }: { cx: number; cy: number; r: number; rays?: number }) => (
    <g>
        <circle className="line dash" cx={cx} cy={cy} r={r} />
        {Array.from({ length: rays }, (_, i) => {
            const a = (i / rays) * Math.PI * 2;
            const r1 = r * 0.42, r2 = i % 2 ? r * 0.78 : r * 0.88;
            return <line key={i} className="hair" x1={f(cx + r1 * Math.cos(a))} y1={f(cy + r1 * Math.sin(a))} x2={f(cx + r2 * Math.cos(a))} y2={f(cy + r2 * Math.sin(a))} />;
        })}
        <path className="line" d={crescentPath(cx, cy, r * 0.32)} />
        <path className="line" d={crescentPath(cx - r * 0.05, cy, r * 0.24)} />
    </g>
);

/* ── 혼천의 (자오환·적도환·황도환·축) ───────────────────────────────────── */

/** 기울어진 고리의 길 — offset-path 로 행성을 돌릴 때도 쓴다 */
export const ringPath = (cx: number, cy: number, rx: number, ry: number, tilt = 0) =>
    `M${f(cx - rx * Math.cos((tilt * Math.PI) / 180))} ${f(cy - rx * Math.sin((tilt * Math.PI) / 180))}`
    + `A${rx} ${ry} ${tilt} 1 1 ${f(cx + rx * Math.cos((tilt * Math.PI) / 180))} ${f(cy + rx * Math.sin((tilt * Math.PI) / 180))}`
    + `A${rx} ${ry} ${tilt} 1 1 ${f(cx - rx * Math.cos((tilt * Math.PI) / 180))} ${f(cy - rx * Math.sin((tilt * Math.PI) / 180))}`;

export const Armillary = ({ cx, cy, r, axis = 1.35, planet = true }: { cx: number; cy: number; r: number; axis?: number; planet?: boolean }) => {
    const tilt = -23.4;
    return (
        <g>
            <line className="hair" x1={cx} y1={f(cy - r * axis)} x2={cx} y2={f(cy + r * axis)} />
            <circle className="fill" cx={cx} cy={f(cy - r * axis)} r={f(Math.max(1, r * 0.05))} />
            <circle className="fill" cx={cx} cy={f(cy + r * axis)} r={f(Math.max(1, r * 0.05))} />
            <circle className="line" cx={cx} cy={cy} r={r} />
            <circle className="hair" cx={cx} cy={cy} r={f(r * 0.86)} />
            <ellipse className="line" cx={cx} cy={cy} rx={r} ry={f(r * 0.26)} />
            <path className="line" d={ringPath(cx, cy, r, r * 0.3, tilt)} />
            <ellipse className="hair" cx={cx} cy={cy} rx={f(r * 0.3)} ry={r} />
            <circle className="fill" cx={cx} cy={cy} r={f(r * 0.13)} />
            {planet && <circle className="fill orbiter" r={f(Math.max(1.2, r * 0.07))} style={{ offsetPath: `path("${ringPath(cx, cy, r, r * 0.3, tilt)}")` }} />}
        </g>
    );
};

/* ── 궤도 (동그라미 + 그 위의 행성) ──────────────────────────────────────── */

export const Orbit = ({ cx, cy, r, at = 0, size = 2, dashed = false, hollow = false, spin = false }: {
    cx: number; cy: number; r: number; at?: number; size?: number; dashed?: boolean; hollow?: boolean; spin?: boolean;
}) => {
    const a = (at - 90) * Math.PI / 180;
    return (
        <g>
            <circle className={dashed ? "line dash" : "line"} cx={f(cx)} cy={f(cy)} r={r} />
            {spin
                ? <circle className={`${hollow ? "line" : "fill"} orbiter`} r={size} style={{ offsetPath: `path("M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}")`, offsetDistance: `${(at / 360) * 100}%` }} />
                : <circle className={hollow ? "line" : "fill"} cx={f(cx + r * Math.cos(a))} cy={f(cy + r * Math.sin(a))} r={size} />}
        </g>
    );
};

/* ── 따로 쓰는 그림 ──────────────────────────────────────────────────── */

/** 문양 하나를 제 크기의 svg 로 */
export function OrnamentSvg({ size, height, children, className, label }: {
    size: number; height?: number; children: React.ReactNode; className?: string; label?: string;
}) {
    const h = height ?? size;
    return (
        <S.Svg className={className} width={size} height={h} viewBox={`0 0 ${size} ${h}`} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
            {children}
        </S.Svg>
    );
}

/** 달의 위상 줄 — 삭에서 보름을 지나 다시 삭으로. 머리글·괘선 끝에 */
export function PhaseStrip({ count = 9, r = 3, gap = 5, className }: { count?: number; r?: number; gap?: number; className?: string }) {
    const w = count * r * 2 + (count - 1) * gap;
    return (
        <OrnamentSvg size={w + 2} height={r * 2 + 2} className={className}>
            {Array.from({ length: count }, (_, i) => (
                <MoonDisc key={i} cx={1 + r + i * (r * 2 + gap)} cy={1 + r} r={r} phase={count === 1 ? 0.5 : i / (count - 1)} />
            ))}
        </OrnamentSvg>
    );
}

/** 끝에 점을 단 가로 괘선 — 가운데에 작은 문양 하나(별·달) */
export function DotRule({ mid = "star", className }: { mid?: "star" | "moon" | "none"; className?: string }) {
    return (
        <S.Rule className={className} aria-hidden="true">
            <i className="end" />
            <span className="line" />
            {mid !== "none" && (
                <S.RuleMid width="12" height="12" viewBox="0 0 12 12">
                    {mid === "star" ? <Star4 cx={6} cy={6} r={5.5} /> : <MoonDisc cx={6} cy={6} r={4} phase={0.5} />}
                </S.RuleMid>
            )}
            {mid !== "none" && <span className="line" />}
            <i className="end" />
        </S.Rule>
    );
}
