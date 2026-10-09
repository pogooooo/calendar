import * as S from './CelestialAtmosphere.styles';
import { Armillary, MoonDisc, Orbit, Star4, Star8, SunMoon, f } from '@/components/ornament/celestial/CelestialOrnaments';

/** 오른쪽 가장자리 세로 금선 위의 문양 — 화면 높이에 맞춰 퍼센트 자리에 */
const RAIL: { top: string; kind: 'orb' | 'star' | 'moon' | 'dash' | 'armillary' | 'dot' }[] = [
    { top: '14%', kind: 'orb' }, { top: '22%', kind: 'dot' }, { top: '31%', kind: 'star' }, { top: '40%', kind: 'dot' },
    { top: '49%', kind: 'moon' }, { top: '58%', kind: 'dot' }, { top: '67%', kind: 'dash' }, { top: '76%', kind: 'dot' }, { top: '86%', kind: 'armillary' },
];

/**
 * Celestial 의 바탕 — 오른쪽 위 모서리에 걸친 큰 천체 궤도(겹고리·점선 고리·행성·달), 오른쪽 가장자리를 따라 내려오는 세로 금선과
 * 그 위에 꿴 문양, 그리고 반짝이는 점·별. 비스듬한 선(별자리 잇는 선·별똥)은 없다. 글 뒤에 깔리므로 아주 옅다.
 */
export default function CelestialAtmosphere() {
    return <S.Sky aria-hidden="true" data-ambient="celestial">
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
        {RAIL.map(({ top, kind }) => (
            <svg key={top} className={`bead ${kind}`} style={{ top }} viewBox="-20 -20 40 40">
                {kind === 'orb' && <Orbit cx={0} cy={0} r={9} at={30} size={1.8} />}
                {kind === 'dot' && <circle className="fill" cx={0} cy={0} r={1.6} />}
                {kind === 'star' && <Star4 cx={0} cy={0} r={7} />}
                {kind === 'moon' && <MoonDisc cx={0} cy={0} r={8} phase={0.25} />}
                {kind === 'dash' && <><circle className="line dash" cx={0} cy={0} r={11} /><circle className="line" cx={3} cy={3} r={6} /></>}
                {kind === 'armillary' && <Armillary cx={0} cy={0} r={11} axis={1.5} planet={false} />}
            </svg>
        ))}

        {Array.from({ length: 30 }, (_, i) => (
            <i key={i} className={i % 4 === 0 ? 'glint star' : 'glint'}
               style={{ left: `${(i * 37 + 9) % 100}%`, top: `${(i * 53 + 7) % 100}%`, animationDelay: `-${i % 8}s`, animationDuration: `${5 + (i % 5)}s` }} />
        ))}
    </S.Sky>;
}
