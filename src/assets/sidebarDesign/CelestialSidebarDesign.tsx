import { useEffect, useRef } from "react";
import * as S from "./CelestialSidebarDesign.styles";
import { Armillary, MoonDisc, Orbit, Star4, Star8, SunMoon } from "@/components/ornament/celestial/CelestialOrnaments";

/** 사이드바 경계선(세로 금선)의 x — 그림 전체가 이 축에 꿰인다 */
const AX = 102.4;

/**
 * 사이드바 경계에 꿰인 천체 기둥 — 고리·해와 달·반달·보름과 팔각별·혼천의를 한 축에 쌓고,
 * 내비 옆으로는 작은 별·점·고리가 일정한 간격으로 이어진다. 비스듬한 선 없이 세로선·동그라미·달·별만.
 * 큰 그림은 프로필과 내비 사이의 빈 자리에만, 내비 옆의 것은 축에서 ±10 안쪽이라 글자에 닿지 않는다.
 * 경계에 올리면 행성들이 빨리 돈다.
 */
const CelestialSidebarDesign = ({ isHovered = false }: { isHovered?: boolean }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const rafRef = useRef(0);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const anims = [...svg.querySelectorAll(".orbiter")].flatMap(el =>
            typeof el.getAnimations === "function" ? el.getAnimations() : []
        );
        if (anims.length === 0) return;
        const target = isHovered ? 6 : 1;
        cancelAnimationFrame(rafRef.current);
        const step = () => {
            let settled = true;
            anims.forEach(anim => {
                const next = anim.playbackRate + (target - anim.playbackRate) * 0.06;
                if (Math.abs(next - target) < 0.02) anim.playbackRate = target;
                else { anim.playbackRate = next; settled = false; }
            });
            if (!settled) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isHovered]);

    /* 내비 옆의 작은 문양 — 별·점·고리·점선 고리가 번갈아 */
    const beads = [400, 452, 504, 556, 608, 660, 712, 764];

    return (
        <S.AnimatedSvg aria-hidden="true" data-ambient="celestial-sidebar" ref={svgRef} $hovered={isHovered}
            width="160" height="954" viewBox="0 0 160 954" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 축 — 큰 그림 사이사이로 이어진다 */}
            <line className="line axis" x1={AX} y1={0} x2={AX} y2={57} />
            <line className="line axis" x1={AX} y1={87} x2={AX} y2={94} />
            <line className="line axis" x1={AX} y1={142} x2={AX} y2={148} />
            <line className="line axis" x1={AX} y1={364} x2={AX} y2={954} />
            <circle className="fill" cx={AX} cy={57} r={1.6} />

            {/* 곁줄 — 축 옆으로 나란히 내려오는 가는 선 둘(끝에 점) */}
            <line className="hair" x1={AX + 15} y1={14} x2={AX + 15} y2={96} />
            <circle className="fill" cx={AX + 15} cy={14} r={1.8} />
            <line className="hair" x1={AX - 13} y1={152} x2={AX - 13} y2={214} />
            <circle className="fill" cx={AX - 13} cy={214} r={1.6} />
            <line className="hair" x1={AX + 14} y1={300} x2={AX + 14} y2={392} />
            <circle className="fill" cx={AX + 14} cy={392} r={1.6} />

            {/* 고리 하나 */}
            <g className="orb o1"><Orbit cx={AX} cy={72} r={14} at={60} size={1.7} spin /></g>

            {/* 해와 달 — 점선 테, 빛살, 초승달 */}
            <g className="sun"><SunMoon cx={AX} cy={118} r={23} /></g>

            {/* 반달을 품은 궤도 — 바깥에 행성 둘 */}
            <g className="orb o2">
                <Orbit cx={AX} cy={182} r={27} at={40} size={3} spin />
                <Orbit cx={AX} cy={182} r={27} at={220} size={2.4} hollow spin />
                <MoonDisc cx={AX} cy={182} r={15} phase={0.25} />
                <circle className="line" cx={AX - 27} cy={182} r={3.6} />
            </g>

            {/* 보름과 팔각별 — 겹고리 */}
            <g className="orb o3">
                <Orbit cx={AX} cy={262} r={36} at={300} size={3.4} spin />
                <circle className="line" cx={AX} cy={262} r={29} />
                <circle className="fill" cx={AX - 9} cy={262} r={12} />
                <Star8 cx={AX + 17} cy={262} r={7.5} />
                <circle className="line" cx={AX + 8} cy={262 + 29} r={3.2} />
            </g>
            <Star4 cx={AX - 30} cy={300} r={4.5} />

            {/* 혼천의 */}
            <g className="orb o4"><Armillary cx={AX} cy={336} r={20} axis={1.4} /></g>

            {/* 내비 옆 — 축에 꿴 작은 문양들 */}
            {beads.map((y, i) => {
                const k = i % 4;
                if (k === 0) return <Star4 key={y} cx={AX} cy={y} r={4.2} className="fill twinkle" />;
                if (k === 1) return <circle key={y} className="fill" cx={AX} cy={y} r={1.8} />;
                if (k === 2) return <circle key={y} className="line" cx={AX} cy={y} r={4.5} />;
                return <circle key={y} className="line dash" cx={AX} cy={y} r={7} />;
            })}

            {/* 아래 — 점선 고리와 고리가 겹치고, 곁줄이 내려와 점으로 끝난다 */}
            <circle className="line dash" cx={AX - 4} cy={828} r={16} />
            <g className="orb o5"><Orbit cx={AX + 3} cy={846} r={12} at={150} size={1.8} spin /></g>
            <line className="hair" x1={AX + 18} y1={790} x2={AX + 18} y2={900} />
            <circle className="fill" cx={AX + 18} cy={900} r={1.6} />
            <Star4 cx={AX} cy={890} r={5} className="fill twinkle" />
            <circle className="fill" cx={AX} cy={946} r={1.6} />
        </S.AnimatedSvg>
    );
};

export default CelestialSidebarDesign;
