/**
 * Maple 의 카테고리 — 표본 서랍 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 별자리 워터마크·마름모 귀퉁이·별 칩 대신: 종이 카드 덱, 카드마다 카테고리 색 잎, 표제부의 덩굴 귀퉁이(C3),
 * 완료 봉인은 체크 도장(C7), 참여자 메달은 놋쇠 메달(F2).
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialCategory.styles";
import { withAlpha } from "@/styles/color";
import { ASSET, checkStamp, crest, hair, inkMask, leafBullet, paperCard, paperTab } from "@/styles/maple/ink";

export * from "../celestial/CelestialCategory.styles";

/** 배경 별자리는 뗀다 — 대신 잎 한 장이 귀퉁이에 옅게 놓인다 */
export const Zodiac = styled(C.Zodiac)`
    display: none;
`;

export const CenterWrapper = styled(C.CenterWrapper)`
    &::after {
        content: "";
        position: absolute;
        right: -70px;
        top: -60px;
        width: 240px;
        height: 240px;
        background: url("${ASSET}/leaf-orange.webp") center / contain no-repeat;
        opacity: ${(p) => (p.theme.mode === "dark" ? 0.09 : 0.11)};
        transform: rotate(24deg);
        pointer-events: none;
    }
`;

export const PageHeader = styled(C.PageHeader)`
    i {
        ${crest("14px")}
        border: none;
        transform: none;
        background-color: ${(p) => p.theme.colors.primary};
    }

    span { letter-spacing: 0.14em; }

    hr { background: linear-gradient(to right, ${(p) => hair(p.theme, 0.45)}, transparent); }
`;

/** 카드 덱: 종이 카드에 카테고리 색 잎. 고른 카드는 황토 물과 붉은 먹선 */
export const DeckCard = styled(C.DeckCard)`
    ${paperCard("3px")}
    border-color: ${(p) => (p.$isSelected ? p.theme.colors.primary : hair(p.theme, 0.35))};
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.accent, 0.18) : p.theme.colors.surface)};

    &:hover { border-color: ${(p) => hair(p.theme, 0.75)}; &::before { border-color: ${(p) => hair(p.theme, 0.12)}; } }

    ${(p) => p.$isSelected && css`
        box-shadow: none;
        &::before { border-color: ${withAlpha(p.theme.colors.primary, 0.3)}; }
    `}

    .num { font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.8rem; letter-spacing: 0.06em; }

    .chip {
        ${leafBullet(true, "12px")}
        clip-path: none;
        background-color: ${(p) => p.$color};
    }

    .mark {
        ${leafBullet(true, "9px")}
        font-size: 0;
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

export const DeckAddCard = styled(C.DeckAddCard)`
    border-color: ${(p) => hair(p.theme, 0.4)};
    border-radius: 2px;

    &:hover {
        border-color: ${(p) => p.theme.colors.primary};
        color: ${(p) => p.theme.colors.primary};
        box-shadow: none;
        background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)};
    }
`;

/** 귀퉁이 마름모 → 덩굴 장식 (C3) */
export const Corners = styled(C.Corners)`
    i {
        width: 22px;
        height: 22px;
        border: none;
        background: ${(p) => p.theme.colors.text};
        ${inkMask("corner.webp")}
        opacity: 0.65;
    }
    i:nth-child(1) { top: 2px; left: 2px; transform: none; }
    i:nth-child(2) { top: 2px; right: 2px; transform: scaleX(-1); }
    i:nth-child(3) { bottom: 2px; left: 2px; transform: scaleY(-1); }
    i:nth-child(4) { bottom: 2px; right: 2px; transform: scale(-1); }
`;

/** 표제부: 종이 위의 이름표 */
export const Plate = styled(C.Plate)`
    ${paperCard("4px")}
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

