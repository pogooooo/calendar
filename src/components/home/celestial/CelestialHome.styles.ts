/**
 * CelestialHome 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes } from "styled-components";
import { hide_scrollbar } from "@/styles/shared";

export const PageWrapper = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
    color: ${p => p.theme.colors.text};
    padding: 12px 0;

    @media (max-width: 768px) {
        height: auto;
        min-height: 100%;
        overflow: visible;
        padding: 0;
    }
`;

export const Card = styled.div`
    position: relative;
    width: min(1120px, 100%);
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 236px;
    border: 1px solid ${p => p.theme.colors.primary}75;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        inset: 5px;
        border: 1px solid ${p => p.theme.colors.primary}24;
        pointer-events: none;
        z-index: 5;
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        overflow-y: auto;
        ${hide_scrollbar}
    }

    @media (max-width: 768px) {
        height: auto;
        overflow: visible;
        border: none;

        &::before { display: none; }
    }
`;

export const Main = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding-top: 8px;
`;

export const ArchWrap = styled.div`
    flex-shrink: 0;
    padding: 14px 30px 0;

    @media (max-width: 768px) {
        padding: 4px 4px 0;
    }
`;

export const Arch = styled.svg`
    display: block;
    width: 100%;
    height: auto;
    max-height: 210px;

    @media (max-width: 768px) {
        max-height: 170px;
    }

    .basel { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.26; stroke-width: 0.7; }
    .spoke { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.09; stroke-width: 0.5; }
    .base { fill: none; stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.3; stroke-width: 0.8; }
    .base2 { fill: none; stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.14; stroke-width: 0.6; }
    .tick { stroke: ${p => p.theme.colors.primary}; stroke-width: 1.2; }
    .major { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.4; stroke-width: 0.7; }
    .mkline { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.36; stroke-width: 0.7; }
    .mkanv { fill: ${p => p.theme.colors.primary}; }
    .mkdue { fill: ${p => p.theme.colors.background}; stroke: ${p => p.theme.colors.primary}; stroke-width: 1; }
    .nray { stroke: ${p => p.theme.colors.primary}; stroke-width: 0.9; }
    .ncross { stroke: ${p => p.theme.colors.primary}; stroke-width: 1.1; }
    .ncap,
    .fin { fill: ${p => p.theme.colors.background}; stroke: ${p => p.theme.colors.primary}; stroke-width: 1.1; }
`;

export const ArchFoot = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid ${p => p.theme.colors.primary}42;
    padding-top: 9px;
    margin-top: 6px;

    .edge {
        font-size: 0.58rem;
        letter-spacing: 0.14em;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    .center {
        display: flex;
        align-items: center;
        gap: 11px;
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.8rem;
        letter-spacing: 0.16em;
        color: ${p => p.theme.colors.primary};
    }

    .center i {
        font-style: normal;
        font-size: 0.56rem;
    }
`;

export const Lists = styled.div`
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 34px;
    padding: 22px 30px 20px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    @media (max-width: 768px) {
        padding: 18px 4px 6px;
    }
`;

export const ListCol = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
`;

export const SectionHead = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.74rem;
    letter-spacing: 0.2em;
    color: ${p => p.theme.colors.primary};
    margin-bottom: 12px;

    .hd {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme.colors.primary};
    }

    .hr {
        flex: 1;
        height: 1px;
        background: ${p => p.theme.colors.primary}42;
    }

    b {
        font-weight: 500;
        font-size: 0.66rem;
        letter-spacing: 0;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }
`;

/* 오늘 목록 위에 붙는 한 줄 추가 */
export const QuickForm = styled.form`
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
    margin-bottom: 10px;
    padding: 0 0 0 2px;
    border: 1px solid ${p => p.theme.colors.primary}4D;
    background: transparent;
    transition: border-color 0.18s, box-shadow 0.18s;

    &:focus-within {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 7px ${p => p.theme.colors.primary}3D;
    }

    .dot {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        margin-left: 9px;
        transform: rotate(45deg);
        background: ${p => p.theme.colors.primary};
    }

    input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        padding: 9px 0;
        font-family: inherit;
        font-size: 0.78rem;
        color: ${p => p.theme.colors.text};

        &::placeholder { color: ${p => p.theme.colors.textSecondary}; }
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 34px;
        align-self: stretch;
        background: transparent;
        border: none;
        border-left: 1px solid ${p => p.theme.colors.primary}33;
        color: ${p => p.theme.colors.primary};
        cursor: pointer;
        transition: background-color 0.15s;

        &:disabled { opacity: 0.3; cursor: default; }
        &:not(:disabled):hover { background-color: ${p => p.theme.colors.primary}17; }
        &:not(:disabled):active { background-color: ${p => p.theme.colors.primary}2E; }

        /* "자세히" — 시간·카테고리·반복을 정하고 싶을 때. + 보다 조용하게 */
        &.detail { color: ${p => p.theme.colors.textSecondary}; }
        &.detail:hover { color: ${p => p.theme.colors.primary}; }
    }

    @media (max-width: 768px) {
        margin-bottom: 12px;

        input { padding: 12px 0; font-size: 0.85rem; }
        button { width: 46px; }
    }
`;

