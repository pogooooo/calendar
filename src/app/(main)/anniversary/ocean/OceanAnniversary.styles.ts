/**
 * 바다의 기념일 — 뼈대(위 새 기념일 서식 · 아래 카드 격자)는 Celestial 과 같고, 겉만 바꾼다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 별자리 워터마크·마름모 귀퉁이·가운데 정렬 겹 테두리 카드·숨 쉬는 빛무리 대신:
 *   서식은 판 한 장(위에 작은 이름표, 네모 아이콘 고르개, 입력칸, 청록 단추),
 *   카드는 왼쪽 정렬 — 아이콘 둘레의 가는 고리가 다가올수록 차오르고, D-day 는 크고 굵은 숫자. 오늘은 청록 테.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialAnniversary.styles";
import { R, hairline, ink, seaButton, surface, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialAnniversary.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Page = styled(C.Page)`
    max-width: 900px;
    font-family: ${(p) => p.theme.fonts.body};
    color: ${(p) => p.theme.colors.text};
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

export const Corners = styled(C.Corners)`
    display: none;
`;

/** 새 기념일 — 판 한 장 */
export const AddForm = styled(C.AddForm)`
    gap: 12px;
    padding: 18px 20px 20px;
    margin-bottom: 24px;
    border: none;
    ${surface("panel")}
    border-radius: ${R.lg};
    ${MOBILE} { padding: 16px; margin-bottom: 16px; }
`;

/** 테두리를 가르던 가운데 캡션 → 판 왼쪽 위의 작은 이름표 */
export const FormCaption = styled(C.FormCaption)`
    position: static;
    transform: none;
    padding: 0;
    background: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.94rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
`;

export const IconRow = styled(C.IconRow)`
    gap: 6px;
    flex-wrap: wrap;
    ${MOBILE} { flex-wrap: nowrap; gap: 4px; }
`;

/** 아이콘 고르개 — 네모 단추, 고르면 옅은 청록 면과 청록 테 */
export const IconChoice = styled(C.IconChoice)`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.5) : hairline(p.theme, true))};
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.09) : dark(p) ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)")};
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    box-shadow: none;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    ${(p) => p.$selected && css`svg { filter: none; }`}

    &:hover { color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)}; border-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.6) : ink(p.theme, 0.2))}; }
    &:focus-visible { outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)}; outline-offset: 2px; }
    ${MOBILE} { height: 40px; }
`;

export const FormRow = styled(C.FormRow)`
    gap: 8px;
`;

export const TitleInput = styled(C.TitleInput)`
    ${tideInput}
    height: 40px;
    padding: 0 12px;
    font-size: 0.88rem;
    &::placeholder { color: ${(p) => ink(p.theme, 0.35)}; }
    ${MOBILE} { min-height: 44px; }
`;

export const DateField = styled(C.DateField)`
    width: 104px;
    ${MOBILE} { width: auto; }
`;

export const AddButton = styled(C.AddButton)`
    ${seaButton("primary")}
    height: 40px;
    gap: 6px;
    padding: 0 16px;
    font-size: 0.84rem;
    letter-spacing: 0;
    &:hover:not(:disabled) { box-shadow: none; }
    &:active:not(:disabled) { background-color: ${(p) => p.theme.colors.primary}; }
    ${MOBILE} { min-height: 44px; }
`;

/** 아무것도 없을 때 — 케이크 그림은 빼고(빈 자리 그림이 따로 있다) 문구만 */
export const Empty = styled(C.Empty)`
    gap: 8px;
    padding: 56px 0;
    & > svg { display: none; }
    p { font-size: 0.86rem; color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const CardGrid = styled(C.CardGrid)`
    grid-template-columns: repeat(auto-fill, minmax(196px, 1fr));
    gap: 12px;
    ${MOBILE} { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
`;

/** 카드 — 왼쪽 정렬의 반투명 판. 오늘이면 청록 테(숨 쉬는 빛무리 없음) */
export const Card = styled(C.Card)`
    align-items: flex-start;
    gap: 4px;
    padding: 18px 18px 16px;
    text-align: left;
    ${surface("panel")}
    border-radius: 16px;
    animation: none;
    color: inherit;
    ${(p) => p.$today && css`
        border-color: ${withAlpha(p.theme.colors.primary, 0.55)};
        background-color: ${withAlpha(p.theme.colors.primary, dark(p) ? 0.12 : 0.06)};
    `}

    &::before { display: none; }

    ${MOBILE} { padding: 14px 14px 12px; }
`;

/** 지우기 — 올리면 보이는 작은 네모 단추 */
export const CardDelete = styled(C.CardDelete)`
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
    &:hover { color: ${(p) => p.theme.colors.error}; background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)}; }
    &:focus-visible { opacity: 1; outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)}; }
    /* 손가락에는 올리기가 없다 — 폰에서는 늘 보인다 */
    ${MOBILE} { opacity: 0.6; }
`;

/** 로마 숫자는 바다에 없다 */
export const CardNumeral = styled(C.CardNumeral)`
    display: none;
`;

/** 아이콘 — 둘레의 가는 고리가 그날이 다가올수록 차오른다 (마름모는 뗀다) */
export const CardEmblem = styled(C.CardEmblem)`
    width: 44px;
    height: 44px;
    margin: 0 0 10px;

    svg {
        .dia { display: none; }
        .orbit { stroke: ${(p) => ink(p.theme, dark(p) ? 0.14 : 0.1)}; stroke-width: 3; }
        .orbit-fill { stroke: ${(p) => p.theme.colors.primary}; stroke-width: 3; }
    }
    /* 고리 그림의 100% 크기가 아이콘에까지 번지지 않게 — 아이콘은 제 크기(20px) */
    .glyph {
        color: ${(p) => (p.$today ? p.theme.colors.primary : p.theme.colors.text)};
        svg { width: 20px; height: 20px; filter: none !important; }
    }
`;

export const CardTitle = styled(C.CardTitle)`
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.35;
`;

export const CardDate = styled(C.CardDate)`
    font-size: 0.76rem;
    font-variant-numeric: tabular-nums;
`;

/** D-day — 양옆 실선·✦ 없이 크고 굵은 숫자. 오늘은 청록 */
export const CardDday = styled(C.CardDday)`
    margin-top: 10px;
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: ${(p) => (p.$today ? p.theme.colors.primary : p.theme.colors.text)};

    i { display: none; }
    &::after { content: none; }
`;