/** 엠블럼: 금빛 고리 안의 별 → 카테고리 색 잎 */
export const EmblemWrap = styled(C.EmblemWrap)`
    svg {
        .ring { stroke: ${(p) => hair(p.theme, 0.6)}; }
        .star { display: none; }
    }

    &::after {
        content: "";
        position: absolute;
        inset: 13px;
        ${inkMask("bullet-filled.webp")}
        background-color: ${(p) => p.$color};
        pointer-events: none;
    }

    &:hover svg { filter: none; }
`;

/** 정보·할 일 탭: 종이 탭 */
export const DetailHeader = styled(C.DetailHeader)`
    button {
        ${paperTab(false)}
        border-bottom-width: 2px;
        letter-spacing: 0.08em;
        padding-bottom: 6px;
        text-shadow: none;

        &::after { display: none; }
        &:hover { color: ${(p) => p.theme.colors.text}; }
    }

    ${(p) => css`
        .${p.$activeTab === "info" ? "info-tab" : "todo-tab"} {
            color: ${p.theme.colors.primary};
            border-bottom-color: ${p.theme.colors.primary};
            text-shadow: none;
        }
    `}
`;

export const LoreRow = styled(C.LoreRow)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const DescBlock = styled(C.DescBlock)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const SectionCap = styled(C.SectionCap)`
    letter-spacing: 0.1em;
    font-family: ${(p) => p.theme.fonts.display};
    hr { background: linear-gradient(to right, ${(p) => hair(p.theme, 0.4)}, transparent); }
`;

/** 참여자 메달: 놋쇠 메달(F2). 빈 자리는 점선 원 */
export const Medal = styled(C.Medal)`
    .av {
        border: none;
        box-shadow: none;
        color: ${(p) => p.theme.colors.background};
        font-family: ${(p) => p.theme.fonts.numeral};
        font-weight: 600;
        background: ${(p) => (p.$ghost ? "none" : `url("${ASSET}/medal-full.webp") center / contain no-repeat`)};
        ${(p) => p.$ghost && css`border: 1px dashed ${hair(p.theme, 0.5)}; color: ${p.theme.colors.textSecondary};`}
        text-shadow: ${(p) => (p.$ghost ? "none" : "0 1px 1px rgba(0,0,0,0.35)")};
    }

    ${(p) => p.$ghost && css`
        &:hover .av { box-shadow: none; border-color: ${p.theme.colors.primary}; }
    `}

    .owner-mark {
        ${crest("10px")}
        font-size: 0;
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

/** 할 일 카드: 종이 쪽지, 완료 봉인은 체크 도장 */
export const TodoCard = styled(C.TodoCard)`
    ${paperCard("3px")}
    border-color: ${(p) => hair(p.theme, 0.3)};

    &:hover { border-color: ${(p) => hair(p.theme, 0.7)}; box-shadow: none; &::before { border-color: ${(p) => hair(p.theme, 0.12)}; } }

    .check-btn {
        border-color: ${(p) => hair(p.theme, 0.5)};
        border-radius: 2px;
        background: transparent;
        box-shadow: none;
        font-size: 0;

        &::after {
            content: "";
            ${checkStamp("13px")}
            background-color: ${(p) => p.theme.colors.primary};
            opacity: ${(p) => (p.$isDone ? 1 : 0)};
            transition: opacity 0.15s ease;
        }

        &:hover { box-shadow: none; border-color: ${(p) => p.theme.colors.primary}; }
        &:hover::after { opacity: ${(p) => (p.$isDone ? 1 : 0.35)}; }
    }
`;

export const EmptyBox = styled(C.EmptyBox)`
    border-color: ${(p) => hair(p.theme, 0.3)};
    border-radius: 2px;
`;

export const EmptyStateContainer = styled(C.EmptyStateContainer)`
    svg { display: none; }

    &::before {
        content: "";
        display: block;
        width: 120px;
        height: 120px;
        margin: 0 auto 10px;
        ${inkMask("empty-projects.webp")}
        background-color: ${(p) => p.theme.colors.text};
        opacity: 0.5;
    }
`;

export const ModalContent = styled(C.ModalContent)`
    ${paperCard("4px")}
    border-color: ${(p) => hair(p.theme, 0.5)};
`;
