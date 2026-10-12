"use client";
import { useEffect, useRef } from 'react';
import { useTheme } from 'styled-components';
import useThemeMotion from '@/hooks/useThemeMotion';
import * as S from './CelestialAtmosphere.styles';
import { Armillary, MoonDisc, Orbit, Star4, Star8, SunMoon, f } from '@/components/ornament/celestial/CelestialOrnaments';
import { createSky } from './celestialSky';

type Bead = { top: string; kind: 'orb' | 'star' | 'moon' | 'dash' | 'armillary' | 'dot' | 'loop'; phase?: number };

/**
 * 오른쪽 가장자리 세로 금선 위의 문양 — 화면 높이에 맞춰 퍼센트 자리에, 4% 마다 하나씩 촘촘히.
 * 위에서 아래로 달이 차고 기운다(삭 → 보름 → 삭). 사이사이 점·네 갈래 별·고리, 위엔 궤도, 아래엔 혼천의.
 * 모두 지름 16px 안 — 금선에서 8px 넘게 나가지 않아 오른쪽 끝의 글에 닿지 않는다.
 */
const RAIL: Bead[] = Array.from({ length: 22 }, (_, i): Bead => {
    const top = `${8 + i * 4}%`;
    if (i === 1) return { top, kind: 'orb' };
    if (i === 20) return { top, kind: 'armillary' };
    if (i === 10) return { top, kind: 'dash' };
    switch (i % 4) {
        case 0: return { top, kind: 'moon', phase: Math.round((i / 21) * 8) / 8 };
        case 2: return { top, kind: i % 8 === 2 ? 'star' : 'loop' };
        default: return { top, kind: 'dot' };
    }
});

/**
 * Celestial 의 바탕 — 오른쪽 위 모서리에 걸친 큰 천체 궤도(겹고리·점선 고리·행성·달), 오른쪽 가장자리를 따라 내려오는 세로 금선과
 * 그 위에 꿴 문양, 그리고 가만히 있어도 반짝이며 손에 반응하는 별하늘(celestialSky — 커서를 비추면 숨은 별이 드러나고, 가끔 별이 곧게 떨어지고,
 * 누르면 고리가 번진다. 큰 궤도·해와 달도 커서를 따라 조금 비킨다). 비스듬한 선(별자리 잇는 선·비스듬한 별똥)은 없다. 글 뒤에 깔리므로 옅다.
 */
export default function CelestialAtmosphere() {
    const skyRef = useRef<HTMLDivElement>(null);
    const starsRef = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const dark = theme.mode === 'dark';
    const gold = theme.colors.primary;

    useEffect(() => {
        const canvas = starsRef.current, host = skyRef.current;
        if (!canvas || !host) return;
        const sky = createSky(canvas, { dark, motion, gold, host });
        return () => sky.dispose();
    }, [dark, motion, gold]);

    return <S.Sky ref={skyRef} aria-hidden="true" data-ambient="celestial">
        <canvas className="stars" ref={starsRef} />
        <svg className="orrery" viewBox="0 0 640 640">
            <circle className="hair" cx="320" cy="320" r="314" />
            <circle className="line dash" cx="320" cy="320" r="286" />
            <g className="o1"><Orbit cx={320} cy={320} r={248} at={208} size={5} spin /></g>
            <circle className="hair" cx="320" cy="320" r="232" />
            <g className="o2"><Orbit cx={320} cy={320} r={196} at={236} size={3.4} hollow spin /></g>
            <MoonDisc cx={f(320 + 196 * Math.cos((156 * Math.PI) / 180))} cy={f(320 + 196 * Math.sin((156 * Math.PI) / 180))} r={13} phase={0.62} />
            <circle className="line dash" cx="320" cy="320" r="150" />
            {Array.from({ length: 72 }, (_, i) => {
                const a = (i / 72) * Math.PI * 2;
                const r2 = i % 6 === 0 ? 300 : 306;
                return <line key={i} className="hair" x1={f(320 + 314 * Math.cos(a))} y1={f(320 + 314 * Math.sin(a))} x2={f(320 + r2 * Math.cos(a))} y2={f(320 + r2 * Math.sin(a))} />;
            })}
            <Armillary cx={320} cy={320} r={86} axis={1.5} />
            <Star8 cx={92} cy={398} r={12} />
            <Star4 cx={176} cy={540} r={7} />
        </svg>
        <svg className="halo" viewBox="0 0 240 240">
            <SunMoon cx={120} cy={120} r={110} rays={48} />
        </svg>

        <span className="rail" />
        {/* 곁줄 — 금선 안쪽으로 나란히 내려오는 가는 선 (끝에 점) */}
        <span className="rail side" />
        {RAIL.map(({ top, kind, phase }) => (
            <svg key={top} className={`bead ${kind}`} style={{ top }} viewBox="-20 -20 40 40">
                {kind === 'orb' && <Orbit cx={0} cy={0} r={7} at={30} size={1.6} />}
                {kind === 'dot' && <circle className="fill" cx={0} cy={0} r={1.5} />}
                {kind === 'star' && <Star4 cx={0} cy={0} r={6} />}
                {kind === 'loop' && <circle className="line" cx={0} cy={0} r={3.2} />}
                {kind === 'moon' && <MoonDisc cx={0} cy={0} r={5.5} phase={phase ?? 0.5} />}
                {kind === 'dash' && <><circle className="line dash" cx={0} cy={0} r={8} /><circle className="fill" cx={0} cy={0} r={2} /></>}
                {kind === 'armillary' && <Armillary cx={0} cy={0} r={7.5} axis={1.4} planet={false} />}
            </svg>
        ))}

    </S.Sky>;
}