export const QuickError = styled.div`
    flex-shrink: 0;
    margin: -4px 0 8px;
    font-size: 0.68rem;
    color: ${p => p.theme.colors.error};
`;

export const Scroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    ${hide_scrollbar}

    @media (max-width: 768px) {
        overflow: visible;
        min-height: auto;
    }
`;

export const Empty = styled.div`
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    padding: 8px 0;
`;

export const Mark = styled.span<{ $on: boolean }>`
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    transform: rotate(45deg);
    border: 1px solid ${p => p.theme.colors.primary}75;
    background: ${p => (p.$on ? p.theme.colors.primary : "transparent")};
    transition: border-color 0.18s, box-shadow 0.18s;
`;

/* 목록이 한 줄씩 차례로 들어온다. 새로 넣은 줄만 다시 재생된다(마운트 기준). */
export const rowIn = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Row = styled.div<{ $done: boolean; $soft?: boolean }>`
    display: flex;
    align-items: center;
    gap: 11px;
    padding: ${p => (p.$soft ? "6px 0" : "7px 0")};

    @media (prefers-reduced-motion: no-preference) {
        animation: ${rowIn} 0.28s ease-out both;

        &:nth-child(2) { animation-delay: 0.04s; }
        &:nth-child(3) { animation-delay: 0.08s; }
        &:nth-child(4) { animation-delay: 0.12s; }
        &:nth-child(n + 5) { animation-delay: 0.16s; }
    }

    @media (max-width: 768px) {
        min-height: 44px;
        gap: 14px;
    }
    font-size: ${p => (p.$soft ? "0.74rem" : "0.78rem")};
    color: ${p => (p.$done || p.$soft ? p.theme.colors.textSecondary : p.theme.colors.text)};
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    cursor: pointer;

    .name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-decoration: ${p => (p.$done ? "line-through" : "none")};
        text-decoration-color: ${p => p.theme.colors.primary}75;
    }

    em {
        margin-left: auto;
        font-style: normal;
        font-size: 0.6rem;
        letter-spacing: 0.12em;
        color: ${p => p.theme.colors.textSecondary};
        flex-shrink: 0;
    }

    &:hover {
        color: ${p => p.theme.colors.primary};
    }

    &:hover ${Mark} {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 5px ${p => p.theme.colors.primary}75;
    }
`;

export const Pillar = styled.aside`
    border-left: 1px solid ${p => p.theme.colors.primary}42;
    padding: 16px 22px 18px;
    min-height: 0;
    overflow-y: auto;
    ${hide_scrollbar}

    @media (max-width: 900px) {
        border-left: 0;
        border-top: 1px solid ${p => p.theme.colors.primary}42;
    }

    @media (max-width: 768px) {
        overflow: visible;
        padding: 16px 4px 8px;
    }
`;

export const Crest = styled.div`
    text-align: center;
    color: ${p => p.theme.colors.primary};
    font-size: 0.66rem;
    letter-spacing: 0.4em;
    margin-bottom: 14px;
`;

export const PillarHead = styled.button`
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    color: ${p => p.theme.colors.primary};
    margin-bottom: 11px;

    /* 접었다 펴는 단추다. 17px 짜리 글줄만으로는 손가락이 못 맞춘다. */
    @media (max-width: 768px) {
        min-height: 40px;
        margin-bottom: 6px;
    }

    &.mt { margin-top: 22px; }

    .idx {
        font-size: 0.56rem;
        letter-spacing: 0.14em;
        line-height: 1.5;
        padding: 0 4px;
        color: ${p => p.theme.colors.textSecondary};
        border: 1px solid ${p => p.theme.colors.primary}42;
    }

    .rule {
        flex: 1;
        height: 1px;
        background: ${p => p.theme.colors.primary}42;
    }

    &:hover .rule { background: ${p => p.theme.colors.primary}; }
`;

/** 머리글과 + 를 한 줄에 세운다. 단추 안에 단추를 넣으면 HTML 이 깨진다. */
export const PillarHeadRow = styled.div`
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 11px;

    &.mt { margin-top: 22px; }

    ${PillarHead} {
        flex: 1;
        min-width: 0;
        margin-bottom: 0;
    }

    @media (max-width: 768px) {
        margin-bottom: 6px;
    }
`;

/** 기둥 머리글 오른쪽의 작은 + */
export const PillarAdd = styled.button`
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.primary};
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}44;
    }

    @media (max-width: 768px) {
        width: 30px;
        height: 30px;
        &:active { background-color: ${p => p.theme.colors.primary}1F; }
    }
