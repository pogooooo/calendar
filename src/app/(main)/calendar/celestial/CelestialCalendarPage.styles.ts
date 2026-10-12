/**
 * 달력 화면(틀)의 모양 — 폰의 갈아 끼우는 두 화면, 데스크톱의 두 판과 그 사이의 나눔선.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { css, keyframes } from "styled-components";
import { gilt } from "@/styles/celestial/almanac";
import { celestialOnly } from "@/styles/celestial/ornaments";
import { TAB_BAR_HEIGHT, SAFE_B } from "@/styles/breakpoints";

/* ── 폰 전용 ─────────────────────────────────────────────────────────── */

export const MobileWrapper = styled.div`
    display: flex;
    flex-direction: column;
    /* 높이를 못 박아야 아래 달력이 남은 칸을 정확히 채운다.
       min-height 로 두면 달력이 제 내용만큼 자라 화면 밖으로 조금씩 새어 나간다. */
    height: 100%;
    gap: 10px;
`;

export const ViewSwitch = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary}66;
    flex: none;
`;

export const SwitchButton = styled.button<{ $on: boolean }>`
    padding: 12px 0;
    background: ${(props) => (props.$on ? `${props.theme.colors.primary}1F` : "transparent")};
    border: none;
    border-right: 1px solid ${(props) => props.theme.colors.primary}33;
    color: ${(props) => (props.$on ? props.theme.colors.primary : props.theme.colors.textSecondary)};
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.82rem;
    letter-spacing: 0.1em;
    cursor: pointer;

    &:last-child { border-right: none; }
    &:active { background-color: ${(props) => props.theme.colors.primary}2E; }
`;

/* 달력 한 짝이 남은 높이를 다 쓴다. 스크롤은 각 달력이 알아서 한다.
   갈아 끼우는 몸짓(월간→일간은 오른쪽에서, 일간→월간은 왼쪽에서)은 calendar/page 가 갈래의 꼴(useSwapMotion)로 그린다 —
   예전의 CSS 몸짓은 끝난 뒤에도 transform 을 남겨, 안의 fixed 층(거르개의 바탕 막)이 이 판에 갇혔다. $forward 는 차례만 알린다 */
export const MobilePane = styled.div<{ $forward: boolean }>`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    & > * { flex: 1; min-height: 0; }
`;

/* 월간 격자는 제 높이(칸 폭의 1.3배 × 6)만 쓰고, 남은 자리는 아래 고른 날 목록(DayPeek)이 쓴다 */
export const MonthArea = styled.div`
    flex: none !important;
    min-height: 0;
    display: flex;
    flex-direction: column;
`;

const fabIn = keyframes`
    from { opacity: 0; transform: scale(0.6) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
`;

export const Fab = styled.button`
    position: fixed;
    right: 16px;
    bottom: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B} + 16px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    ${gilt}
    border: 1px solid ${(props) => props.theme.colors.primary};
    box-shadow: inset 0 1px 0 rgba(255, 248, 220, 0.7), inset 0 -1px 0 rgba(110, 80, 10, 0.3), 0 8px 20px -8px ${(props) => props.theme.colors.primary};
    cursor: pointer;
    transition: transform 0.12s ease;

    &:active { transform: scale(0.9); }

    :where(html:not([data-theme-motion="off"])) & {
        animation: ${fabIn} 0.34s cubic-bezier(0.2, 1.3, 0.4, 1) 0.1s both;
    }
`;

export const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 18px 20px;
    background-color: transparent;

    @media (max-width: 1250px) {
        height: auto;
        min-height: calc(100vh - 80px);
        padding: 20px;
    }

    @media (max-width: 768px) {
        min-height: 0;
        padding: 0;
    }
`;

export const CalendarContainer = styled.div<{ $collapsed: boolean }>`
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;

    display: flex;
    flex-direction: row;
    gap: ${(props) => (props.$collapsed ? "18px" : "40px")};

    @media (max-width: 1250px) {
        flex-direction: column;
        gap: 30px;
    }

    @media (max-width: 768px) {
        gap: 18px;
    }
`;

const PANEL_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export const MonthSection = styled.div<{ $flex: number; $collapsed: boolean }>`
    flex: ${(props) => (props.$collapsed ? 100 : props.$flex)} 1 0;
    min-width: 0;
    height: 100%;
    transition: flex-grow 0.38s ${PANEL_EASE};

    @media (max-width: 1250px) {
        flex: none !important;
        height: auto;
    }
`;

