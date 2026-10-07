/**
 * 바다의 카테고리 — 뼈대(왼쪽 목록 | 오른쪽 자세히)는 Celestial 과 같고, 겉만 바꾼다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 별자리 워터마크·마름모 귀퉁이·겹 테두리 카드·금빛 밑줄 탭 대신:
 *   왼쪽은 판 한 장 안의 40px 줄 목록(카테고리 색 점, 고르면 옅은 청록 면), 오른쪽은 판 한 장의 자세히 —
 *   색 견본 네모(눌러 색 바꾸기), 둘로 나뉜 탭(segmented), 입력칸 같은 설명, 동그란 참여자, 작은 카드의 할 일.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialCategory.styles";
import { R, bubbleCheck, hairline, ink, label, surface, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialCategory.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 바탕은 물빛이 비치도록 비운다 */
export const CategoryWrapper = styled(C.CategoryWrapper)`
    background-color: transparent;
    font-family: ${(p) => p.theme.fonts.body};
    color: ${(p) => p.theme.colors.text};
`;

export const CenterWrapper = styled(C.CenterWrapper)`
    max-width: 1120px;
    padding: 0;
`;

export const Zodiac = styled(C.Zodiac)`
    display: none;
`;

/** 화면 제목 — 굵은 글씨 하나 */
export const PageHeader = styled(C.PageHeader)`
    margin-bottom: 16px;
    i, hr { display: none; }
    span {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
    }
`;

export const BodyRow = styled(C.BodyRow)`
    gap: 16px;
    ${MOBILE} { gap: 12px; }
`;

/** 왼쪽 — 판 한 장 */
export const SidebarContainer = styled(C.SidebarContainer)`
    flex: 0 1 250px;
    width: 250px;
    align-self: flex-start;
    max-height: 100%;
    ${surface("panel")}
    border-radius: ${R.lg};
    padding: 8px;

    /* 폰에서는 위아래로 쌓이므로 230px 기준 폭이 높이가 되지 않게 */
    ${MOBILE} { flex: none; width: 100%; align-self: stretch; padding: 6px; border-radius: 16px; }
`;

export const CategoryList = styled(C.CategoryList)`
    min-height: 0;
    gap: 2px;
    padding: 0;
    ${MOBILE} { gap: 4px; padding: 0; & > * { min-width: 132px; } }
`;

/** 카테고리 한 줄 — 색 점과 이름. 고르면 옅은 청록 면 */
export const DeckCard = styled(C.DeckCard)`
    gap: 10px;
    min-height: 40px;
    padding: 0 12px;
    border: none;
    border-radius: 10px;
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1) : "transparent")};
    box-shadow: none;
    transition: background-color 0.15s ease;

    &::before { display: none; }
    &:hover { transform: none; background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.12) : ink(p.theme, dark(p) ? 0.06 : 0.045))}; }
    ${(p) => p.$isSelected && css`
        transform: none;
        &:hover { transform: none; }
    `}

    .num, .mark { display: none; }
    .chip {
        width: 8px;
        height: 8px;
        clip-path: none;
        border-radius: 50%;
    }
    .nm {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.88rem;
        font-weight: ${(p) => (p.$isSelected ? 600 : 500)};
        letter-spacing: -0.005em;
        color: ${(p) => (p.$isSelected ? p.theme.colors.text : p.theme.colors.textSecondary)};
    }
    &:hover .nm { color: ${(p) => p.theme.colors.text}; }

    ${MOBILE} { min-height: 44px; }
`;

/** 목록 끝의 + — 글씨만 있는 줄 */
export const DeckAddCard = styled(C.DeckAddCard)`
    min-height: 40px;
    margin-top: 4px;
    border: 1px dashed ${(p) => hairline(p.theme, true)};
    border-radius: 10px;
    color: ${(p) => p.theme.colors.textSecondary};
    font-size: 1rem;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    &:hover {
        box-shadow: none;
        color: ${(p) => p.theme.colors.text};
        border-color: ${(p) => ink(p.theme, 0.2)};
        background-color: ${(p) => ink(p.theme, 0.04)};
    }
    ${MOBILE} { min-height: 44px; margin-top: 0; }
`;

/** 오른쪽 — 자세히 판 한 장 */
export const ContentContainer = styled(C.ContentContainer)`
    ${surface("panel")}
    border-radius: ${R.lg};
    ${MOBILE} { border-radius: 16px; }
`;

