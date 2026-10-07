/**
 * 데스크톱 위젯 속 내용(오늘·지금/다음·챌린지·주간…)의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { css, keyframes } from "styled-components";
import { inkOnFill } from "@/styles/color";

const settle = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;
const checkIn = keyframes`
    0% { transform: scale(0.65); opacity: 0; }
    65% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
`;

/** 줄 하나의 높이 — 화면(WidgetPanels)이 몇 줄이 들어가는지 셀 때 같은 값을 본다 */
export const ROW_PX = 32;

/* ── 모양 ─────────────────────────────────────────────────────────── */

export const Pad = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    padding: var(--widget-pad);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
`;

export const Fit = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
`;

export const Column = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: var(--widget-pad);
    box-sizing: border-box;
`;

/** 위젯 안의 날짜 줄 — 하루씩 옮기고, 가운데를 누르면 오늘로 */
export const DayNav = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    margin-bottom: 4px;

    .label {
        min-width: 5.5em;
        padding: 1px 6px;
        background: none;
        border: none;
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.66rem;
        letter-spacing: 1px;
        color: ${p => p.theme.colors.primary};
        cursor: pointer;
    }

    .label:disabled { cursor: default; color: ${p => p.theme.colors.textSecondary}; }
`;

export const NavBtn = styled.button`
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}40;
    color: ${p => p.theme.colors.primary};
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;

    &:hover { border-color: ${p => p.theme.colors.primary}; }

`;

export const SectionHead = styled.div`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.primary};
    padding-bottom: 5px;
    margin-bottom: 3px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}40;

    &.mt { margin-top: 10px; }
`;

export const Row = styled.div`
    animation: ${settle} 180ms ease-out;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    height: ${ROW_PX}px;
    box-sizing: border-box;
`;

export const ProjRow = styled.div`
    flex-shrink: 0;
    height: 38px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    box-sizing: border-box;
`;

export const ProjTop = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const More = styled.div`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.64rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    padding-top: 2px;
`;

export const Box = styled.button<{ $done: boolean }>`
    transition: background 160ms ease, box-shadow 160ms ease;
    &:hover { box-shadow: 0 0 0 3px ${p => p.theme.colors.primary}22; }
    ${p => p.$done && css`svg { animation: ${checkIn} 220ms ease-out; }`}
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid ${p => p.theme.colors.primary};
    background: ${p => p.$done ? p.theme.colors.primary : "transparent"};
    background-image: ${p => p.$done ? `linear-gradient(${p.theme.colors.primary}, ${p.theme.colors.primary})` : 'none'};
    color: ${p => inkOnFill(p.theme.colors.primary)};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

`;

export const Mark = styled.div<{ $c: string }>`
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    transform: rotate(45deg);
    /* 위젯 페이지의 "& * { background-color: transparent }" 가 색을 지우므로 그라데이션으로 칠한다 */
    background-image: ${p => `linear-gradient(${p.$c}, ${p.$c})`};
`;

export const Star = styled.span`
    width: 9px;
    flex-shrink: 0;
    text-align: center;
    font-size: 0.62rem;
    color: ${p => p.theme.colors.primary};
`;

export const Name = styled.span<{ $done: boolean }>`
    transition: color 160ms ease;
    flex: 1;
    min-width: 0;
    font-size: 0.8rem;
    color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.text};
    text-decoration: ${p => p.$done ? "line-through" : "none"};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const Meta = styled.span`
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    flex-shrink: 0;

    &.hot { color: ${p => p.theme.colors.primary}; }
`;

export const Thin = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.74rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
`;

export const BigRow = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

export const NowTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.92rem;
    color: ${p => p.theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 4px;
`;

export const NowMeta = styled.div`
    font-size: 0.7rem;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 3px;
`;

export const Streak = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    flex-shrink: 0;
    margin-top: 10px;
`;

export const Dot = styled.button<{ $on: boolean; $today: boolean }>`
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    padding: 0;
    transform: rotate(45deg);
    cursor: pointer;
    border: 1px solid ${p => p.$today ? p.theme.colors.primary : `${p.theme.colors.primary}66`};
    background: ${p => p.$on ? p.theme.colors.primary : "transparent"};
    box-shadow: ${p => p.$today ? `0 0 4px ${p.theme.colors.primary}66` : "none"};
`;

export const Big = styled.div`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 2rem;
    line-height: 1;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.primary};
    span { font-size: 0.9rem; margin-left: 3px; }
`;

export const Caption = styled.div`
    flex-shrink: 0;
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 5px;
`;

export const Bar = styled.div`
    flex-shrink: 0;
    height: 1px;
    margin-top: 8px;
    background: ${p => p.theme.colors.primary}33;
`;

export const Fill = styled.div<{ $pct: number }>`
    transition: width 260ms cubic-bezier(0.22, 1, 0.36, 1);
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    background-image: ${p => `linear-gradient(${p.theme.colors.primary}, ${p.theme.colors.primary})`};
`;

export const Dashed = styled.div`
    flex-shrink: 0;
    border-top: 1px dashed ${p => p.theme.colors.primary}40;
    margin: 10px 0 8px;
`;

export const CatRow = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 22px;
`;

export const CatName = styled.span`
    font-size: 0.74rem;
    color: ${p => p.theme.colors.text};
    width: 60px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const CatBar = styled.div`
    flex: 1;
    height: 1px;
    background: ${p => p.theme.colors.primary}22;
`;

export const CatFill = styled.div<{ $c: string; $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.$c};
`;

export const MemoArea = styled.textarea`
    flex: 1;
    min-height: 0;
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: var(--widget-pad);
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.92rem;
    line-height: 1.7;
    color: ${p => p.theme.colors.text};
    background: transparent;
    &::placeholder { color: ${p => p.theme.colors.textSecondary}88; }
`;

export const MemoColumn = styled.div`
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
`;

export const QuickInput = styled.input`
    flex-shrink: 0;
    margin-bottom: 8px;
    padding: 7px 9px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    background: transparent;
    outline: none;
    font-family: inherit;
    font-size: 0.8rem;
    color: ${p => p.theme.colors.text};
    &:focus { border-color: ${p => p.theme.colors.primary}; }
    &::placeholder { color: ${p => p.theme.colors.textSecondary}88; }
`;

/* 빠른 입력 한 줄 — 입력칸과 "+" 단추. 엔터만 되던 때는 넣는 길이 눈에 안 보였다 */
export const QuickRow = styled.div`
    display: flex;
    gap: 6px;
    flex-shrink: 0;
    margin-bottom: 8px;

    & > input {
        flex: 1;
        min-width: 0;
        margin-bottom: 0;
    }
`;

export const AddBtn = styled.button.attrs({ type: "button" })`
    flex: none;
    width: 30px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    background: transparent;
    color: ${p => p.theme.colors.primary};
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;

    &:hover:not(:disabled) { border-color: ${p => p.theme.colors.primary}; background-color: ${p => p.theme.colors.primary}14; }
    &:disabled { opacity: 0.4; cursor: default; }
`;

export const DelBtn = styled.button`
    min-width: 24px;
    min-height: 24px;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    line-height: 1;
    color: ${p => p.theme.colors.textSecondary};
    &:hover { color: ${p => p.theme.colors.error}; }
`;
