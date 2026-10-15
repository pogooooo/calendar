/**
 * Maple 의 위젯 속 내용 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트의 말: 작고 옅은 굵은 마디 머리, 둥근 네모 체크(끝내면 단풍 붉음에 흰 체크), 카테고리는 작은 잎,
 * 챌린지 날은 둥근 네모 칸, 4px 둥근 막대, 옅은 선. 2026-10-15 다시 그리며 먹 화살·도장 체크·넓은 자간을 걷었다.
 *
 * 위젯 화면은 `& * { background-color: transparent }` 로 바탕색을 통째로 지운다.
 * 칠해야 하는 것은 같은 색의 그라데이션(inkFill)으로 칠하거나 `&&` 로 한 단계 세게 건다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetPanels.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, inkCheckbox, inkFill, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialWidgetPanels.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const onPrimary = (p: { theme: { mode: string } }) => (dark(p) ? "#1A1512" : "#FFFFFF");
const line = (p: { theme: { mode: string; colors: { text: string } } }) => hair(p.theme, dark(p) ? 0.14 : 0.1);

/** 날짜 줄 — ‹ 오늘 › */
export const DayNav = styled(C.DayNav)`
    gap: 6px;
    margin-bottom: 8px;

    .label {
        min-width: 5em;
        border-radius: 6px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.text};
    }
    .label:disabled { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const NavBtn = styled(C.NavBtn)`
    width: 24px;
    height: 24px;
    border: 1px solid ${line};
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: background-color 0.15s ease, color 0.15s ease;

    &&:hover {
        border-color: ${line};
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.06)};
    }
`;

/** 마디 머리 — 작고 옅은 굵은 글씨, 밑줄 없음 */
export const SectionHead = styled(C.SectionHead)`
    padding-bottom: 4px;
    margin-bottom: 2px;
    border-bottom: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.textSecondary};

    &.mt { margin-top: 12px; }
`;

export const Row = styled(C.Row)`
    gap: 10px;
`;

export const More = styled(C.More)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    letter-spacing: 0;
`;

/** 체크 칸 — 둥근 네모, 끝내면 단풍 붉음에 흰 체크 */
export const Box = styled(C.Box)`
    width: 18px;
    height: 18px;
    ${(p) => inkCheckbox(p.$done)}

    &:hover { box-shadow: none; }
`;

/** 카테고리 표식 — 카테고리 색의 작은 잎 */
export const Mark = styled(C.Mark)`
    ${leafBullet(true, "10px")}
    ${(p) => inkFill(p.$c)}
`;

/** 기념일 앞 — 단풍 붉음의 잎 */
export const Star = styled(C.Star)`
    display: inline-block;
    font-size: 0;
    ${crest("10px")}
    ${(p) => inkFill(p.theme.colors.primary)}
`;

export const Name = styled(C.Name)`
    font-size: 0.84rem;
`;

export const Meta = styled(C.Meta)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.7rem;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;

    &.hot { color: ${(p) => p.theme.colors.primary}; font-weight: 600; }
`;

export const Thin = styled(C.Thin)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8rem;
    letter-spacing: 0;
`;

export const NowTitle = styled(C.NowTitle)`
    gap: 9px;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 1rem;
    font-weight: 700;
`;

export const NowMeta = styled(C.NowMeta)`
    font-size: 0.74rem;
    font-variant-numeric: tabular-nums;
`;

/** 챌린지 날 — 둥근 네모 칸. 한 날은 단풍 붉음으로 차고, 오늘은 붉은 테 */
export const Dot = styled(C.Dot)`
    width: 13px;
    height: 13px;
    border-radius: 4px;
    transform: none;
    box-shadow: none;
    border: 1.5px solid ${(p) => (p.$on || p.$today ? p.theme.colors.primary : "transparent")};

    && { background-color: ${(p) => (p.$on ? p.theme.colors.primary : hair(p.theme, dark(p) ? 0.14 : 0.1))}; }
`;

/** 통계의 큰 숫자 */
export const Big = styled(C.Big)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.colors.text};

    span {
        margin-left: 2px;
        font-size: 1rem;
        font-weight: 600;
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const Caption = styled(C.Caption)`
    font-size: 0.76rem;
    font-variant-numeric: tabular-nums;
`;

/** 진행 — 4px 둥근 막대 */
export const Bar = styled(C.Bar)`
    height: 4px;
    border-radius: 2px;
    overflow: hidden;

    && { background-color: ${(p) => hair(p.theme, dark(p) ? 0.14 : 0.09)}; }
`;

export const Fill = styled(C.Fill)`
    border-radius: inherit;
    background-image: none;

    && { background-color: ${(p) => p.theme.colors.primary}; }
`;

/** 나눔 — 점선 대신 옅은 선 */
export const Dashed = styled(C.Dashed)`
    border-top: 1px solid ${line};
    margin: 12px 0 8px;
`;

export const CatName = styled(C.CatName)`
    font-size: 0.76rem;
`;

export const CatBar = styled(C.CatBar)`
    height: 4px;
    border-radius: 2px;
    overflow: hidden;

    && { background-color: ${(p) => hair(p.theme, dark(p) ? 0.14 : 0.09)}; }
`;

export const CatFill = styled(C.CatFill)`
    border-radius: inherit;

    && { background-color: ${(p) => p.$c}; }
`;

export const MemoArea = styled(C.MemoArea)`
    font-size: 0.92rem;
    line-height: 1.75;
    caret-color: ${(p) => p.theme.colors.primary};
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; }
`;

/** 빠른 입력 — 둥근 칸, 34px */
export const QuickInput = styled(C.QuickInput)`
    height: 34px;
    padding: 0 12px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.14)};
    border-radius: 10px;
    font-size: 0.84rem;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    && { background-color: ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.85)")}; }
    &:focus {
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.14)};
    }
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; }
`;

/** + — 단풍 붉음으로 찬 둥근 네모 단추 */
export const AddBtn = styled(C.AddBtn)`
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 10px;
    font-size: 1.05rem;
    font-weight: 600;
    color: ${onPrimary};
    transition: background-color 0.15s ease, opacity 0.15s ease;

    && { background-color: ${(p) => p.theme.colors.primary}; }
    &&:hover:not(:disabled) { background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.primary} 88%, #000)`}; border: none; }
    &:active:not(:disabled) { transform: scale(0.96); }
    &:disabled { opacity: 0.35; }
`;

export const DelBtn = styled(C.DelBtn)`
    border-radius: 6px;
    transition: color 0.15s ease;
`;
