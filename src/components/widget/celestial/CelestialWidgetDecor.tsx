"use client";
/**
 * Celestial 위젯의 바탕 무늬 — 앱의 하늘(CelestialAtmosphere)을 그대로 작게: 오른쪽 위 모서리에 걸친 큰 천체 궤도(겹고리·점선 고리·
 * 눈금 고리·행성·달·혼천의), 빛이 번지는 별하늘(점 별 — 큰 것은 둘레에 옅은 빛, 네 갈래 별은 오른쪽에만), 아래의 해와 달 문장,
 * 금선 두 겹 테와 거기 꿴 네 갈래 별·양옆 눈금·아래 테의 달 위상 줄. 직선·달·별·혼천의만 — 사선·마름모는 없다.
 * (사용자: "다른 위젯에서도 테마의 느낌이 잘 보이게 — 오션처럼 물결이 보인다던가")
 * 네 갈래 별은 왼쪽 띠(체크 칸이 있는 자리)에 두지 않는다 — 칸 안에 별이 비치면 고른 표시처럼 읽혔다.
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 들어오면 별이 차례로 한 번 반짝이고
 * 위상 줄의 달이 차례로 부풀고 궤도가 조금 돈다(useHoverOnce). 글 뒤에 깔리고 누르는 것은 받지 않는다.
 */
import { useId, useMemo, useRef } from "react";
import * as S from "./CelestialWidgetDecor.styles";
import { Armillary, MoonDisc, Orbit, Star4, Star8, SunMoon, f, star4Path } from "@/components/ornament/celestial/CelestialOrnaments";
import useHoverOnce from "@/hooks/useHoverOnce";
import { seededRandom } from "../seededRandom";
import type { WidgetKind } from "@/store/useWidgetStore";

/** 아래 테의 위상 줄 — 삭에서 보름을 지나 다시 삭으로 */
const PHASES = 9, PR = 3, PGAP = 6;
const PW = PHASES * PR * 2 + (PHASES - 1) * PGAP;

/** 궤도 바깥 눈금 — 앱의 것과 같은 72칸(6칸마다 길게) */
const TICKS = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const r2 = i % 6 === 0 ? 300 : 306;
    return { x1: f(320 + 314 * Math.cos(a)), y1: f(320 + 314 * Math.sin(a)), x2: f(320 + r2 * Math.cos(a)), y2: f(320 + r2 * Math.sin(a)) };
});
const MOON_AT = { cx: f(320 + 196 * Math.cos((156 * Math.PI) / 180)), cy: f(320 + 196 * Math.sin((156 * Math.PI) / 180)) };

export default function CelestialWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 1800);
    const glow = `${useId().replace(/[^\w-]/g, "")}-glow`;
    const { dots, sparks } = useMemo(() => {
        const r = seededRandom(`celestial:${kind}`);
        // 깊이 세 겹 — 먼 별은 작고 옅게, 가까운 별은 크고 둘레에 빛이 번진다(앱의 celestialSky 와 같은 결)
        const dots = Array.from({ length: 70 }, (_, i) => {
            const z = i % 7 === 0 ? 0.8 + r() * 0.2 : i % 3 === 0 ? 0.55 + r() * 0.25 : 0.3 + r() * 0.25;
            return { x: f(6 + r() * 388), y: f(6 + r() * 288), r: f(0.4 + z * 1.05), a: f(0.35 + z * 0.65), glow: z > 0.78, delay: f(r() * 0.8) };
        });
        // 네 갈래 별은 오른쪽 넉넉한 자리에만(x 가 판의 40% 넘는 곳) — 왼쪽 띠에는 체크 칸이 있다
        const sparks = Array.from({ length: 6 }, () => ({ x: f(165 + r() * 225), y: f(16 + r() * 268), r: f(3.2 + r() * 3.4), delay: f(r() * 0.8) }));
        return { dots, sparks };
    }, [kind]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor" data-busy={busy || undefined}>
            <svg className="sky" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <radialGradient id={glow}>
                        <stop offset="0" stopColor="currentColor" stopOpacity="0.5" />
                        <stop offset="0.32" stopColor="currentColor" stopOpacity="0.13" />
                        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                    </radialGradient>
                </defs>
                {dots.map((s, i) => (
                    <g key={i} className="star" style={{ animationDelay: `${s.delay}s`, opacity: s.a }}>
                        {s.glow && <circle cx={s.x} cy={s.y} r={f(s.r * 5)} fill={`url(#${glow})`} stroke="none" />}
                        <circle className="fill" cx={s.x} cy={s.y} r={s.r} />
                    </g>
                ))}
                {sparks.map((s, i) => (
                    <g key={`s${i}`} className="star" style={{ animationDelay: `${s.delay}s` }}>
                        <circle cx={s.x} cy={s.y} r={f(s.r * 3)} fill={`url(#${glow})`} stroke="none" />
                        <path className="fill" d={star4Path(s.x, s.y, s.r)} />
                    </g>
                ))}
            </svg>

            {/* 오른쪽 위 모서리에 걸친 큰 천체 궤도 — 앱의 바탕과 같은 그림(가운데가 모서리 가까이) */}
            <svg className="orrery" viewBox="0 0 640 640">
                <g className="turn">
                    <circle className="hair" cx="320" cy="320" r="314" />
                    <circle className="line dash" cx="320" cy="320" r="286" />
                    <Orbit cx={320} cy={320} r={248} at={208} size={5} />
                    <circle className="hair" cx="320" cy="320" r="232" />
                    <Orbit cx={320} cy={320} r={196} at={236} size={3.4} hollow />
                    <MoonDisc cx={MOON_AT.cx} cy={MOON_AT.cy} r={13} phase={0.62} />
                    <circle className="line dash" cx="320" cy="320" r="150" />
                    {TICKS.map((t, i) => <line key={i} className="hair" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />)}
                    <Armillary cx={320} cy={320} r={86} axis={1.5} planet={false} />
                    <Star8 cx={92} cy={398} r={12} />
                    <Star4 cx={176} cy={540} r={7} />
                </g>
            </svg>

            {/* 아래의 해와 달 — 앱 바탕의 아래 문장, 아주 옅게 */}
            <svg className="halo" viewBox="0 0 240 240">
                <SunMoon cx={120} cy={120} r={110} rays={48} />
            </svg>

            <S.Frame><i /><i /><i /><i /><i /><i /><i /><i /></S.Frame>
            <svg className="phases" viewBox={`-1 -1 ${PW + 2} ${PR * 2 + 2}`} width={PW + 2} height={PR * 2 + 2}>
                {Array.from({ length: PHASES }, (_, i) => (
                    <g key={i} className="moon" style={{ animationDelay: `${f(i * 0.07)}s` }}>
                        <MoonDisc cx={PR + i * (PR * 2 + PGAP)} cy={PR} r={PR} phase={i / (PHASES - 1)} />
                    </g>
                ))}
            </svg>
        </S.Decor>
    );
}