`;

/** 기념일 한 줄 추가 — 이름과 날짜뿐이라 창까지 띄울 일이 아니다 */
export const AnvForm = styled.form`
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 2px 0 10px;

    input {
        min-width: 0;
        background: transparent;
        border: 1px solid ${p => p.theme.colors.primary}4D;
        outline: none;
        padding: 6px 8px;
        font-family: inherit;
        font-size: 0.72rem;
        color: ${p => p.theme.colors.text};

        &:focus { border-color: ${p => p.theme.colors.primary}; }
        &::placeholder { color: ${p => p.theme.colors.textSecondary}; }
    }

    input[type="text"], input:not([type]) { flex: 1; }
    input[type="date"] { flex: 0 0 auto; color-scheme: ${p => p.theme.mode}; }

    button {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        align-self: stretch;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}4D;
        color: ${p => p.theme.colors.primary};
        cursor: pointer;

        &:disabled { opacity: 0.35; cursor: default; }
        &:not(:disabled):hover { background-color: ${p => p.theme.colors.primary}17; }
    }

    @media (max-width: 768px) {
        flex-wrap: wrap;
        input { padding: 9px 10px; font-size: 0.8rem; }
        input[type="date"] { flex: 1; }
        button { width: 40px; }
    }
`;

export const ProjectRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 9px;
    padding: 7.5px 0;
    font-size: 0.73rem;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    cursor: pointer;

    &:hover .name { color: ${p => p.theme.colors.primary}; }
    &:active { background-color: ${p => p.theme.colors.primary}12; }

    @media (max-width: 768px) { min-height: 46px; }

    .name {
        flex: 1 0 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bar {
        position: relative;
        flex: 1;
        height: 3px;
        background: repeating-linear-gradient(
            to right,
            ${p => p.theme.colors.primary}42 0 1px,
            transparent 1px 5px
        );
    }

    .bar b {
        position: absolute;
        left: 0;
        top: 1px;
        height: 1px;
        background: ${p => p.theme.colors.primary};
    }

    em {
        font-style: normal;
        font-size: 0.62rem;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
    }
`;

export const ChallengeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 8px;
    padding: 7.5px 0;
    font-size: 0.73rem;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;

    .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    em {
        font-style: normal;
        font-size: 0.62rem;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    .streak {
        flex: 1 0 100%;
        display: flex;
        gap: 5px;
    }

    @media (max-width: 768px) {
        min-height: 46px;

        /* 이레 칸이 폭을 나눠 가진다. 7px 짜리 마름모는 손가락으로 못 짚는다. */
        .streak {
            gap: 6px;
            margin-top: 2px;
        }
        .streak > * { flex: 1; }
    }
`;

export const Slot = styled.button<{ $on: boolean; $today: boolean }>`
    width: 7px;
    height: 7px;
    padding: 0;
    transform: rotate(45deg);
    cursor: pointer;
    border: 1px solid ${p => (p.$today ? p.theme.colors.primary : `${p.theme.colors.primary}75`)};
    background: ${p => (p.$on ? p.theme.colors.primary : "transparent")};
    box-shadow: ${p => (p.$today ? `0 0 4px ${p.theme.colors.primary}75` : "none")};
    transition: box-shadow 0.18s;

    &:hover { box-shadow: 0 0 5px ${p => p.theme.colors.primary}; }

    /**
     * 폰에서는 마름모를 ::after 로 옮기고 단추 자체를 넓은 짚을 자리로 쓴다.
     * 겉모습은 그대로면서 누를 수 있는 칸만 커진다.
     */
    @media (max-width: 768px) {
        width: auto;
        height: 30px;
        min-width: 0;
        transform: none;
        border: none;
        background: none;
        box-shadow: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &::after {
            content: "";
            width: 10px;
            height: 10px;
            transform: rotate(45deg);
            border: 1px solid ${p => (p.$today ? p.theme.colors.primary : `${p.theme.colors.primary}75`)};
            background: ${p => (p.$on ? p.theme.colors.primary : "transparent")};
            box-shadow: ${p => (p.$today ? `0 0 4px ${p.theme.colors.primary}75` : "none")};
        }

        &:active { background-color: ${p => p.theme.colors.primary}17; }
    }
`;

export const AnniversaryRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    font-size: 0.73rem;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    cursor: pointer;

    &:hover .name { color: ${p => p.theme.colors.primary}; }
    &:active { background-color: ${p => p.theme.colors.primary}12; }

    @media (max-width: 768px) { min-height: 44px; }

    .star {
        width: 9px;
        flex-shrink: 0;
        text-align: center;
        font-size: 0.62rem;
        color: ${p => p.theme.colors.primary};
    }

    .name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    em {
        margin-left: auto;
        font-style: normal;
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        color: ${p => p.theme.colors.primary};
        flex-shrink: 0;
    }
`;
