/**
 * Maple 의 카테고리 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 왼쪽 목록은 카드 한 장 안의 둥근 줄들(줄마다 카테고리 색 단풍잎, 고르면 단풍 붉음이 옅게 — 폰에서는 옆으로 미는 알약),
 * 오른쪽은 이름판 카드(카테고리 색을 옅게 깐 동그라미 안의 단풍잎 · 명조 굵은 이름) 아래 밑줄 탭, 이름 · 값 칸, 설명 입력칸,
 * 멤버 동그라미, 할 일 카드. 예전의 덩굴 귀퉁이·잎 화환 테·놋쇠 메달·로마 숫자·점선 리더·큰 수채 잎은 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialCategory.styles";
import { withAlpha } from "@/styles/color";
import { cardShadow, crest, hair, inkCheckbox, inkInput, LEAF_PATH, leafChip, leafShapeOf, paperCard, paperTab } from "@/styles/maple/ink";
import { MOBILE, TOUCH } from "@/styles/breakpoints";

export * from "../celestial/CelestialCategory.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 색을 입힌 단풍잎 그림 — 동그라미 바탕 위에 겹쳐 깔 때(마스크를 쓰면 바탕까지 잘린다) */
const leafImage = (color: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${LEAF_PATH}' fill='${color}'/></svg>`)}")`;

/** 카드 안에 옴폭 들어간 칸의 바탕 */
const recessed = (p: { theme: { mode: string; colors: { background: string; surface: string } } }) =>
    `color-mix(in srgb, ${p.theme.colors.background} ${dark(p) ? 60 : 70}%, ${p.theme.colors.surface})`;

/** 화면 바탕 — 종이 바탕(MapleGround)이 비치게 칠하지 않는다. 글은 본문 글꼴(명조는 제목에만) */
export const CategoryWrapper = styled(C.CategoryWrapper)`
    background-color: transparent;
    font-family: ${(p) => p.theme.fonts.body};
`;

/** 배경 별자리는 Celestial 만 */
export const Zodiac = styled(C.Zodiac)`
    display: none;
`;

/** 화면 제목 — 작은 단풍잎 + 명조 굵게. 옆으로 긋던 긴 선은 걷는다 */
export const PageHeader = styled(C.PageHeader)`
    gap: 10px;
    margin-bottom: 20px;

    i {
        ${crest("16px")}
        border: none;
        transform: none;
        background-color: ${(p) => p.theme.colors.primary};
    }

    span {
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1.2;
    }

    hr { display: none; }

    ${MOBILE} {
        gap: 8px;
        margin-bottom: 14px;

        span { font-size: 22px; }
    }
`;

export const BodyRow = styled(C.BodyRow)`
    gap: 24px;

    ${MOBILE} { gap: 12px; }
`;

/** 왼쪽 목록 — 카드 한 장 안의 줄들. 폰에서는 카드를 벗고 옆으로 미는 알약 줄 */
export const CategoryList = styled(C.CategoryList)`
    ${paperCard()}
    gap: 2px;
    padding: 6px;

    /* 카드 안의 굴림 막대는 가는 것 하나 — 마우스 화면에서만(손가락 화면에서는 겹쳐 뜨는 막대가 자리를 차지하는 막대로 바뀐다) */
    @media (hover: hover) {
        scrollbar-width: thin;
        scrollbar-color: ${(p) => hair(p.theme, 0.22)} transparent;
    }

    ${MOBILE} {
        gap: 8px;
        padding: 2px 2px 8px;
        border: none;
        border-radius: 0;
        background-color: transparent;
        box-shadow: none;

        & > * { min-width: 0; }
    }
`;

/** 목록의 한 줄 — 카테고리 색 단풍잎과 이름. 고르면 단풍 붉음이 옅게 깔리고 이름이 붉다 */
export const DeckCard = styled(C.DeckCard)`
    gap: 10px;
    padding: 9px 10px;
    border: none;
    border-radius: 10px;
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.09) : "transparent")};
    box-shadow: none;
    transform: none;
    transition: background-color 0.15s ease, color 0.15s ease;

    /* 이중 테는 Celestial 만 */
    &::before { content: none; }

    &:hover {
        transform: none;
        background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.11) : hair(p.theme, dark(p) ? 0.06 : 0.045))};
    }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.4)};
    }

    /* 로마 숫자·고른 표식은 걷는다 — 고른 것은 바탕이 말한다 */
    .num, .mark { display: none; }

    .chip {
        ${(p) => leafChip(leafShapeOf(p.$color), "14px")}
        clip-path: none;
        background-color: ${(p) => p.$color};
    }

    .nm {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 14px;
        font-weight: ${(p) => (p.$isSelected ? 600 : 500)};
        letter-spacing: 0;
        color: ${(p) => (p.$isSelected ? p.theme.colors.primary : p.theme.colors.text)};
    }

    ${MOBILE} {
        padding: 8px 14px 8px 12px;
        border: 1px solid ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, 0.4) : hair(p.theme, dark(p) ? 0.16 : 0.12))};
        border-radius: 999px;
        background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.09) : p.theme.colors.surface)};
    }
`;

/** 목록 끝의 새 카테고리 — 옅은 점선 칸 */
export const DeckAddCard = styled(C.DeckAddCard)`
    margin-top: 4px;
    padding: 8px 10px;
    border: 1px dashed ${(p) => hair(p.theme, dark(p) ? 0.22 : 0.18)};
    border-radius: 10px;
    color: ${(p) => p.theme.colors.textSecondary};
    font-size: 16px;

    &:hover {
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.5)};
        color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.1 : 0.05)};
        box-shadow: none;
    }

    ${MOBILE} {
        margin-top: 0;
        padding: 8px 18px;
        border-radius: 999px;
    }
`;

/** 귀퉁이 장식 — 걷는다 */
export const Corners = styled(C.Corners)`
    display: none;
`;

/** 이름판 — 카드 한 장 */
export const Plate = styled(C.Plate)`
    ${paperCard()}
    gap: 16px;
    padding: 18px 20px;
    margin-bottom: 18px;

    ${MOBILE} { padding: 16px; gap: 14px; }
`;

/** 색 견본 — 카테고리 색을 옅게 깐 동그라미 안의 단풍잎(눌러 색을 바꾼다) */
export const EmblemWrap = styled(C.EmblemWrap)`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${(p) => `${leafImage(p.$color)} center / 26px 26px no-repeat, color-mix(in srgb, ${p.$color} ${dark(p) ? 24 : 16}%, transparent)`};
    transition: box-shadow 0.2s ease;

    svg { display: none; }

    &:hover { box-shadow: 0 0 0 4px ${(p) => `color-mix(in srgb, ${p.$color} 18%, transparent)`}; }
    &:focus-within { box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.3)}; }
`;

/** 이름 — 명조 굵게(화면의 둘째 제목). 고칠 수 있는 칸이라 올리면 옅은 밑줄, 쓰는 동안 붉은 밑줄 */
export const PlateText = styled(C.PlateText)`
    gap: 4px;

    .numeral { display: none; }

    .title-input {
        padding: 2px 0 3px;
        border-bottom: 1px solid transparent;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1.25;
        transition: border-color 0.15s ease;

        &:hover { border-bottom-color: ${(p) => hair(p.theme, 0.14)}; }
        &:focus { border-bottom-color: ${(p) => p.theme.colors.primary}; }

        ${MOBILE} { font-size: 21px; }
    }

    .sub {
        font-size: 13px;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
    }
`;

/** 정보 · 할 일 탭 — 옅은 밑줄 위의 탭, 고른 탭은 글자색 굵게 + 붉은 막대 */
export const DetailHeader = styled(C.DetailHeader)`
    gap: 22px;
    margin-bottom: 20px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.1)};

    button {
        ${paperTab(false)}
        padding: 6px 2px 10px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 14px;
        letter-spacing: 0;
        text-shadow: none;

        /* Celestial 의 자라나는 금선 자리 — 밑줄 위에 얹는 붉은 막대 */
        &::after { width: auto; bottom: -1px; }
    }

    ${(p) => css`
        .${p.$activeTab === "info" ? "info-tab" : "todo-tab"} {
            color: ${p.theme.colors.text};
            font-weight: 600;
            text-shadow: none;
            &::after { opacity: 1; }
        }
    `}
`;

export const InfoContainer = styled(C.InfoContainer)`
    gap: 20px;
`;

/** 만든 사람 — 옴폭한 칸 안의 이름 · 값 한 줄 (점선 리더는 Celestial 만) */
export const LoreRow = styled(C.LoreRow)`
    align-items: center;
    padding: 12px 14px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.07)};
    border-radius: 10px;
    background-color: ${recessed};

    .k {
        font-size: 13px;
        letter-spacing: 0;
    }

    .dots { border-bottom: none; }

    .v {
        font-size: 14px;
        font-weight: 600;
    }
`;

/** 설명 — 이름표는 칸 위에 한 줄, 칸은 둥근 입력칸 */
export const DescBlock = styled(C.DescBlock)`
    gap: 8px;
    padding: 0;
    border: none;

    .cap {
        position: static;
        padding: 0;
        background: none;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    textarea {
        ${inkInput}
        min-height: 84px;
        padding: 10px 12px;
        font-size: 14px;
        line-height: 1.6;
    }
`;

/** 구역 이름(멤버 · 할 일) — 명조 굵게, 개수는 옅은 알약 */
export const SectionCap = styled(C.SectionCap)`
    gap: 8px;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};

    b {
        display: inline-flex;
        align-items: center;
        min-width: 22px;
        height: 20px;
        padding: 0 7px;
        justify-content: center;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.07)};
        color: ${(p) => p.theme.colors.textSecondary};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    hr { display: none; }
`;

export const MedalRow = styled(C.MedalRow)`
    gap: 14px 20px;
`;

/** 멤버 — 단풍 붉음을 옅게 깐 동그라미에 첫 글자. 초대(빈 자리)는 옅은 점선 동그라미 */
export const Medal = styled(C.Medal)`
    gap: 8px;
    font-size: 14px;

    .av {
        width: 34px;
        height: 34px;
        border: ${(p) => (p.$ghost ? `1px dashed ${hair(p.theme, 0.3)}` : "none")};
        box-shadow: none;
        background: ${(p) => (p.$ghost ? "transparent" : withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.1))};
        color: ${(p) => (p.$ghost ? p.theme.colors.textSecondary : p.theme.colors.primary)};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 14px;
        font-weight: 700;
        text-shadow: none;
    }

    ${(p) => p.$ghost && css`
        &:hover .av { box-shadow: none; border-color: ${p.theme.colors.primary}; color: ${p.theme.colors.primary}; }
        &:focus-visible { outline: none; }
        &:focus-visible .av { box-shadow: 0 0 0 3px ${withAlpha(p.theme.colors.primary, 0.28)}; }
    `}

    /* 만든 이 — 이름 뒤의 작은 단풍잎 */
    .owner-mark {
        ${crest("11px")}
        font-size: 0;
        background-color: ${(p) => p.theme.colors.primary};
    }

    .kick {
        top: -4px;
        left: 24px;
        width: 16px;
        height: 16px;
        background: ${(p) => p.theme.colors.surface};
        border: 1px solid ${(p) => hair(p.theme, 0.2)};
        font-size: 12px;
    }

    ${TOUCH} { .kick { opacity: 1; } }
`;

export const TodoListContainer = styled(C.TodoListContainer)`
    gap: 14px;
`;

export const TodoGrid = styled(C.TodoGrid)`
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
`;

/** 할 일 — 작은 카드. 체크는 둥근 네모(끝내면 단풍 붉음에 흰 체크) */
export const TodoCard = styled(C.TodoCard)`
    ${paperCard()}
    gap: 12px;
    padding: 12px 10px 12px 14px;
    border-radius: 12px;

    &:hover {
        border-color: ${(p) => hair(p.theme, dark(p) ? 0.2 : 0.16)};
        box-shadow: ${cardShadow};
    }

    .check-btn {
        ${(p) => inkCheckbox(p.$isDone)}
        width: 20px;
        height: 20px;
        font-size: 0;

        &:hover { box-shadow: none; }
    }

    .todo-info {
        gap: 3px;

        .title {
            font-size: 14px;
            font-weight: 500;
            color: ${(p) => (p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text)};
            text-decoration-color: ${(p) => hair(p.theme, 0.45)};
        }

        .date {
            font-size: 12px;
            letter-spacing: 0;
            font-variant-numeric: tabular-nums;
        }
    }

    .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border-radius: 8px;
        font-size: 17px;
        transition: opacity 0.2s ease, color 0.15s ease, background-color 0.15s ease;

        &:hover {
            color: ${(p) => p.theme.colors.error};
            background-color: ${(p) => withAlpha(p.theme.colors.error, dark(p) ? 0.16 : 0.1)};
        }
    }

    &:focus-within .delete-btn { opacity: 1; }
    ${TOUCH} { .delete-btn { opacity: 0.6; } }
`;

/** 할 일이 없을 때 — 옅은 점선 칸에 한 줄 */
export const EmptyBox = styled(C.EmptyBox)`
    padding: 32px 20px;
    border: 1px dashed ${(p) => hair(p.theme, dark(p) ? 0.2 : 0.16)};
    border-radius: 14px;

    p {
        font-size: 14px;
        letter-spacing: 0;
    }
`;

/** 고르기 전 — 옅은 붉은 동그라미 안의 단풍잎 아래 한 줄 (별 그림은 Celestial 만) */
export const EmptyStateContainer = styled(C.EmptyStateContainer)`
    gap: 14px;
    font-size: 14px;
    letter-spacing: 0;
    word-break: keep-all;

    svg { display: none; }

    &::before {
        content: "";
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: ${(p) => `${leafImage(p.theme.colors.primary)} center / 24px 24px no-repeat, ${withAlpha(p.theme.colors.primary, dark(p) ? 0.14 : 0.08)}`};
    }
`;

/** 초대 · 내보내기 창 — 카드 한 장, 제목은 명조 굵게, 입력칸은 둥근 칸 */
export const ModalContent = styled(C.ModalContent)`
    ${paperCard()}
    width: min(380px, calc(100vw - 32px));
    border-radius: 16px;
    font-family: ${(p) => p.theme.fonts.body};
    box-shadow: ${(p) => (dark(p) ? "0 24px 60px -20px rgba(0, 0, 0, 0.7)" : "0 24px 60px -20px rgba(86, 54, 32, 0.45)")};

    .modal-header {
        padding: 18px 22px 6px;
        border-bottom: none;

        h3 {
            font-family: ${(p) => p.theme.fonts.display};
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0;
        }
    }

    .modal-body {
        padding: 8px 22px 18px;

        p { font-size: 14px; word-break: keep-all; }

        input {
            ${inkInput}
            height: 40px;
            padding: 0 12px;
            font-size: 14px;
        }
    }

    .modal-actions {
        padding: 12px 22px 18px;
        border-top: 1px solid ${(p) => hair(p.theme, 0.08)};
    }
`;
