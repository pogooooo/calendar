"use client";

import * as React from "react";
import AnniversaryIcon from "@/assets/celestial/AnniversaryIcons";
import type { AnniversaryType } from "@/store/useAnniversaryStore";
import * as S from "./AnniversaryLocket.styles";

interface Props {
    items: AnniversaryType[];
    /** 오늘이면 로켓이 은은하게 발광한다 */
    today?: boolean;
}


/**
 * 기념일이 있는 날에 요일 헤더에서 늘어지는 '로켓' 장식.
 * 로켓 안 아이콘 = 지금 보고 있는 기념일, 아래 매달린 마름모 = 나머지.
 * 호버하면 이름 명패가 뜨고, 휠로 넘기면 아이콘과 채워진 마름모가 함께 바뀐다.
 */
export default function AnniversaryLocket({ items, today = false }: Props) {
    const reelRef = React.useRef<HTMLDivElement>(null);
    const [active, setActive] = React.useState(0);

    const total = items.length;
    const multi = total > 1;
    const pipCount = Math.min(total - 1, S.MAX_PIPS);

    const syncActive = React.useCallback(() => {
        const reel = reelRef.current;
        if (!reel) return;
        setActive(Math.min(Math.round(reel.scrollTop / S.ROW), total - 1));
    }, [total]);

    // 끝에 닿으면 막지 않아 페이지 스크롤로 자연스럽게 이어진다
    const handleWheel = (e: React.WheelEvent) => {
        const reel = reelRef.current;
        if (!reel || !multi) return;
        const before = reel.scrollTop;
        reel.scrollTop += Math.sign(e.deltaY) * S.ROW;
        if (reel.scrollTop !== before) e.preventDefault();
    };

    if (total === 0) return null;

    const current = items[Math.min(active, total - 1)];

    return (
        <S.Root
            $today={today}
            onWheel={handleWheel}
            aria-label={items.map((a) => a.title).join(", ")}
        >
            <svg className="art" viewBox="0 0 26 56" fill="none" aria-hidden>
                {/* 체인 — 호버 시 빛이 타고 내려오는 궤도 */}
                <path className="chain" d="M13 0 V6" />
                {/* 매듭 별 */}
                <path
                    className="jw"
                    d="M13 4.4C13 8 13 8 14.6 8C13 8 13 8 13 11.6C13 8 13 8 11.4 8C13 8 13 8 13 4.4Z"
                />
                {/* 로켓 (마름모 액자) */}
                <rect
                    className="ring"
                    x="4.5"
                    y="13.5"
                    width="17"
                    height="17"
                    transform="rotate(45 13 22)"
                />

                {pipCount > 0 ? (
                    <>
                        <path className="chain" d="M13 34 V36.4" />
                        <rect
                            className={active - 1 === 0 ? "pip on" : "pip"}
                            x="9.6" y="36.6" width="6.8" height="6.8"
                            transform="rotate(45 13 40)"
                        />
                        {pipCount > 1 && (
                            <>
                                <path className="chain" d="M13 43.4 V45.8" />
                                <rect
                                    className={active - 1 === 1 ? "pip on" : "pip"}
                                    x="9.6" y="46" width="6.8" height="6.8"
                                    transform="rotate(45 13 49.4)"
                                />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* 기념일 1개 — 작은 마름모로 마무리 */}
                        <path className="chain" d="M13 34 V36.6" />
                        <path className="drop" d="M13 36.6 L14.6 39 L13 41.4 L11.4 39 Z" />
                    </>
                )}

                {/* 호버 시 체인을 타고 내려오는 빛 */}
                <circle className="spark" r="1.4" />
            </svg>

            {/* 로켓 안 아이콘 = 현재 항목 */}
            <span className="ic">
                <AnniversaryIcon name={current.icon} size={12} strokeWidth={1.8} />
            </span>

            <S.Plaque $multi={multi}>
                <div className="reel" ref={reelRef} onScroll={syncActive}>
                    {items.map((a) => (
                        <span key={a.id} className="nm" title={a.title}>
                            {a.title}
                        </span>
                    ))}
                </div>
                {multi && <span className="idx">{Math.min(active + 1, total)}/{total}</span>}
            </S.Plaque>
        </S.Root>
    );
}

/* ── 모션 ─────────────────────────────────────────────── */
