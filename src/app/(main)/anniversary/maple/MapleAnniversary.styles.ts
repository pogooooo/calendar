/**
 * Maple 의 기념일 화면 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 새 기념일 서식도, 기념일 하나하나도 종이 위의 깨끗한 카드. 아이콘은 옅은 붉은 동그라미 안의 선 아이콘이고,
 * 그 둘레의 가는 호가 다가올수록 차오른다. D-day 는 큰 Cormorant 숫자, 오늘은 붉은 알약.
 * 예전의 덩굴 귀퉁이·잎 화환 테·먹 아이콘·로마 숫자·귀퉁이의 큰 수채 잎은 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialAnniversary.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, inkInput, paperCard, stampButton } from "@/styles/maple/ink";
import { MOBILE, TOUCH } from "@/styles/breakpoints";

export * from "../celestial/CelestialAnniversary.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

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
        color: ${(p) => p.theme.colors.text};
    }

    hr { display: none; }

    ${MOBILE} {
        gap: 8px;
        margin-bottom: 14px;

        span { font-size: 22px; }
    }
`;

/** 귀퉁이 장식 — 걷는다 */
export const Corners = styled(C.Corners)`
    display: none;
`;

/** 새 기념일 서식: 카드 한 장. 이름은 카드 제목처럼 맨 위에 */
export const AddForm = styled(C.AddForm)`
    ${paperCard()}
    gap: 12px;
    padding: 16px 18px 18px;
    margin-bottom: 24px;

    ${MOBILE} { padding: 14px 14px 16px; margin-bottom: 18px; }
`;

export const FormCaption = styled(C.FormCaption)`
    position: static;
    transform: none;
    padding: 0;
    background: none;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.35;
    color: ${(p) => p.theme.colors.text};
`;

/** 아이콘 고르개 — 둥근 네모. 고른 것은 단풍 붉음이 옅게 */
export const IconChoice = styled(C.IconChoice)`
    width: 38px;
    height: 38px;
    border: 1px solid ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.45) : hair(p.theme, dark(p) ? 0.14 : 0.1))};
    border-radius: 10px;
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.09) : "transparent")};
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    box-shadow: none;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    svg { filter: none; }

    &:hover {
        border-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.6) : hair(p.theme, 0.24))};
        color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)};
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.28)};
    }

    ${MOBILE} { height: 42px; }
`;

export const TitleInput = styled(C.TitleInput)`
    ${inkInput}
    height: 40px;
    padding: 0 12px;
    font-size: 14px;

    ${MOBILE} { height: auto; }
`;

/** 추가 — 단풍 붉음으로 채운 알약 */
export const AddButton = styled(C.AddButton)`
    ${stampButton("primary")}
    justify-content: center;
    gap: 6px;
    height: 40px;
    padding: 0 16px 0 14px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13.5px;
    letter-spacing: 0;

    &:hover:not(:disabled) { box-shadow: 0 2px 8px -2px ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; }
    &:active:not(:disabled) { background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.primary} 80%, #000)`}; }

    ${MOBILE} { height: 46px; }
`;

export const CardGrid = styled(C.CardGrid)`
    grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
    gap: 14px;

    ${MOBILE} {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }
`;

/** 기념일 하나 — 카드. 오늘인 날은 단풍 붉음이 옅게 깔리고 테가 붉다 (빛나지 않는다) */
export const Card = styled(C.Card)`
    ${paperCard()}
    gap: 4px;
    padding: 22px 14px 18px;
    animation: none;
    color: inherit;
    transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

    ${(p) => p.$today && css`
        border-color: ${withAlpha(p.theme.colors.primary, 0.45)};
        background-color: ${`color-mix(in srgb, ${p.theme.colors.primary} ${dark(p) ? 10 : 6}%, ${p.theme.colors.surface})`};
    `}

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${(p) => (dark(p)
            ? "0 1px 2px rgba(0, 0, 0, 0.35), 0 16px 32px -14px rgba(0, 0, 0, 0.6)"
            : "0 1px 2px rgba(86, 54, 32, 0.06), 0 16px 32px -14px rgba(86, 54, 32, 0.24)")};
    }

    &:focus-within button { opacity: 1; }

    ${MOBILE} { padding: 18px 10px 14px; }
`;

/** 지우기 — 오른쪽 위의 작은 둥근 단추(올리면 붉게). 손가락 화면에서는 늘 옅게 보인다 */
export const CardDelete = styled(C.CardDelete)`
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    transition: opacity 0.2s ease, color 0.15s ease, background-color 0.15s ease;

    &:hover {
        color: ${(p) => p.theme.colors.error};
        background-color: ${(p) => withAlpha(p.theme.colors.error, dark(p) ? 0.16 : 0.1)};
    }

    &:focus-visible {
        opacity: 1;
        outline: none;
        box-shadow: 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
    }

    ${TOUCH} { opacity: 0.6; }
`;

/** 로마 숫자 — 걷는다 */
export const CardNumeral = styled(C.CardNumeral)`
    display: none;
`;

/**
 * 아이콘 자리 — 옅은 붉은 동그라미 안의 선 아이콘. 둘레의 가는 호는 남은 날이 적을수록 길어진다(뼈대의 orbit-fill).
 * 오늘은 동그라미를 붉게 채우고 아이콘은 카드 바탕색으로.
 */
export const CardEmblem = styled(C.CardEmblem)`
    width: 64px;
    height: 64px;
    margin: 0 0 10px;

    &::before {
        content: "";
        position: absolute;
        inset: 11px;
        border-radius: 50%;
        background-color: ${(p) => (p.$today ? p.theme.colors.primary : withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1))};
    }

    svg {
        .dia { display: none; }
        .orbit { stroke: ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.09)}; stroke-width: 2; }
        .orbit-fill { stroke: ${(p) => p.theme.colors.primary}; stroke-width: 2; }
    }

    .glyph {
        color: ${(p) => (p.$today ? p.theme.colors.surface : p.theme.colors.primary)};
        svg { filter: none !important; }
    }
`;

export const CardTitle = styled(C.CardTitle)`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.35;
`;

export const CardDate = styled(C.CardDate)`
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
`;

/** D-day — 큰 Cormorant 숫자(고른 높이의 숫자로). 오늘은 붉은 알약에 본문 글꼴 */
export const CardDday = styled(C.CardDday)`
    gap: 0;
    margin-top: 10px;
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 30px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0;
    font-variant-numeric: lining-nums tabular-nums;
    color: ${(p) => p.theme.colors.primary};

    /* 양옆의 짧은 선·오늘의 별은 Celestial 만 */
    i { display: none; }
    &::after { content: none; }

    ${(p) => p.$today && css`
        padding: 7px 16px;
        border-radius: 999px;
        background-color: ${p.theme.colors.primary};
        color: ${p.theme.colors.surface};
        font-family: ${p.theme.fonts.body};
        font-size: 14px;
        font-weight: 700;
    `}

    ${MOBILE} { font-size: 26px; }
`;

/** 기념일이 없을 때 — 작은 그림 아래 두 줄 (뼈대의 케이크 아이콘은 걷는다) */
export const Empty = styled(C.Empty)`
    ${paperCard()}
    padding: 44px 20px;

    & > svg { display: none; }

    p {
        font-size: 14px;
        line-height: 1.7;
    }
`;
