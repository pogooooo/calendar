/**
 * 기념일 화면의 Celestial 모양 — 별자리 워터마크, 마름모 귀퉁이의 카드, 금빛 D-day.
 */
import styled, { css, keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const todayGlow = keyframes`
    0%, 100% { box-shadow: 0 0 8px 0 currentColor inset, 0 0 10px -4px currentColor; }
    50%      { box-shadow: 0 0 14px 0 currentColor inset, 0 0 18px -4px currentColor; }
`;

export const Page = styled.div`
    position: relative;
    max-width: 860px;
    margin: 0 auto;

    /* 배경 별자리는 화면 밖으로 걸치라고 둔 장식이다. 폰 폭에서는 그 삐져나온
       만큼이 가로 스크롤이 되어 화면이 좌우로 흔들린다. 여기서 잘라낸다. */
    ${MOBILE} { overflow-x: clip; }
`;

export const Zodiac = styled.svg`
    position: absolute;
    top: -60px;
    right: -80px;
    width: 380px;
    height: 380px;
    color: ${p => p.theme.colors.primary};
    opacity: 0.055;
    pointer-events: none;

    circle, line {
        fill: none;
        stroke: currentColor;
    }

    .dashed { stroke-dasharray: 2 6; }
`;

export const PageHeader = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;

    i {
        width: 7px;
        height: 7px;
        border: 1px solid ${p => p.theme.colors.primary};
        transform: rotate(45deg);
        flex-shrink: 0;
    }

    span {
        font-family: ${p => p.theme.fonts.display};
        font-size: 1.3rem;
        letter-spacing: 5px;
        white-space: nowrap;
    }

    hr {
        flex: 1;
        border: none;
        height: 1px;
        background: linear-gradient(to right, ${p => p.theme.colors.primary}, transparent);
    }
`;

export const Corners = styled.span`
    i {
        position: absolute;
        width: 6px;
        height: 6px;
        border: 1px solid ${p => p.theme.colors.primary}88;
        background: ${p => p.theme.colors.background};
        transform: rotate(45deg);
        pointer-events: none;
    }

    i:nth-child(1) { top: -3.5px; left: -3.5px; }
    i:nth-child(2) { top: -3.5px; right: -3.5px; }
    i:nth-child(3) { bottom: -3.5px; left: -3.5px; }
    i:nth-child(4) { bottom: -3.5px; right: -3.5px; }
`;

export const AddForm = styled.form`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 22px 16px 16px;
    margin-bottom: 30px;
    border: 1px solid ${p => p.theme.colors.primary}55;
`;

export const FormCaption = styled.span`
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 14px;
    background: ${p => p.theme.colors.background};
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.72rem;
    letter-spacing: 4px;
    color: ${p => p.theme.colors.primary};
    white-space: nowrap;
`;

export const IconRow = styled.div`
    display: flex;
    gap: 6px;

    ${MOBILE} { gap: 5px; }
`;

export const IconChoice = styled.button<{ $selected: boolean }>`
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    color: ${p => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    border: 1px solid ${p => p.theme.colors.primary}${p => (p.$selected ? "" : "33")};
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;

    ${p => p.$selected && css`
        box-shadow: 0 0 6px ${p.theme.colors.primary}55;
        svg { filter: drop-shadow(0 0 3px ${p.theme.colors.primary}66); }
    `}

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.primary};
    }

    /* 여덟 칸이 폭을 나눠 가지면 손가락이 닿을 만큼 커진다 */
    ${MOBILE} {
        flex: 1;
        width: auto;
        min-width: 0;
        height: 42px;
    }
`;

export const FormRow = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    /* 폰에서 그냥 흘려 두면 [이름][월] / [일][추가] 로 섞여 접힌다.
       월과 일은 한 쌍이므로 이름 → 월·일 → 추가 순으로 못 박는다. */
    ${MOBILE} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;

        > input { grid-column: 1 / -1; }
        > button { grid-column: 1 / -1; justify-content: center; }
    }
`;

export const inputBase = css`
    padding: 9px 12px;
    font-size: 0.85rem;
    font-family: inherit;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}44;
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: ${p => p.theme.colors.primary}; }
`;

export const TitleInput = styled.input`
    ${inputBase}
    flex: 1;
    min-width: 180px;

    /* 옆의 고르개(46px)와 키를 맞춘다 */
    ${MOBILE} { min-width: 0; min-height: 46px; }
`;

export const DateField = styled.div`
    width: 104px;
    flex-shrink: 0;

    ${MOBILE} { width: auto; }
`;

export const AddButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 9px 16px;
    font-size: 0.82rem;
    font-family: inherit;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary};
    cursor: pointer;
    transition: box-shadow 0.2s;

    &:hover:not(:disabled) { box-shadow: 0 0 10px ${p => p.theme.colors.primary}55; }
    &:disabled { opacity: 0.45; cursor: default; }
    &:active:not(:disabled) { background-color: ${p => p.theme.colors.primary}1F; }

    ${MOBILE} { min-height: 46px; }
`;

export const Empty = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 56px 0;
    color: ${p => p.theme.colors.textSecondary};

    svg { color: ${p => p.theme.colors.primary}; opacity: 0.7; }

    p {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.7;
        text-align: center;
    }
`;

export const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
    gap: 18px;
    padding-bottom: 30px;
`;

export const Card = styled.div<{ $today: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 22px 12px 18px;
    border: 1px solid ${p => p.theme.colors.primary}${p => (p.$today ? "" : "55")};
    text-align: center;

    &::before {
        content: "";
        position: absolute;
        inset: 5px;
        border: 1px solid ${p => p.theme.colors.primary}22;
        pointer-events: none;
        transition: border-color 0.3s;
    }

    &:hover::before { border-color: ${p => p.theme.colors.primary}66; }

    ${p => p.$today && css`
        color: ${p.theme.colors.primary}44;
        animation: ${todayGlow} 2.6s ease-in-out infinite;
    `}

    &:hover button { opacity: 1; }
`;

export const CardDelete = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: ${p => p.theme.colors.textSecondary};
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s, color 0.2s;

    &:hover { color: #e05b5b; }
`;

export const CardNumeral = styled.span`
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.72rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.primary};
    opacity: 0.85;
`;

export const CardEmblem = styled.span<{ $today: boolean }>`
    position: relative;
    width: 64px;
    height: 64px;
    margin: 2px 0;

    svg {
        width: 100%;
        height: 100%;

        .dia {
            fill: none;
            stroke: ${p => p.theme.colors.primary}66;
        }

        .orbit {
            fill: none;
            stroke: ${p => p.theme.colors.primary}22;
        }

        .orbit-fill {
            fill: none;
            stroke: ${p => p.theme.colors.primary};
            stroke-width: 1.2;
            stroke-linecap: round;
            transition: stroke-dashoffset 0.6s ease;
        }
    }

    .glyph {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${p => p.theme.colors.primary};

        ${p => p.$today && css`
            svg { filter: drop-shadow(0 0 4px ${p.theme.colors.primary}); }
        `}
    }
`;

export const CardTitle = styled.span`
    font-size: 0.88rem;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.text};
    word-break: keep-all;
`;

export const CardDate = styled.span`
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    white-space: nowrap;
`;

export const CardDday = styled.span<{ $today: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.8rem;
    letter-spacing: 2px;
    white-space: nowrap;
    color: ${p => p.theme.colors.primary};

    i {
        width: 14px;
        height: 1px;
        background: linear-gradient(to right, transparent, ${p => p.theme.colors.primary}88);
    }

    i:last-child {
        background: linear-gradient(to left, transparent, ${p => p.theme.colors.primary}88);
    }
`;