export const DetailInfo = styled(C.DetailInfo)`
    padding: 24px 24px 24px;
    ${MOBILE} { padding: 18px 16px; }
`;

/** 마름모 귀퉁이는 바다에 없다 */
export const Corners = styled(C.Corners)`
    display: none;
`;

/** 표제부 — 테두리 없이: 색 견본 네모 + 이름 */
export const Plate = styled(C.Plate)`
    gap: 16px;
    padding: 0;
    margin-bottom: 22px;
    border: none;
`;

/** 색 견본 — 눌러서 색을 바꾼다 (별·고리 그림 대신 그 색의 네모 하나) */
export const EmblemWrap = styled(C.EmblemWrap)`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background-color: ${(p) => p.$color};
    box-shadow: inset 0 0 0 1px ${(p) => ink(p.theme, 0.08)};
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    svg { display: none; }
    &:hover { box-shadow: inset 0 0 0 1px ${(p) => ink(p.theme, 0.12)}, 0 0 0 3px ${(p) => withAlpha(p.$color, 0.25)}; }
    &:active { transform: scale(0.97); }
    .color-input { border-radius: 12px; }
`;

export const PlateText = styled(C.PlateText)`
    gap: 2px;
    .numeral { display: none; }
    .title-input {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 1.35rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        padding: 2px 0;
        border-radius: 6px;
        &::placeholder { color: ${(p) => ink(p.theme, 0.3)}; }
        &:focus-visible { outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.4)}; outline-offset: 2px; }
    }
    .sub {
        font-size: 0.78rem;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
    }
`;

/** 탭 — 금빛 밑줄 대신 둘로 나뉜 납작한 단추 (고른 쪽이 흰 면으로 떠오른다) */
export const DetailHeader = styled(C.DetailHeader)`
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    margin-bottom: 22px;
    border-radius: 10px;
    background-color: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)};

    button {
        height: 30px;
        padding: 0 14px;
        border-radius: 8px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.82rem;
        font-weight: 600;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
        transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        &::after { display: none; }
        &:hover { color: ${(p) => p.theme.colors.text}; }
    }

    ${(p) => css`
        .${p.$activeTab === "info" ? "info-tab" : "todo-tab"} {
            color: ${p.theme.colors.text};
            text-shadow: none;
            background-color: ${dark(p) ? "rgba(255, 255, 255, 0.1)" : "#FFFFFF"};
            box-shadow: 0 1px 2px ${dark(p) ? "rgba(0, 0, 0, 0.3)" : "rgba(18, 33, 32, 0.08)"};
        }
    `}
`;

export const InfoContainer = styled(C.InfoContainer)`
    gap: 24px;
`;

/** 만든 사람 — 점선 이음 없이 이름표와 값 */
export const LoreRow = styled(C.LoreRow)`
    gap: 12px;
    .k { font-size: 0.8rem; letter-spacing: 0; }
    .dots { border-bottom: none; }
    .v { font-size: 0.88rem; font-weight: 500; }
`;

/** 설명 — 테두리를 가르는 캡션 대신 위의 작은 이름표와 입력칸 */
export const DescBlock = styled(C.DescBlock)`
    gap: 8px;
    padding: 0;
    border: none;

    .cap {
        position: static;
        padding: 0;
        background: none;
        font-size: 0.8rem;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    textarea {
        ${tideInput}
        padding: 10px 12px;
        font-size: 0.88rem;
        line-height: 1.6;
        &::placeholder { color: ${(p) => ink(p.theme, 0.32)}; }
    }
`;

/** 구역 이름 — 작은 글씨와 고정폭 개수, 실선 없음 */
export const SectionCap = styled(C.SectionCap)`
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};
    b { ${label} color: ${(p) => p.theme.colors.textSecondary}; }
    hr { display: none; }
`;

export const MedalRow = styled(C.MedalRow)`
    gap: 10px 18px;
`;

