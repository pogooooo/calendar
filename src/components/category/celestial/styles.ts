import styled, { css, keyframes } from "styled-components";

/* ── 등장 모션 (한 번만, 잔잔하게) ─────────────────────── */
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(7px); }
    to { opacity: 1; transform: translateY(0); }
`;

const emblemIn = keyframes`
    from { opacity: 0; transform: scale(0.72) rotate(-8deg); }
    to { opacity: 1; transform: scale(1) rotate(0deg); }
`;

/* 날렵한 4각 별 (사이드바 bigstar 곡선) */
export const SLENDER_STAR_48 =
    "M24 6C24 24 24 24 32 24C24 24 24 24 24 42C24 24 24 24 16 24C24 24 24 24 24 6Z";

const starChip = css`
    clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
`;

/* ── 페이지 골격 ───────────────────────────────────────── */
export const CategoryWrapper = styled.div`
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: ${(props) => props.theme.colors.background};
    font-family: ${(props) => props.theme.fonts.celestial};
`;

export const CenterWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: 1100px;
    padding: 0 clamp(8px, 2vw, 24px);
`;

/* 배경 별자리 워터마크 (기념일 화면과 동일 언어) */
export const Zodiac = styled.svg`
    position: absolute;
    top: -50px;
    right: -70px;
    width: 360px;
    height: 360px;
    color: ${(p) => p.theme.colors.primary};
    opacity: 0.055;
    pointer-events: none;

    circle, line {
        fill: none;
        stroke: currentColor;
    }

    .dashed { stroke-dasharray: 2 6; }
`;

export const PageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    i {
        width: 7px;
        height: 7px;
        border: 1px solid ${(p) => p.theme.colors.primary};
        transform: rotate(45deg);
        flex-shrink: 0;
    }

    span {
        font-family: ${(p) => p.theme.fonts.celestial};
        font-size: 1.3rem;
        letter-spacing: 5px;
        color: ${(p) => p.theme.colors.text};
        white-space: nowrap;
    }

    hr {
        flex: 1;
        border: none;
        height: 1px;
        margin: 0;
        background: linear-gradient(to right, ${(p) => p.theme.colors.primary}, transparent);
    }
`;

export const BodyRow = styled.div`
    display: flex;
    flex: 1;
    min-height: 0;
    gap: 28px;
`;

/* ── ① 좌측: 카드 덱 ──────────────────────────────────── */
export const SidebarContainer = styled.div`
    flex: 0 1 230px;
    width: 230px;
    min-width: 150px;
    display: flex;
    flex-direction: column;
`;

export const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 8px 12px 2px;
    overflow-y: auto;
`;

