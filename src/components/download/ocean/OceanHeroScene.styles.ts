/**
 * OceanHeroScene 의 모양 — 물빛 위에 겹쳐 놓인 반투명 판 두 장.
 * 큰 판은 달력 한 달(기울인 세리프 October, 고정폭 요일, 둥근 칸, 오늘은 청록으로 찬 칸), 작은 판은 오늘 할 일 쪽지.
 * 들어올 때 한 번 떠오르고, 마우스를 따라 두 판이 다른 깊이로 몇 px 움직일 뿐이다.
 */
import styled, { css } from "styled-components";
import { withAlpha } from "@/styles/color";
import { EASE, MONO, R, SERIF, calm, hairline, ink, label, surface, surfaceIn } from "@/styles/ocean/water";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Scene = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

/** 마우스 깊이 — 화면이 --mx/--my(-1~1)를 넘겨준다 */
const depth = (x: number, y: number) => css`
    translate: calc(var(--mx, 0) * ${x}px) calc(var(--my, 0) * ${y}px);
    transition: translate 0.6s ${EASE};
`;

export const MonthCard = styled.div`
    ${surface("panel")}
    position: absolute;
    left: 0;
    top: 8px;
    width: 85%;
    height: 84%;
    padding: 18px 18px 16px;
    border-radius: ${R.lg};
    display: flex;
    flex-direction: column;
    ${depth(-4, -3)}
    animation: ${surfaceIn} 0.6s ${EASE} 0.1s both;
    ${calm}
`;

export const MonthHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;

export const MonthName = styled.span`
    font-family: ${SERIF};
    font-style: italic;
    font-size: 2rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: ${(p) => p.theme.colors.text};
`;

/** ‹ › 자리 — 가는 선 동그라미 둘 */
export const Nav = styled.span`
    display: flex;
    gap: 6px;
    i {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid ${(p) => hairline(p.theme, true)};
    }
`;

export const Week = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    margin-bottom: 6px;
    span {
        ${label}
        font-size: 0.6rem;
        text-align: left;
        padding-left: 4px;
    }
    span:first-child { color: ${(p) => p.theme.colors.weekend}; }
`;

export const Grid = styled.div`
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 5px;
`;

/** 칸 — 오늘은 청록으로 차고, 일정은 칸 아래쪽의 옅은 청록 막대(여러 날이면 칸 사이를 건너 잇는다) */
export const Cell = styled.span<{ $today: boolean; $event?: "one" | "start" | "end"; $dim: boolean }>`
    position: relative;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.$today ? "transparent" : hairline(p.theme))};
    background: ${(p) => (p.$today ? p.theme.colors.primary : dark(p) ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.55)")};
    opacity: ${(p) => (p.$dim ? 0.45 : 1)};

    ${(p) => p.$event && css`
        &::after {
            content: "";
            position: absolute;
            bottom: 5px;
            height: 4px;
            left: ${p.$event === "end" ? "-6px" : "4px"};
            right: ${p.$event === "start" ? "-6px" : "4px"};
            border-radius: ${p.$event === "start" ? "2px 0 0 2px" : p.$event === "end" ? "0 2px 2px 0" : "2px"};
            background: ${p.$today ? "rgba(255, 255, 255, 0.7)" : withAlpha(p.theme.colors.primary, dark(p) ? 0.5 : 0.35)};
            z-index: 1;
        }
    `}
`;

/** 오늘 할 일 쪽지 — 큰 판 오른쪽 아래에 겹쳐 뜬다 */
export const TodayCard = styled.div`
    ${surface("float")}
    position: absolute;
    right: 0;
    bottom: 0;
    width: 47%;
    padding: 14px 16px 16px;
    border-radius: ${R.md};
    ${depth(8, 6)}
    animation: ${surfaceIn} 0.6s ${EASE} 0.28s both;
    ${calm}
`;

export const TodayHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    span { ${label} }
    b {
        font-family: ${MONO};
        font-size: 0.7rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }
`;

/** 한 줄 — 동그라미 체크와 글자 자리 막대. 끝낸 줄은 청록 동그라미에 흰 체크, 막대는 옅게 */
export const TodayRow = styled.div<{ $done: boolean }>`
    display: flex;
    align-items: center;
    gap: 9px;
    height: 24px;

    i {
        position: relative;
        width: 14px;
        height: 14px;
        flex: none;
        border-radius: 50%;
        border: 1.5px solid ${(p) => (p.$done ? p.theme.colors.primary : ink(p.theme, 0.3))};
        background: ${(p) => (p.$done ? p.theme.colors.primary : "transparent")};
    }
    i::after {
        content: "";
        display: ${(p) => (p.$done ? "block" : "none")};
        position: absolute;
        left: 3.5px;
        top: 1px;
        width: 3px;
        height: 6px;
        border: solid ${(p) => (dark(p) ? "#06110F" : "#FFFFFF")};
        border-width: 0 1.5px 1.5px 0;
        transform: rotate(45deg);
    }
    span {
        height: 6px;
        border-radius: 3px;
        background: ${(p) => ink(p.theme, p.$done ? 0.08 : dark(p) ? 0.2 : 0.14)};
    }
`;

/** 오늘의 진행 — 가는 막대 하나 */
export const Level = styled.div`
    height: 3px;
    margin-top: 12px;
    border-radius: 2px;
    background: ${(p) => ink(p.theme, dark(p) ? 0.12 : 0.08)};
    overflow: hidden;
    span {
        display: block;
        width: 33%;
        height: 100%;
        border-radius: inherit;
        background: ${(p) => p.theme.colors.primary};
    }
`;

/**
 * 판 둘레 물속의 큰 유리 구슬 자리 — 보이지 않는 빈 상자. 바다의 물 렌더러가 이 자리에 구슬을 그린다(oceanHero).
 * 판(반투명 유리)에 반쯤 가려 판 뒤 물속에 있는 깊이가 보인다. 폰은 작게.
 */
export const OrbSpot = styled.span<{ $x: number; $y: number; $size: number }>`
    position: absolute;
    left: ${(p) => p.$x}%;
    top: ${(p) => p.$y}%;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    transform: translate(-50%, -50%);
    visibility: hidden;
    pointer-events: none;

    @media (max-width: 520px) {
        width: ${(p) => Math.round(p.$size * 0.62)}px;
        height: ${(p) => Math.round(p.$size * 0.62)}px;
    }
`;
