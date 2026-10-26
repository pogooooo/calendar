"use client";

import * as GemS from "./gem/GemRulerScroll.styles";
import * as React from "react";
import type { RulerScrollProps } from "./types";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialRulerScroll.styles";
import * as MapleS from "./maple/MapleRulerScroll.styles";
import * as OceanS from './ocean/OceanRulerScroll.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

/**
 * Celestial 눈금자 스크롤바.
 *
 * 눈금은 줄이 어디 있는지, 표지(별)는 그 줄에 무언가 들어 있는지 가리킨다.
 * 굴리기 전에 어디에 일이 몰려 있는지 보인다.
 *
 * 네이티브 막대는 감추지만 휠·터치 스크롤은 그대로 살아 있고,
 * 키보드로도 굴릴 수 있도록 스크롤 영역에 tabIndex 를 준다.
 */

interface TickMark {
    /** 레일 위 위치 (0~1) */
    at: number;
    label?: string;
    marked: boolean;
    color?: string;
    major: boolean;
}

export default function RulerScrollView({
    children, majorEvery = 3, className, flagFor,
}: RulerScrollProps) {
    const S = usePickTheme(STYLES);
    const areaRef = React.useRef<HTMLDivElement>(null);
    const railRef = React.useRef<HTMLDivElement>(null);
    const [ticks, setTicks] = React.useState<TickMark[]>([]);
    const [thumb, setThumb] = React.useState({ top: 0, height: 0 });
    const [flag, setFlag] = React.useState("");

    /**
     * sync 가 ticks 를 상태로 읽으면 정체성이 매번 바뀌고, 그게 아래 이펙트의
     * 의존성이라 measure → setTicks → sync 새로 → 이펙트 재실행 → measure …
     * 로 무한히 돈다. 그래서 sync 는 ref 로 읽는다.
     */
    const ticksRef = React.useRef<TickMark[]>([]);

    /** 줄을 훑어 눈금을 만든다. 내용이 바뀌면 다시 잰다. */
    const measure = React.useCallback(() => {
        const area = areaRef.current;
        if (!area) return;

        const rows = Array.from(area.querySelectorAll<HTMLElement>("[data-ruler-tick]"));
        const total = area.scrollHeight || 1;

        const next: TickMark[] = rows.map((row, i) => ({
            at: (row.offsetTop + row.offsetHeight / 2) / total,
            label: row.dataset.rulerLabel,
            marked: row.dataset.rulerMark !== undefined,
            color: row.dataset.rulerColor,
            major: i % majorEvery === 0,
        }));

        // 값이 그대로면 새 배열을 넣지 않는다. 관찰자가 자주 부르므로
        // 매번 상태를 갈아 끼우면 쓸데없는 렌더가 이어진다.
        const prev = ticksRef.current;
        const same = prev.length === next.length && prev.every((p, i) =>
            Math.abs(p.at - next[i].at) < 0.0005 &&
            p.label === next[i].label &&
            p.marked === next[i].marked &&
            p.color === next[i].color &&
            p.major === next[i].major);
        if (same) return;

        ticksRef.current = next;
        setTicks(next);
    }, [majorEvery]);

    const sync = React.useCallback(() => {
        const area = areaRef.current;
        if (!area) return;

        const total = area.scrollHeight || 1;
        const height = Math.max(0.08, area.clientHeight / total);
        const top = Math.min(area.scrollTop / total, 1 - height);
        setThumb((cur) =>
            (Math.abs(cur.top - top) < 0.0005 && Math.abs(cur.height - height) < 0.0005)
                ? cur
                : { top, height });

        const mid = (area.scrollTop + area.clientHeight / 2) / total;
        if (flagFor) { setFlag(flagFor(mid)); return; }

        // 이름표를 따로 주지 않으면 가장 가까운 긴 눈금의 글자를 쓴다.
        const labelled = ticksRef.current.filter((x) => x.major && x.label);
        if (labelled.length === 0) { setFlag(""); return; }
        setFlag(labelled.reduce((a, b) =>
            (Math.abs(b.at - mid) < Math.abs(a.at - mid) ? b : a)).label ?? "");
    }, [flagFor]);

    React.useEffect(() => {
        const area = areaRef.current;
        if (!area) return;

        const refresh = () => { measure(); sync(); };
        refresh();

        const ro = new ResizeObserver(refresh);
        ro.observe(area);
        Array.from(area.children).forEach((c) => ro.observe(c));

        const mo = new MutationObserver(refresh);
        mo.observe(area, { childList: true, subtree: true });

        return () => { ro.disconnect(); mo.disconnect(); };
    }, [measure, sync]);

    // ── 막대 끌기. Pointer Events 라 터치에서도 그대로 동작한다. ──────────
    const grabOffset = React.useRef<number | null>(null);

    const onGrab = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        grabOffset.current = e.clientY - e.currentTarget.getBoundingClientRect().top;
        e.preventDefault();
    };

    const onDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        const rail = railRef.current;
        const area = areaRef.current;
        if (grabOffset.current === null || !rail || !area) return;
        const box = rail.getBoundingClientRect();
        area.scrollTop = ((e.clientY - box.top - grabOffset.current) / box.height) * area.scrollHeight;
    };

    const onRelease = (e: React.PointerEvent<HTMLDivElement>) => {
        if (grabOffset.current === null) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        grabOffset.current = null;
    };

    /** 레일 빈 곳을 누르면 그 자리로 뛴다. */
    const onRailDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const area = areaRef.current;
        const rail = railRef.current;
        if (!area || !rail || e.target !== rail) return;
        const box = rail.getBoundingClientRect();
        const ratio = (e.clientY - box.top) / box.height;
        area.scrollTo({ top: ratio * area.scrollHeight - area.clientHeight / 2, behavior: "smooth" });
    };

    return (
        <S.Stage className={className}>
            <S.Area ref={areaRef} onScroll={sync} tabIndex={0}>
                {children}
            </S.Area>

            <S.Rail ref={railRef} onPointerDown={onRailDown}>
                {ticks.map((tk, i) => (
                    <React.Fragment key={i}>
                        <S.Tick $at={tk.at} $major={tk.major} />
                        {tk.major && tk.label && <S.TickLabel $at={tk.at}>{tk.label}</S.TickLabel>}
                        {tk.marked && <S.Mark $at={tk.at} $color={tk.color} />}
                    </React.Fragment>
                ))}

                <S.Thumb
                    $top={thumb.top}
                    $height={thumb.height}
                    onPointerDown={onGrab}
                    onPointerMove={onDrag}
                    onPointerUp={onRelease}
                    onPointerCancel={onRelease}
                />
                {flag && <S.Flag $at={thumb.top + thumb.height / 2}>{flag}</S.Flag>}
            </S.Rail>
        </S.Stage>
    );
}

/** 폰에서는 26px 를 떼어 주기엔 본문이 아깝다. 이름표를 접고 눈금만 남긴다. */
