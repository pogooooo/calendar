"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import AnniversaryIcon from "@/assets/celestial/AnniversaryIcons";
import type { AnniversaryType } from "@/store/useAnniversaryStore";

interface Props {
    items: AnniversaryType[];
    /** 오늘이면 로켓이 은은하게 발광한다 */
    today?: boolean;
}

const ROW = 13;        // 이름 한 줄 높이 (스크롤 스냅 단위)
const MAX_PIPS = 2;    // 로켓 아래 매다는 마름모 최대 개수 (그 이상은 인덱스로 알림)

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
    const pipCount = Math.min(total - 1, MAX_PIPS);

    const syncActive = React.useCallback(() => {
        const reel = reelRef.current;
        if (!reel) return;
        setActive(Math.min(Math.round(reel.scrollTop / ROW), total - 1));
    }, [total]);

    // 끝에 닿으면 막지 않아 페이지 스크롤로 자연스럽게 이어진다
    const handleWheel = (e: React.WheelEvent) => {
        const reel = reelRef.current;
        if (!reel || !multi) return;
        const before = reel.scrollTop;
        reel.scrollTop += Math.sign(e.deltaY) * ROW;
        if (reel.scrollTop !== before) e.preventDefault();
    };

    if (total === 0) return null;

    const current = items[Math.min(active, total - 1)];

    return (
        <Root
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

            <Plaque $multi={multi}>
                <div className="reel" ref={reelRef} onScroll={syncActive}>
                    {items.map((a) => (
                        <span key={a.id} className="nm" title={a.title}>
                            {a.title}
                        </span>
                    ))}
                </div>
                {multi && <span className="idx">{Math.min(active + 1, total)}/{total}</span>}
            </Plaque>
        </Root>
    );
}

/* ── 모션 ─────────────────────────────────────────────── */
const swing = keyframes`
    0%, 100% { transform: rotate(-1.5deg); }
    50% { transform: rotate(1.5deg); }
`;

/* 호버: 건드린 것처럼 한 번 크게 흔들리고 잦아든다 */
const nudge = keyframes`
    0%   { transform: rotate(0deg); }
    18%  { transform: rotate(6.5deg); }
    42%  { transform: rotate(-4.5deg); }
    64%  { transform: rotate(2.6deg); }
    82%  { transform: rotate(-1.2deg); }
    100% { transform: rotate(0deg); }
`;

/* 호버: 빛이 체인을 타고 내려와 로켓에 닿는다 */
const drip = keyframes`
    0%   { offset-distance: 0%; opacity: 0; }
    15%  { opacity: 1; }
    75%  { offset-distance: 100%; opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
`;

const todayGlow = keyframes`
    0%, 100% { filter: drop-shadow(0 0 1px rgba(212, 175, 55, 0.35)); }
    50%      { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.85)); }
`;

const motionSafe = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

const Root = styled.span<{ $today: boolean }>`
    position: absolute;
    top: -1px;
    right: 8px;
    width: 26px;
    height: 56px;
    z-index: 4;
    color: ${(p) => p.theme.colors.primary};
    transform-origin: 50% 0;
    transition: filter 0.3s ease;

    ${motionSafe(css`animation: ${swing} 6s ease-in-out infinite;`)}

    .art {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        stroke: currentColor;
        fill: none;
    }

    .chain {
        stroke-width: 0.85;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
    }

    .ring {
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
    }

    .jw {
        stroke-width: 1;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
    }

    .drop {
        stroke-width: 0.9;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
    }

    /* 매달린 마름모 — 현재 항목이면 금색으로 채워진다 */
    .pip {
        stroke-width: 0.9;
        fill: transparent;
        vector-effect: non-scaling-stroke;
        transition: fill 0.25s ease, filter 0.25s ease;
    }

    .pip.on {
        fill: currentColor;
        filter: drop-shadow(0 0 4px currentColor);
    }

    .spark {
        fill: currentColor;
        stroke: none;
        opacity: 0;
        filter: drop-shadow(0 0 3px currentColor);
        offset-path: path("M13 0 V13");
    }

    /* 로켓 안 아이콘 */
    .ic {
        position: absolute;
        top: 15.5px;
        left: 50%;
        margin-left: -6px;
        width: 12px;
        height: 12px;
        display: flex;
        transform-origin: 50% 50%;
        transition: transform 0.3s ease, filter 0.3s ease;
    }

    /* 오늘이 기념일이면 로켓이 숨쉰다 */
    ${(p) => p.$today && motionSafe(css`
        .ring, .ic { animation: ${todayGlow} 2.8s ease-in-out infinite; }
    `)}

    &:hover {
        filter: drop-shadow(0 0 6px ${(p) => p.theme.colors.primary}cc);

        ${motionSafe(css`animation: ${nudge} 1.5s cubic-bezier(0.25, 0.8, 0.3, 1);`)}

        .ic {
            transform: scale(1.14);
            filter: drop-shadow(0 0 4px ${(p) => p.theme.colors.primary}e6);
        }

        .spark {
            ${motionSafe(css`animation: ${drip} 1.1s ease-in 0.1s;`)}
        }
    }
`;

const Plaque = styled.span<{ $multi: boolean }>`
    position: absolute;
    top: 54px;
    right: -4px;
    width: 112px;
    z-index: 8;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 6px;
    box-sizing: border-box;
    background: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => p.theme.colors.primary}99;
    font-size: 0.56rem;
    color: ${(p) => p.theme.colors.primary};
    white-space: nowrap;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: opacity 0.22s ease, transform 0.3s cubic-bezier(0.2, 1.1, 0.3, 1);

    ${Root}:hover & {
        opacity: 1;
        transform: none;
    }

    .reel {
        flex: 1 1 auto;
        min-width: 0;
        height: ${ROW}px;
        overflow-y: auto;
        overscroll-behavior: contain;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .reel::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
    }

    .nm {
        display: block;
        height: ${ROW}px;
        line-height: ${ROW}px;
        scroll-snap-align: start;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .idx {
        flex: 0 0 auto;
        font-size: 0.47rem;
        opacity: 0.6;
    }
`;