/** 참여자 — 동그란 머리글자. 주인은 이름 옆 청록 점, 초대는 점선 동그라미 */
export const Medal = styled(C.Medal)`
    gap: 8px;
    font-size: 0.86rem;

    .av {
        width: 32px;
        height: 32px;
        border: 1px ${(p) => (p.$ghost ? "dashed" : "solid")} ${(p) => (p.$ghost ? ink(p.theme, 0.25) : hairline(p.theme, true))};
        background-color: ${(p) => (p.$ghost ? "transparent" : ink(p.theme, dark(p) ? 0.08 : 0.05))};
        color: ${(p) => (p.$ghost ? p.theme.colors.textSecondary : p.theme.colors.text)};
        font-size: 0.78rem;
        font-weight: 600;
        box-shadow: none;
    }
    ${(p) => p.$ghost && css`
        &:hover .av { box-shadow: none; border-color: ${p.theme.colors.primary}; color: ${p.theme.colors.primary}; }
        &:hover { color: ${p.theme.colors.text}; }
    `}

    .owner-mark {
        width: 6px;
        height: 6px;
        font-size: 0;
        border-radius: 50%;
        background: ${(p) => p.theme.colors.primary};
    }
    .kick {
        top: -4px;
        left: 22px;
        width: 16px;
        height: 16px;
        ${surface("float")}
        color: ${(p) => p.theme.colors.textSecondary};
        &:hover { color: ${(p) => p.theme.colors.error}; border-color: ${(p) => withAlpha(p.theme.colors.error, 0.5)}; }
    }
`;

export const ActionFooter = styled(C.ActionFooter)`
    margin-top: 4px;
    padding-top: 16px;
    border-top: 1px solid ${(p) => hairline(p.theme)};
`;

export const TodoListContainer = styled(C.TodoListContainer)`
    gap: 14px;
`;

export const TodoGrid = styled(C.TodoGrid)`
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 8px;
`;

/** 할 일 — 판 안의 작은 카드. 체크는 청록으로 차는 동그라미 */
export const TodoCard = styled(C.TodoCard)`
    gap: 12px;
    padding: 11px 12px;
    ${surface("card")}
    border-radius: ${R.md};
    transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.2s ease;

    &::before { display: none; }
    &:hover {
        box-shadow: none;
        border-color: ${(p) => hairline(p.theme, true)};
        background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.85)")};
    }

    .check-btn {
        ${(p) => bubbleCheck(p.$isDone, "18px")}
        font-size: 0;
        box-shadow: none;
        cursor: pointer;
        &:hover { box-shadow: none; border-color: ${(p) => p.theme.colors.primary}; }
        /* 흰 체크 — 그림 없이 선 두 개 */
        &::after {
            content: "";
            position: absolute;
            left: 5.4px;
            top: 2.3px;
            width: 4px;
            height: 7.6px;
            border: solid currentColor;
            border-width: 0 1.6px 1.6px 0;
            transform: rotate(45deg);
            opacity: ${(p) => (p.$isDone ? 1 : 0)};
        }
    }
    .todo-info {
        gap: 2px;
        .title { font-size: 0.88rem; font-weight: 500; text-decoration-color: ${(p) => ink(p.theme, 0.4)}; }
        .date { font-size: 0.74rem; letter-spacing: 0; font-variant-numeric: tabular-nums; }
    }
    .delete-btn {
        border-radius: 6px;
        padding: 4px 7px;
        transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)}; }
    }
`;

export const EmptyBox = styled(C.EmptyBox)`
    padding: 32px 20px;
    border: 1px dashed ${(p) => hairline(p.theme, true)};
    border-radius: ${R.md};
    p { font-size: 0.84rem; letter-spacing: 0; }
`;

/** 고르기 전 — 그림 없이 문구만 */
export const EmptyStateContainer = styled(C.EmptyStateContainer)`
    min-height: 280px;
    font-size: 0.88rem;
    letter-spacing: 0;
    svg { display: none; }
`;

export const ModalOverlay = styled(C.ModalOverlay)`
    background-color: ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.45)" : "rgba(18, 33, 32, 0.18)")};
    backdrop-filter: blur(6px);
`;

/** 초대·내보내기 창 — 떠 있는 판, 머리·발의 실선 없음 */
export const ModalContent = styled(C.ModalContent)`
    ${surface("float")}
    width: min(380px, calc(100vw - 32px));
    border-radius: 16px;
    font-family: ${(p) => p.theme.fonts.body};

    .modal-header {
        padding: 20px 22px 4px;
        border-bottom: none;
        h3 { font-size: 1rem; font-weight: 700; letter-spacing: -0.01em; }
    }
    .modal-body {
        padding: 12px 22px 18px;
        gap: 10px;
        p { font-size: 0.86rem; }
        input {
            ${tideInput}
            height: 40px;
            padding: 0 12px;
            font-size: 0.9rem;
            &:focus { box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.16)}; }
        }
    }
    .modal-actions {
        padding: 0 22px 20px;
        border-top: none;
    }
`;
