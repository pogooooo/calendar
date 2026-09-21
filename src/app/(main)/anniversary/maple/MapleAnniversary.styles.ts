/**
 * Maple 의 기념일 화면 — 눌러 말린 잎을 붙인 표본 카드들. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 별자리 워터마크·마름모 귀퉁이·금빛 빛무리 대신: 종이 카드에 덩굴 귀퉁이(C3), 오늘은 황토 물이 든 카드,
 * D-day 는 Cormorant 숫자, 아이콘은 먹.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialAnniversary.styles";
import { withAlpha } from "@/styles/color";
import { ASSET, crest, hair, inkInput, inkMask, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialAnniversary.styles";

export const Zodiac = styled(C.Zodiac)`
    display: none;
`;

export const Page = styled(C.Page)`
    &::after {
        content: "";
        position: absolute;
        right: -40px;
        top: -10px;
        width: 240px;
        height: 240px;
        background: url("${ASSET}/leaf-yellow.webp") center / contain no-repeat;
        opacity: ${(p) => (p.theme.mode === "dark" ? 0.12 : 0.18)};
        transform: rotate(-30deg);
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

/** 새 기념일 서식: 종이 카드 */
export const AddForm = styled(C.AddForm)`
    ${paperCard("4px")}
    border-color: ${(p) => hair(p.theme, 0.4)};
`;

export const Corners = styled(C.Corners)`
    i {
        width: 20px;
        height: 20px;
        border: none;
        background: ${(p) => p.theme.colors.text};
        ${inkMask("corner.webp")}
        opacity: 0.6;
    }
    i:nth-child(1) { top: 2px; left: 2px; transform: none; }
    i:nth-child(2) { top: 2px; right: 2px; transform: scaleX(-1); }
    i:nth-child(3) { bottom: 2px; left: 2px; transform: scaleY(-1); }
    i:nth-child(4) { bottom: 2px; right: 2px; transform: scale(-1); }
`;

export const FormCaption = styled(C.FormCaption)`
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.1em;
    background: ${(p) => p.theme.colors.surface};
`;

export const IconChoice = styled(C.IconChoice)`
    border-radius: 2px;
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.3))};
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.accent, 0.22) : "transparent")};
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};

    &:hover { box-shadow: none; border-color: ${(p) => hair(p.theme, 0.75)}; svg { filter: none; } }
    ${(p) => p.$selected && css`svg { filter: none; }`}
`;

export const TitleInput = styled(C.TitleInput)`
    ${inkInput}
`;

export const AddButton = styled(C.AddButton)`
    ${stampButton("primary")}
    &:hover:not(:disabled) { box-shadow: none; }
    &:active:not(:disabled) { background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.primary} 80%, #000)`}; }
`;

/** 카드: 종이 표본 카드. 오늘은 황토 물이 든다 (빛나지 않는다) */
export const Card = styled(C.Card)`
    ${paperCard("5px")}
    border-color: ${(p) => (p.$today ? p.theme.colors.primary : hair(p.theme, 0.35))};
    background-color: ${(p) => (p.$today ? withAlpha(p.theme.colors.accent, 0.18) : p.theme.colors.surface)};
    animation: none;
    color: inherit;

    &::before { border-color: ${(p) => hair(p.theme, 0.12)}; }
    &:hover::before { border-color: ${(p) => hair(p.theme, 0.3)}; }
`;

export const CardNumeral = styled(C.CardNumeral)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.86rem;
    letter-spacing: 0.1em;
    color: ${(p) => p.theme.colors.textSecondary};
`;

/** 엠블럼: 마름모·궤도 대신 먹 고리 하나, 아이콘은 먹 */
export const CardEmblem = styled(C.CardEmblem)`
    svg {
        .dia { display: none; }
        .orbit { stroke: ${(p) => hair(p.theme, 0.35)}; }
        .orbit-fill { stroke: ${(p) => p.theme.colors.primary}; }
    }

    .glyph {
        color: ${(p) => p.theme.colors.text};
        svg { filter: none !important; }
    }
`;

export const CardTitle = styled(C.CardTitle)`
    font-family: ${(p) => p.theme.fonts.display};
`;

export const CardDday = styled(C.CardDday)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 1rem;
    letter-spacing: 0.08em;

    &::before { background: linear-gradient(to right, transparent, ${(p) => hair(p.theme, 0.5)}); }
    &::after { background: linear-gradient(to left, transparent, ${(p) => hair(p.theme, 0.5)}); }
`;

export const Empty = styled(C.Empty)`
    svg { display: none; }
`;
