/**
 * DateTimePicker 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes, css } from "styled-components";
import { MOBILE, SAFE_B } from "@/styles/breakpoints";

export const POP_WIDTH = 272;

export const popIn = keyframes`
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: none; }
`;

export const popInUp = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: none; }
`;

export const Trigger = styled.button<{ $open: boolean }>`
    flex: 1;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    font-size: 0.82rem;
    font-family: inherit;
    letter-spacing: 0.3px;
    text-align: left;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}${p => (p.$open ? "" : "44")};
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    svg { color: ${p => p.theme.colors.primary}; flex: 0 0 auto; }
    span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

    &:hover { border-color: ${p => p.theme.colors.primary}; }

    ${p => p.$open && css`
        box-shadow: 0 0 8px ${p.theme.colors.primary}44;
    `}
`;

export const Popover = styled.div<{ $up: boolean }>`
    position: fixed;
    z-index: 1100;
    width: ${POP_WIDTH}px;
    padding: 12px;
    background: ${p => p.theme.colors.surface};
    border: 1px solid ${p => p.theme.colors.primary}57;
    box-shadow: 0 10px 26px -12px rgba(0, 0, 0, 0.34);
    outline: none;
    animation: ${p => (p.$up ? popInUp : popIn)} 0.18s ease-out;

    ${MOBILE} {
        top: auto !important;
        left: 0 !important;
        right: 0;
        bottom: 0;
        width: auto;
        max-height: 88dvh;
        overflow-y: auto;
        padding: 14px 16px calc(14px + ${SAFE_B});
        border: none;
        border-top: 1px solid ${p => p.theme.colors.primary};
        animation: ${popIn} 0.2s ease-out;
    }
`;

export const MonthNav = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    strong {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.92rem;
        font-weight: 400;
        letter-spacing: 2px;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}33;
        color: ${p => p.theme.colors.textSecondary};
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;

        &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }
        &:active { background-color: ${p => p.theme.colors.primary}1F; }

        /* 24px 짜리 화살표는 손가락으로 못 맞춘다 */
        ${MOBILE} { width: 40px; height: 40px; }
    }
`;

export const WeekHead = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 3px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}44;

    span {
        text-align: center;
        font-size: 0.64rem;
        letter-spacing: 1px;
        color: ${p => p.theme.colors.textSecondary};
    }

    span:first-child { color: ${p => p.theme.colors.weekend}; }
`;

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
`;

export const EdgeTabs = styled.div`
    display: flex;
    margin-bottom: 6px;
    border: 1px solid ${p => p.theme.colors.primary}33;

    button {
        flex: 1;
        background: none;
        border: 0;
        padding: 5px 0;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.68rem;
        letter-spacing: 0.04em;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;

        ${MOBILE} { padding: 12px 0; font-size: 0.76rem; }
    }

    button + button { border-left: 1px solid ${p => p.theme.colors.primary}33; }

    button[data-on="1"] {
        background-color: ${p => p.theme.colors.primary}1F;
        color: ${p => p.theme.colors.primary};
    }
`;

export const Day = styled.button<{
    $out: boolean;
    $today: boolean;
    $selected: boolean;
    $inRange?: boolean;
    $edgeStart?: boolean;
    $edgeEnd?: boolean;
}>`
    position: relative;
    height: 30px;
    font-size: 0.74rem;
    font-family: inherit;
    background: none;
    border: 0;
    color: ${p => p.theme.colors.text};
    opacity: ${p => (p.$out ? 0.38 : 1)};
    cursor: pointer;

    /* 손가락으로 옆 날짜를 잘못 짚지 않을 만큼 키운다 */
    ${MOBILE} {
        height: 38px;
        font-size: 0.82rem;
    }

    span {
        position: relative;
        z-index: 2;
    }

    &:hover span { color: ${p => p.theme.colors.primary}; }

    &:focus-visible {
        outline: 2px solid ${p => p.theme.colors.primary};
        outline-offset: -2px;
    }

    ${p => (p.$inRange || p.$edgeStart || p.$edgeEnd) && css`
        &::before {
            content: "";
            position: absolute;
            top: 50%;
            height: 1px;
            background-color: ${p.theme.colors.primary}88;
            left: ${p.$edgeStart && !p.$edgeEnd ? "50%" : "0"};
            right: ${p.$edgeEnd && !p.$edgeStart ? "50%" : "0"};
        }
    `}

    ${p => p.$today && !p.$selected && css`
        span {
            text-decoration: underline;
            text-decoration-color: ${p.theme.colors.primary};
            text-underline-offset: 3px;
        }
    `}

    ${p => p.$selected && css`
        &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 22px;
            height: 22px;
            margin: -11px 0 0 -11px;
            border: 1px solid ${p.theme.colors.primary};
            background-color: ${p.theme.colors.surface};
            transform: rotate(45deg);
            z-index: 1;
        }
        span { color: ${p.theme.colors.primary}; font-weight: 600; }
    `}
`;

export const TimeArea = styled.div`
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed ${p => p.theme.colors.primary}44;
`;

export const TimeLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 6px;
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};

    svg { color: ${p => p.theme.colors.primary}; }
`;

export const Foot = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid ${p => p.theme.colors.primary}44;

    button {
        padding: 5px 12px;
        font-size: 0.72rem;
        font-family: inherit;
        letter-spacing: 1px;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}44;
        color: ${p => p.theme.colors.textSecondary};
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;

        &:hover {
            border-color: ${p => p.theme.colors.primary};
            color: ${p => p.theme.colors.primary};
        }
    }

    .ok {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};

        &:hover { box-shadow: 0 0 8px ${p => p.theme.colors.primary}55; }
    }
`;
