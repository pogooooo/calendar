"use client";

import * as React from "react";
import type { AnniversaryType } from "@/store/useAnniversaryStore";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/AnniversaryCrown.styles";
import * as MapleS from "./maple/AnniversaryCrown.styles";
import * as OceanS from './ocean/AnniversaryCrown.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

interface Props {
    items: AnniversaryType[];
    /** 날짜 숫자 (월간). 없으면 링 안이 비어 엠블럼만 표시된다 (주간) */
    children?: React.ReactNode;
    /** 오늘이면 링이 숨쉬고, 호버 시 빛이 링을 한 바퀴 훑는다 */
    today?: boolean;
    /** 셀 오른쪽 끝에 놓일 때: 이름이 왼쪽으로 펼쳐지게 뒤집는다 */
    flip?: boolean;
}


/**
 * 기념일이 있는 날의 날짜에 씌우는 '관'.
 * 호버하면 이름이 옆으로 펼쳐지고, 여러 개면 휠로 위아래로 넘긴다.
 */
export default function AnniversaryCrown({ items, children, today = false, flip = false }: Props) {
    const S = usePickTheme(STYLES);
    const reelRef = React.useRef<HTMLDivElement>(null);
    const [active, setActive] = React.useState(0);

    const multi = items.length > 1;

    const syncActive = React.useCallback(() => {
        const reel = reelRef.current;
        if (!reel) return;
        setActive(Math.round(reel.scrollTop / S.ROW));
    }, [S.ROW]);

    // 관 위에서 휠을 굴리면 이름이 한 칸씩 넘어간다.
    // 끝에 닿으면 막지 않아 페이지 스크롤로 자연스럽게 이어진다.
    const handleWheel = (e: React.WheelEvent) => {
        const reel = reelRef.current;
        if (!reel || !multi) return;
        const before = reel.scrollTop;
        reel.scrollTop += Math.sign(e.deltaY) * S.ROW;
        if (reel.scrollTop !== before) e.preventDefault();
    };

    if (items.length === 0) return <>{children}</>;

    return (
        <S.Root
            $multi={multi}
            $today={today}
            $flip={flip}
            onWheel={handleWheel}
            aria-label={items.map((a) => a.title).join(", ")}
        >
            <S.Ring>
                <svg viewBox="0 0 34 34" aria-hidden>
                    <circle className="ring" cx="17" cy="17" r="13.5" />
                    {multi && <circle className="ring2" cx="17" cy="17" r="16" />}
                    <path
                        className="jewel"
                        d="M17 0.8C17 8 17 8 19.6 8C17 8 17 8 17 15.2C17 8 17 8 14.4 8C17 8 17 8 17 0.8Z"
                    />
                    {today && <circle className="S.sweep" cx="17" cy="17" r="13.5" />}
                    <circle className="bead" r="1.5" />
                </svg>
                {children != null && <b className="dn">{children}</b>}
            </S.Ring>

            <S.Reveal $multi={multi} $flip={flip}>
                <div
                    className="reel"
                    ref={reelRef}
                    onScroll={syncActive}
                >
                    {items.map((a, i) => (
                        <span key={a.id} className={i === active ? "nm on" : "nm"} title={a.title}>
                            {a.title}
                        </span>
                    ))}
                </div>
                <span className="rule" />
                {multi && <span className="idx">{Math.min(active + 1, items.length)}/{items.length}</span>}
            </S.Reveal>
        </S.Root>
    );
}

/* ── 등장 ─────────────────────────────────────────────── */