export const DeckCard = styled.button<{ $color: string; $isSelected: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 12px;
    background: transparent;
    border: 1px solid ${(p) => p.theme.colors.primary}${(p) => (p.$isSelected ? "" : "55")};
    color: ${(p) => p.theme.colors.text};
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    animation: ${fadeUp} 0.4s ease both;

    /* 이중 프레임 */
    &::before {
        content: "";
        position: absolute;
        inset: 3px;
        border: 1px solid ${(p) => p.theme.colors.primary}18;
        pointer-events: none;
        transition: border-color 0.2s ease;
    }

    &:hover {
        transform: translateX(3px);
        border-color: ${(p) => p.theme.colors.primary}aa;
        &::before { border-color: ${(p) => p.theme.colors.primary}33; }
    }

    ${(p) => p.$isSelected && css`
        transform: translateX(6px);
        box-shadow: 0 0 9px ${p.theme.colors.primary}40;
        &::before { border-color: ${p.theme.colors.primary}33; }
        &:hover { transform: translateX(6px); }
    `}

    .num {
        width: 20px;
        flex-shrink: 0;
        font-size: 0.62rem;
        letter-spacing: 1px;
        color: ${(p) => p.theme.colors.primary};
        opacity: 0.85;
    }

    .chip {
        width: 9px;
        height: 9px;
        flex-shrink: 0;
        background-color: ${(p) => p.$color};
        ${starChip}
    }

    .nm {
        flex: 1;
        min-width: 0;
        font-family: ${(p) => p.theme.fonts.celestial};
        font-size: 0.85rem;
        letter-spacing: 0.5px;
        color: ${(p) => (p.$isSelected ? p.theme.colors.primary : p.theme.colors.text)};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.2s ease;
    }

    .mark {
        flex-shrink: 0;
        font-size: 0.6rem;
        color: ${(p) => p.theme.colors.primary};
    }
`;

/* 덱 끝의 새 카드(추가) */
export const DeckAddCard = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 12px;
    background: transparent;
    border: 1px dashed ${(p) => p.theme.colors.primary}55;
    color: ${(p) => p.theme.colors.textSecondary};
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        border-color: ${(p) => p.theme.colors.primary};
        color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 7px ${(p) => p.theme.colors.primary}33;
    }
`;

/* ── 우측 컨텐츠 ──────────────────────────────────────── */
export const ContentContainer = styled.div`
    flex: 1 1 400px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

export const DetailInfo = styled.div`
    padding: 4px clamp(4px, 2vw, 20px) 24px;
    animation: ${fadeUp} 0.35s ease both;
`;

/* 코너 다이아 장식 (기념일 카드와 동일) */
export const Corners = styled.span`
    i {
        position: absolute;
        width: 6px;
        height: 6px;
        border: 1px solid ${(p) => p.theme.colors.primary}88;
        background: ${(p) => p.theme.colors.background};
        transform: rotate(45deg);
        pointer-events: none;
    }

    i:nth-child(1) { top: -3.5px; left: -3.5px; }
    i:nth-child(2) { top: -3.5px; right: -3.5px; }
    i:nth-child(3) { bottom: -3.5px; left: -3.5px; }
    i:nth-child(4) { bottom: -3.5px; right: -3.5px; }
`;

/* ── ② 표제부(플레이트): 엠블럼 + 이름 ─────────────────── */
export const Plate = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 18px 20px;
    margin-bottom: 22px;
    border: 1px solid ${(p) => p.theme.colors.primary}66;
`;

export const EmblemWrap = styled.div<{ $color: string }>`
    position: relative;
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    cursor: pointer;
    animation: ${emblemIn} 0.5s ease both;

    svg {
        width: 100%;
        height: 100%;
        overflow: visible;

        .ring {
            fill: none;
            stroke: ${(p) => p.theme.colors.primary};
            stroke-width: 1;
        }

        .star {
            fill: none;
            stroke: ${(p) => p.$color};
            stroke-width: 1.2;
            stroke-linejoin: round;
            transition: stroke 0.25s ease;
        }
    }

    &:hover svg {
        filter: drop-shadow(0 0 4px ${(p) => p.theme.colors.primary}66);
    }

    .color-input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: none;
        padding: 0;
    }
`;

export const PlateText = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;

    .numeral {
        font-size: 0.66rem;
        letter-spacing: 3px;
        color: ${(p) => p.theme.colors.primary};
        opacity: 0.85;
    }

    .title-input {
        font-family: ${(p) => p.theme.fonts.celestial};
        font-size: 1.35rem;
        letter-spacing: 3px;
        color: ${(p) => p.theme.colors.text};
        background: transparent;
        border: none;
        outline: none;
        width: 100%;
        padding: 2px 0;
        line-height: 1.2;

        &::placeholder {
            color: ${(p) => p.theme.colors.textSecondary}80;
        }
    }

    .sub {
        font-size: 0.66rem;
        letter-spacing: 2px;
        color: ${(p) => p.theme.colors.textSecondary};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

/* ── ③ 탭 ─────────────────────────────────────────────── */
export const DetailHeader = styled.div<{ $activeTab: string }>`
    display: flex;
    gap: 24px;
    margin-bottom: 22px;

    button {
        position: relative;
        background: transparent;
        border: none;
        padding: 4px 2px 8px;
        font-family: ${(p) => p.theme.fonts.celestial};
        font-size: 0.85rem;
        letter-spacing: 2px;
        color: ${(p) => p.theme.colors.textSecondary};
        cursor: pointer;
        transition: color 0.2s ease, text-shadow 0.2s ease;

        /* 골드 밑줄 */
        &::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            height: 1px;
            width: 0;
            background: ${(p) => p.theme.colors.primary};
            transition: width 0.25s ease;
        }

        &:hover {
            color: ${(p) => p.theme.colors.primary};
        }
    }

    ${(p) => css`
        .${p.$activeTab === "info" ? "info-tab" : "todo-tab"} {
            color: ${p.theme.colors.primary};
            text-shadow: 0 0 8px ${p.theme.colors.primary}66;

            &::after { width: 100%; }
        }
    `}
`;

export const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 22px;
`;

/* ── ④ 점선 리더 속성 ─────────────────────────────────── */
export const LoreRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 10px;

    .k {
        font-size: 0.72rem;
        letter-spacing: 2px;
        color: ${(p) => p.theme.colors.textSecondary};
        white-space: nowrap;
        flex-shrink: 0;
    }

    .dots {
        flex: 1;
        border-bottom: 1px dotted ${(p) => p.theme.colors.primary}55;
        transform: translateY(-3px);
    }

    .v {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.85rem;
        color: ${(p) => p.theme.colors.text};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 55%;
    }
`;

export const DescBlock = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 14px 10px;
    border: 1px solid ${(p) => p.theme.colors.primary}44;

    .cap {
        position: absolute;
        top: -8px;
        left: 12px;
        padding: 0 8px;
        background: ${(p) => p.theme.colors.background};
        font-size: 0.66rem;
        letter-spacing: 3px;
        color: ${(p) => p.theme.colors.primary};
    }

    textarea {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: ${(p) => p.theme.colors.text};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.85rem;
        line-height: 1.6;
        resize: vertical;
        min-height: 56px;

        &::placeholder {
            color: ${(p) => p.theme.colors.textSecondary}66;
        }
    }
`;

/* ── ⑤ 멤버 메달 ──────────────────────────────────────── */
export const SectionCap = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.72rem;
    letter-spacing: 3px;
    color: ${(p) => p.theme.colors.textSecondary};

    b {
        font-weight: 400;
        color: ${(p) => p.theme.colors.primary};
    }

    hr {
        flex: 1;
        border: none;
        height: 1px;
        margin: 0;
        background: linear-gradient(to right, ${(p) => p.theme.colors.primary}66, transparent);
    }
`;

export const MedalRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 14px 22px;
`;

export const Medal = styled.div<{ $ghost?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: ${(p) => (p.$ghost ? p.theme.colors.textSecondary : p.theme.colors.text)};
    cursor: ${(p) => (p.$ghost ? "pointer" : "default")};

    .av {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px ${(p) => (p.$ghost ? "dashed" : "solid")} ${(p) =>
            p.$ghost ? p.theme.colors.textSecondary : p.theme.colors.primary};
        color: ${(p) => (p.$ghost ? p.theme.colors.textSecondary : p.theme.colors.primary)};
        font-size: 0.72rem;
        flex-shrink: 0;
        box-shadow: ${(p) => (p.$ghost ? "none" : `inset 0 0 6px ${p.theme.colors.primary}33`)};
        transition: border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    }

    ${(p) => p.$ghost && css`
        &:hover .av {
            border-color: ${p.theme.colors.primary};
            color: ${p.theme.colors.primary};
            box-shadow: 0 0 7px ${p.theme.colors.primary}33;
        }
        &:hover { color: ${p.theme.colors.primary}; }
    `}

    .owner-mark {
        font-size: 0.6rem;
        color: ${(p) => p.theme.colors.primary};
    }

    .kick {
        position: absolute;
        top: -5px;
        left: 20px;
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: ${(p) => p.theme.colors.background};
        border: 1px solid ${(p) => p.theme.colors.textSecondary}66;
        color: ${(p) => p.theme.colors.textSecondary};
        font-size: 0.6rem;
        line-height: 1;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease, color 0.2s ease, border-color 0.2s ease;

        &:hover {
            color: ${(p) => p.theme.colors.error};
            border-color: ${(p) => p.theme.colors.error};
        }
    }

    &:hover .kick { opacity: 1; }
`;

export const ActionFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
`;

/* ── ⑥ 할 일 미니 타로 카드 ───────────────────────────── */
export const TodoListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const TodoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
`;

export const TodoCard = styled.div<{ $isDone: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    border: 1px solid ${(p) => p.theme.colors.primary}55;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.25s ease;
    opacity: ${(p) => (p.$isDone ? 0.62 : 1)};

    &::before {
        content: "";
        position: absolute;
        inset: 3px;
        border: 1px solid ${(p) => p.theme.colors.primary}15;
        pointer-events: none;
        transition: border-color 0.2s ease;
    }

    &:hover {
        border-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 7px ${(p) => p.theme.colors.primary}40;

        &::before { border-color: ${(p) => p.theme.colors.primary}33; }
        .delete-btn { opacity: 1; }
    }

    /* 완료 봉인 */
    .check-btn {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid ${(p) => p.theme.colors.primary};
        background: ${(p) => (p.$isDone ? `${p.theme.colors.primary}2e` : "transparent")};
        color: ${(p) => p.theme.colors.primary};
        font-size: 0.58rem;
        cursor: pointer;
        transition: background 0.2s ease, box-shadow 0.2s ease;
        box-shadow: ${(p) => (p.$isDone ? `0 0 6px ${p.theme.colors.primary}77` : "none")};

        &:hover {
            box-shadow: 0 0 6px ${(p) => p.theme.colors.primary}66;
        }
    }

    .todo-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;

        .title {
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 0.85rem;
            color: ${(p) => p.theme.colors.text};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-decoration: ${(p) => (p.$isDone ? "line-through" : "none")};
        }

        .date {
            font-size: 0.68rem;
            letter-spacing: 0.5px;
            color: ${(p) => p.theme.colors.textSecondary};
        }
    }

    .delete-btn {
        flex-shrink: 0;
        background: transparent;
        border: none;
        padding: 4px 6px;
        color: ${(p) => p.theme.colors.textSecondary};
        font-size: 0.85rem;
        line-height: 1;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease, color 0.2s ease;

        &:hover { color: ${(p) => p.theme.colors.error}; }
    }
`;

/* 빈 상태 (테두리 상자 + 코너) */
export const EmptyBox = styled.div`
    position: relative;
    padding: 34px 20px;
    text-align: center;
    border: 1px solid ${(p) => p.theme.colors.primary}44;

    p {
        margin: 0;
        font-size: 0.82rem;
        letter-spacing: 1px;
        color: ${(p) => p.theme.colors.textSecondary};
        line-height: 1.7;
    }
`;

/* 선택 전 화면 */
export const EmptyStateContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    color: ${(p) => p.theme.colors.textSecondary};
    font-size: 0.88rem;
    letter-spacing: 1.5px;

    svg {
        width: 72px;
        height: 72px;
        opacity: 0.4;

        .ring {
            fill: none;
            stroke: ${(p) => p.theme.colors.primary};
            stroke-width: 1;
            stroke-dasharray: 2 5;
        }

        .star {
            fill: none;
            stroke: ${(p) => p.theme.colors.primary};
            stroke-width: 1.1;
            stroke-linejoin: round;
        }
    }

    p {
        margin: 0;
        text-align: center;
        line-height: 1.8;
    }
`;

/* ── 모달 (기존 유지) ─────────────────────────────────── */
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    position: relative;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    width: 380px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    font-family: ${(props) => props.theme.fonts.celestial};

    .modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};

        h3 {
            margin: 0;
            font-size: 1rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 400;
            letter-spacing: 1.5px;
        }
    }

    .modal-body {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        p {
            color: ${(props) => props.theme.colors.textSecondary};
            font-size: 0.9rem;
            margin: 0;
            line-height: 1.5;
        }

        input {
            width: 100%;
            padding: 9px 12px;
            background: transparent;
            border: 1px solid ${(props) => props.theme.colors.primary};
            outline: none;
            font-size: 0.9rem;
            font-family: ${(props) => props.theme.fonts.body};
            color: ${(props) => props.theme.colors.text};
            transition: all 0.2s;
            box-sizing: border-box;

            &::placeholder {
                color: ${(props) => props.theme.colors.textSecondary}66;
            }

            &:focus {
                box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}30;
            }
        }
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 24px;
        border-top: 1px solid ${(props) => props.theme.colors.primary}40;
    }
`;