/* 접힌 상태에서 세로로 서는 라벨 */
export const CollapsedRail = styled.div<{ $visible: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    pointer-events: none;
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: ${(props) => (props.$visible ? 1 : 0)};
    transition: opacity 0.25s ${(props) => (props.$visible ? "0.15s" : "0s")} ease;

    .label {
        font-family: ${(props) => props.theme.fonts.display};
        font-size: 0.78rem;
        letter-spacing: 3px;
        white-space: nowrap;
        writing-mode: vertical-rl;
    }

    .star {
        font-size: 10px;
        color: ${(props) => props.theme.colors.primary};
        opacity: 0.7;
    }

    @media (max-width: 1250px) {
        display: none;
    }
`;

/* 패널 사이 여백에 놓아 일간 캘린더와 겹치지 않게 한다 */
export const ToggleButton = styled.button<{ $collapsed: boolean }>`
    position: absolute;
    top: 0;
    left: ${(props) => (props.$collapsed ? "-24px" : "-34px")};
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.primary}44;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, box-shadow 0.2s, left 0.38s ${PANEL_EASE};

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary}44;
    }

    @media (max-width: 1250px) {
        top: -32px;
        left: auto;
        right: 0;
    }
`;

export const DayBody = styled.div<{ $collapsed: boolean }>`
    height: 100%;
    /* 폭 하한은 DaySection이 책임진다. 여기서 300px을 강제하면
       border-left(1px)만큼 좁아진 콘텐츠 폭을 넘겨 오른쪽 끝이 잘린다 */
    min-width: 0;
    opacity: ${(props) => (props.$collapsed ? 0 : 1)};
    transform: translateX(${(props) => (props.$collapsed ? "12px" : "0")});
    pointer-events: ${(props) => (props.$collapsed ? "none" : "auto")};
    transition: opacity 0.28s ${(props) => (props.$collapsed ? "0s" : "0.12s")} ease,
                transform 0.38s ${PANEL_EASE};

    @media (max-width: 1250px) {
        min-width: 0;
    }
`;

export const DaySection = styled.div<{ $flex: number; $collapsed: boolean }>`
    position: relative;
    flex: ${(props) => (props.$collapsed ? 0 : props.$flex)} 1 ${(props) => (props.$collapsed ? "34px" : "0")};
    min-width: ${(props) => (props.$collapsed ? "34px" : "300px")};
    height: 100%;
    /* 접기 애니메이션 클리핑은 DayClip이 담당한다.
       여기서 hidden으로 두면 밖으로 나온 ToggleButton까지 잘려 안 보인다 */
    overflow: visible;
    border-left: 1px solid ${(props) => (props.$collapsed ? `${props.theme.colors.primary}55` : "transparent")};
    transition: flex-grow 0.38s ${PANEL_EASE},
                flex-basis 0.38s ${PANEL_EASE},
                min-width 0.38s ${PANEL_EASE},
                border-color 0.3s ease;

    @media (max-width: 1250px) {
        flex: none !important;
        min-width: 0;
        height: auto;
        overflow: visible;
        border-left: none;
        border-top: none;
        padding-top: 24px;
        margin-top: 12px;
    }
`;

/* 접기 애니메이션 동안 내용이 옆 패널로 새지 않도록 잘라내는 래퍼 */
export const DayClip = styled.div`
    position: relative;
    height: 100%;
    overflow: hidden;

    @media (max-width: 1250px) {
        height: auto;
        overflow: visible;
    }
`;

export const Resizer = styled.div<{ $hidden: boolean }>`
    position: relative;
    flex: 0 0 auto;
    width: 1px;
    cursor: ${(props) => (props.$hidden ? "default" : "col-resize")};
    user-select: none;
    background-color: ${(props) => props.theme.colors.primary};
    opacity: ${(props) => (props.$hidden ? 0 : 1)};
    pointer-events: ${(props) => (props.$hidden ? "none" : "auto")};
    transition: opacity 0.25s ease;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: -10px;
        right: -10px;
    }

    .line {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1px;
        height: 54px;
        margin: -27px 0 0 -0.5px;
        background: ${(props) => props.theme.colors.primary};
        opacity: 0;
        transition: opacity 0.2s;
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary};
    }

    .grip {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 9px;
        height: 9px;
        margin: -4.5px 0 0 -4.5px;
        background-color: ${(props) => props.theme.colors.background};
        border: 1px solid ${(props) => props.theme.colors.primary};
        transform: rotate(45deg);
        transition: box-shadow 0.2s, background-color 0.2s;
    }

    &:hover .line { opacity: 1; }

    &:hover .grip {
        background-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 8px ${(props) => props.theme.colors.primary}CC;
    }

    /* Celestial: 마름모 손잡이 대신 세로 금선에 꿴 둥근 구슬 */
    ${celestialOnly(css`
        .grip { border-radius: 50%; transform: none; }
    `)}

    @media (max-width: 1250px) {
        display: none;
    }
`;
