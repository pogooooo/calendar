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
import { autumnFill, crest, hair, inkFill, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialWidgetPanels.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const line = (p: { theme: { mode: string; colors: { text: string } } }) => hair(p.theme, dark(p) ? 0.14 : 0.1);

/** 날짜 줄 — ‹ 오늘 › */
export const DayNav = styled(C.DayNav)`
    justify-content: space-between;
    gap: 5px;
    margin-bottom: 6px;
    padding-block: 3px 6px;
    border-bottom: 1px solid var(--folio-rule);
    .label {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.text};
    }
    .label:disabled { color: ${(p) => p.theme.colors.textSecondary}; }
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
    gap: 5px;
    height: auto;
    min-height: 33px;
    padding-block: 2px;
    border-bottom: 1px solid var(--folio-rule);
    &:hover { background: color-mix(in srgb, currentColor 5%, transparent); }
`;

export const More = styled(C.More)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    letter-spacing: 0;
`;

export const Box = styled(C.Box)`
    width: 23px;
    height: 26px;
    border: none;
    border-radius: 3px;
    background: transparent;
    box-shadow: none;
    color: ${(p) => p.theme.colors.primary};
    svg { display: none; }
    &::after { content: ""; ${(p) => leafBullet(p.$done, "14px")} }
    &:hover { background: color-mix(in srgb, currentColor 10%, transparent); box-shadow: none; }
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
    font-size: 0.78rem;
    white-space: normal;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
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
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.35;
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

/** 찬 부분 — 호박빛에서 단풍 붉음으로 (그라데이션이라 위젯 화면의 바탕색 지우기에도 남는다) */
export const Fill = styled(C.Fill)`
    border-radius: inherit;
    background-image: ${autumnFill};
`;

/** 나눔 — 점선 대신 옅은 선 */
export const Dashed = styled(C.Dashed)`
    border-top: 1px solid ${line};
    margin: 12px 0 8px;
    [data-arrangement="spread"] & { display: none; }
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
    font-size: 0.79rem;
    line-height: 24px;
    padding: 5px 7px;
    border: 1px solid var(--folio-rule);
    background-image: repeating-linear-gradient(transparent 0 23px, var(--folio-rule) 23px 24px);
    background-origin: content-box;
    &::placeholder { opacity: 1; }
    caret-color: ${(p) => p.theme.colors.primary};
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; }
`;

/** 빠른 입력 — 둥근 칸, 34px */
export const QuickInput = styled(C.QuickInput)`
    height: 29px;
    padding: 0 12px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.14)};
    border-radius: 3px;
    font-size: 0.76rem;
    transition: border-color 0.15s ease;

    && { background-color: ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.85)")}; }
    &:focus {
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
        outline: 1px solid ${(p) => p.theme.colors.primary};
        outline-offset: -1px;
    }
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; }
`;

/** + — 단풍 붉음으로 찬 둥근 네모 단추 */
export const AddBtn = styled(C.AddBtn)`
    width: 27px;
    height: 29px;
    border: none;
    border-radius: 3px;
    font-size: 1.05rem;
    font-weight: 600;
    color: #fff1da;
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

export const Pad = styled(C.Pad)`
    scrollbar-width: thin;
    &[data-arrangement="spread"] {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0;
        align-items: stretch;
    }
    &[data-panel="due"] [data-due-count] {
        order: -1;
        min-width: 32px;
        padding: 3px;
        border: 1px solid var(--folio-rule);
        text-align: center;
    }
    [data-next-anniversary] {
        display: grid;
        justify-items: center;
        gap: 4px;
        padding-block: 10px;
        text-align: center;
        > [data-dday] {
            order: -1;
            font: 700 2rem/1.1 ${p => p.theme.fonts.display};
            color: ${p => p.theme.colors.primary};
        }
    }
`;

export const BigRow = styled(C.BigRow)`
    [data-arrangement="spread"] & {
        justify-content: flex-start;
        padding: 8px;
        border: 1px solid var(--folio-rule);
        min-width: 0;
    }
    [data-arrangement="spread"] & + & { border-inline-start: 2px solid var(--folio-edge); }
`;

export const ProjRow = styled(C.ProjRow)`
    height: auto;
    min-height: 52px;
    padding: 6px;
    margin-top: 6px;
    border: 1px solid var(--folio-rule);
    border-inline-start: 2px solid var(--folio-edge);
`;

export const MemoColumn = styled(C.MemoColumn)`
    padding: var(--widget-pad);
`;

export const BookHeading = styled.h2`
    font: 700 0.96rem/1.25 ${p => p.theme.fonts.display};
    color: ${p => p.theme.colors.text};
    margin: 0;
    padding: 0 0 6px;
    border-bottom: 1px solid var(--folio-rule);
`;

export const BookBody = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

export const WidgetBook = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 var(--widget-pad);
    > ${BookBody} > div { padding-inline: 0; }
    &[data-book-panel="memo"] > ${BookBody} { padding-top: 8px; }
`;

export const Summary = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 5px;
    font-size: 0.66rem;
    color: ${p => p.theme.colors.textSecondary};
    border-top: 1px solid var(--folio-rule);
`;

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    text-align: center;
    padding: 5px 0;
    font-size: 0.69rem;
    span { display: block; }
    strong { font: 700 1.55rem/1.1 ${p => p.theme.fonts.display}; }
    > div + div { border-inline-start: 1px solid var(--folio-rule); }
`;

export const WeekBars = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    align-items: end;
    gap: 4px;
    margin-top: auto;
    min-height: 48px;
    font-size: 0.63rem;
    color: ${p => p.theme.colors.textSecondary};
    > span { display: grid; justify-items: center; gap: 2px; }
    i { display: block; width: 65%; background: ${p => p.theme.colors.primary}; }
`;

export const Record = styled.section`
    border: 1px solid var(--folio-rule);
    border-inline-start: 2px solid var(--folio-edge);
    margin-bottom: 6px;
    padding: 7px 6px;
    header { display: flex; align-items: start; gap: 4px; justify-content: space-between; }
`;

export const SevenDays = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 1px;
    margin-top: 5px;
`;

export const Stamp = styled.button<{ $on: boolean; $today: boolean }>`
    min-width: 0;
    width: 100%;
    height: 20px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid ${p => p.$today ? "var(--folio-edge)" : "transparent"};
    border-radius: 2px;
    background: transparent;
    color: ${p => p.theme.colors.primary};
    cursor: pointer;
    &:disabled { opacity: 0.4; cursor: default; }
    i { ${p => leafBullet(p.$on, "11px")} }
`;
