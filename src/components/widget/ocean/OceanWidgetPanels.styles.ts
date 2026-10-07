/**
 * 바다의 위젯 속 내용(오늘·지금/다음·마감·챌린지·통계·메모·빠른 할 일…).
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 * 금빛 실선·마름모 표식·네모 체크(Celestial), 잎·도장(Maple) 대신: 작고 옅은 마디 머리, 고정폭 숫자, 동그라미 체크(끝내면 청록에 흰 체크),
 * 납작한 점 표식, 4px 막대, 머리카락 선. 움직임은 한 번씩만(끝없는 것 없음 — 투명 창이 깜빡인다).
 *
 * 위젯 화면은 `& * { background-color: transparent }` 로 속을 비운다. 칠해야 하는 것(체크·점·막대·단추)은
 * `&&` 로 한 단계 세게 걸어 그 규칙을 이긴다 (Celestial 은 같은 색 그라데이션으로 칠했다).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetPanels.styles";
import { withAlpha } from "@/styles/color";
import { MONO, hairline, ink, tideInput } from "@/styles/ocean/water";

export * from "../celestial/CelestialWidgetPanels.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const onPrimary = (p: { theme: { mode: string } }) => (dark(p) ? "#06110F" : "#FFFFFF");

/** 날짜 줄 — ‹ 오늘 › */
export const DayNav = styled(C.DayNav)`
    gap: 6px;
    margin-bottom: 8px;

    .label {
        min-width: 5em;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.76rem;
        font-weight: 600;
        letter-spacing: -0.005em;
        color: ${(p) => p.theme.colors.text};
        border-radius: 6px;
    }
    .label:disabled { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const NavBtn = styled(C.NavBtn)`
    width: 24px;
    height: 24px;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    border-radius: 8px;
    font-size: 0.86rem;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: background-color 0.15s ease, color 0.15s ease;

    &&:hover { border-color: ${(p) => hairline(p.theme, true)}; color: ${(p) => p.theme.colors.text}; background-color: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)}; }
`;

/** 마디 머리 — 작고 옅은 굵은 글씨, 밑줄 없음 (한글이라 고정폭 대문자 꼬리표 대신 본문 글꼴) */
export const SectionHead = styled(C.SectionHead)`
    padding-bottom: 4px;
    margin-bottom: 2px;
    border-bottom: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.textSecondary};

    &.mt { margin-top: 14px; }
`;

export const Row = styled(C.Row)`
    gap: 10px;
`;

/** 체크 — 동그라미. 끝내면 청록으로 차고 흰 체크가 선다 */
export const Box = styled(C.Box)`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid ${(p) => (p.$done ? p.theme.colors.primary : ink(p.theme, 0.3))};
    background-image: none;
    color: ${onPrimary};
    transition: background-color 0.15s ease, border-color 0.15s ease;

    && { background-color: ${(p) => (p.$done ? p.theme.colors.primary : "transparent")}; }
    &:hover { box-shadow: none; border-color: ${(p) => p.theme.colors.primary}; }
`;

/** 카테고리 표식 — 납작한 점 */
export const Mark = styled(C.Mark)`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    transform: none;
    background-image: none;

    && { background-color: ${(p) => p.$c}; }
`;

/** 기념일 앞 — 별 글자 대신 가는 고리 */
export const Star = styled(C.Star)`
    width: 7px;
    height: 7px;
    font-size: 0;
    border-radius: 50%;
    border: 1.5px solid ${(p) => p.theme.colors.primary};
    margin: 0 1px;
`;

export const Name = styled(C.Name)`
    font-size: 0.84rem;
    letter-spacing: -0.005em;
`;

export const Meta = styled(C.Meta)`
    font-family: ${MONO};
    font-size: 0.68rem;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;

    &.hot { color: ${(p) => p.theme.colors.primary}; font-weight: 600; }
`;

export const More = styled(C.More)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    letter-spacing: 0;
`;

export const Thin = styled(C.Thin)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8rem;
    letter-spacing: -0.005em;
`;

export const NowTitle = styled(C.NowTitle)`
    gap: 9px;
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: -0.015em;
`;

export const NowMeta = styled(C.NowMeta)`
    font-size: 0.74rem;
    font-variant-numeric: tabular-nums;
`;

/** 챌린지 날 — 동그라미 열넷. 한 날은 청록으로 차고, 오늘은 진한 테두리 */
export const Dot = styled(C.Dot)`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transform: none;
    box-shadow: none;
    border: 1.5px solid ${(p) => (p.$on || p.$today ? p.theme.colors.primary : ink(p.theme, 0.22))};

    && { background-color: ${(p) => (p.$on ? p.theme.colors.primary : "transparent")}; }
`;

/** 통계의 큰 숫자 */
export const Big = styled(C.Big)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.035em;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.colors.text};

    span {
        margin-left: 2px;
        font-size: 1rem;
        font-weight: 600;
        color: ${(p) => p.theme.colors.textSecondary};
    }
`;

export const Caption = styled(C.Caption)`
    font-size: 0.76rem;
    font-variant-numeric: tabular-nums;
`;

/** 진행 — 4px 막대 */
export const Bar = styled(C.Bar)`
    height: 4px;
    border-radius: 2px;
    overflow: hidden;

    && { background-color: ${(p) => ink(p.theme, dark(p) ? 0.12 : 0.08)}; }
`;

export const Fill = styled(C.Fill)`
    border-radius: inherit;
    background-image: none;

    && { background-color: ${(p) => p.theme.colors.primary}; }
`;

/** 나눔 — 점선 대신 머리카락 선 */
export const Dashed = styled(C.Dashed)`
    border-top: 1px solid ${(p) => hairline(p.theme)};
    margin: 12px 0 8px;
`;

export const CatName = styled(C.CatName)`
    font-size: 0.76rem;
`;

export const CatBar = styled(C.CatBar)`
    height: 4px;
    border-radius: 2px;
    overflow: hidden;

    && { background-color: ${(p) => ink(p.theme, dark(p) ? 0.12 : 0.08)}; }
`;

export const CatFill = styled(C.CatFill)`
    border-radius: inherit;

    && { background-color: ${(p) => p.$c}; }
`;

export const MemoArea = styled(C.MemoArea)`
    font-size: 0.9rem;
    line-height: 1.7;
    letter-spacing: -0.005em;
    caret-color: ${(p) => p.theme.colors.primary};
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; }
`;

/** 빠른 입력 — 흰 면에 선 하나, 34px */
export const QuickInput = styled(C.QuickInput)`
    ${tideInput}
    height: 34px;
    padding: 0 12px;
    font-size: 0.84rem;
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; }

    && { background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.9)")}; }
`;

/** + — 청록으로 찬 정사각 단추 */
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
    &&:hover:not(:disabled) { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.86)}; border: none; }
    &:active:not(:disabled) { transform: scale(0.96); }
    &:disabled { opacity: 0.35; }
`;

export const DelBtn = styled(C.DelBtn)`
    border-radius: 6px;
    transition: color 0.15s ease;
`;
