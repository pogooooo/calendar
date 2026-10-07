/**
 * 바다의 프로젝트 보드 — 선으로 가른 세 칸(Celestial)도, 종이 서랍 셋(Maple)도 아닌 **따로 떠 있는 판 셋**.
 *
 * 데스크톱에서는 보드와 칸 묶음이 상자를 벗는다(display: contents). 그러면 칸 셋이 화면 틀(OceanProjectPage.styles)의
 * 자리에 바로 앉는다 — 왼쪽의 키 큰 "진행 전", 타임라인 아래의 "진행 중"·"완료".
 * 칸 머리는 상태 점 · 굵은 이름 · 고정폭 개수, 카드는 판 안의 납작한 조각(12px), 중요도는 작은 꼬리표(높음 산호 · 보통 청록 · 낮음 먹).
 * 폰은 보드 전체가 판 하나 — 위에 분절 고르개, 그 아래 고른 칸.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialProjectBoard.styles";
import { EASE, R, calm, hairline, ink, label, seaButton, surface, surfaceIn } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, TOUCH } from "@/styles/breakpoints";
import { COLUMN_STATUS, SectionTitle as OceanSectionTitle, statusDot } from "@/components/project/ocean/section";

export * from "../celestial/CelestialProjectBoard.styles";

const DESKTOP = "@media (min-width: 769px)";
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 데스크톱: 상자 없이 — 칸 셋이 화면 틀에 바로 앉는다. 폰: 보드 전체가 판 하나 */
export const SectionWrapper = styled(C.SectionWrapper)`
    ${DESKTOP} { display: contents; }

    ${MOBILE} {
        ${surface("panel")}
        border-radius: ${R.lg};
        animation: ${surfaceIn} 0.45s ${EASE} both;
        ${calm}
    }
`;

/** 데스크톱에서는 칸마다 제 이름이 있으니 "보드" 머리글은 폰에서만 */
export const SectionTitle = styled(OceanSectionTitle)`
    ${DESKTOP} { display: none; }
`;

export const BoardGrid = styled(C.BoardGrid)`
    ${DESKTOP} { display: contents; }
    ${MOBILE} { min-height: 0; }
`;

/** 칸 하나 = 판 하나. 칸 순서대로 화면 틀의 todo · doing · done 자리에 앉는다 */
export const BoardColumn = styled(C.BoardColumn)`
    min-width: 0;
    min-height: 0;
    border-right: none;

    ${DESKTOP} {
        ${surface("panel")}
        border-radius: ${R.lg};
        overflow: hidden;
        animation: ${surfaceIn} 0.45s ${EASE} both;
        ${calm}

        &:last-child { border-right: 1px solid ${(p) => hairline(p.theme)}; }
        &:nth-child(1) { grid-area: todo; }
        &:nth-child(2) { grid-area: doing; animation-delay: 0.08s; }
        &:nth-child(3) { grid-area: done; animation-delay: 0.12s; }
    }
`;

/** 칸 머리 — 상태 점 · 굵은 이름 · 고정폭 개수 · 추가 단추. 아래로 머리카락 선 하나 */
export const ColumnHeader = styled(C.ColumnHeader)`
    flex-shrink: 0;
    min-height: 52px;
    padding: 10px 12px 10px 18px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};

    ${MOBILE} {
        min-height: 0;
        padding: 0 12px 8px;
        border-bottom: none;
    }
`;

export const ColumnTitle = styled(C.ColumnTitle)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};

    &::before { content: ""; ${statusDot("todo")} }
    ${BoardColumn}:nth-child(2) &::before { ${statusDot(COLUMN_STATUS[1])} }
    ${BoardColumn}:nth-child(3) &::before { ${statusDot(COLUMN_STATUS[2])} }

    .count { ${label} letter-spacing: 0; font-variant-numeric: tabular-nums; }
    .paren { display: none; }
`;

/** 폰의 칸 고르개 — 옅은 홈 안에서 고른 마디만 흰 판이 된다 (분절 단추) */
export const ColumnPicker = styled(C.ColumnPicker)`
    ${MOBILE} {
        gap: 2px;
        margin: 0 12px 10px;
        padding: 3px;
        border-radius: ${R.md};
        background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
    }
`;

export const ColumnPick = styled(C.ColumnPick)`
    min-height: 38px;
    gap: 6px;
    border: none;
    border-radius: 9px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8rem;
    font-weight: ${(p) => (p.$on ? 600 : 500)};
    letter-spacing: -0.005em;
    color: ${(p) => (p.$on ? p.theme.colors.text : p.theme.colors.textSecondary)};
    background: ${(p) => (p.$on ? (dark(p) ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF") : "transparent")};
    box-shadow: ${(p) => (p.$on ? "0 1px 3px rgba(18, 33, 32, 0.12)" : "none")};
    transition: background-color 0.15s ease, color 0.15s ease;

    em { ${label} font-size: 0.66rem; letter-spacing: 0; opacity: 1; }
    &:active { transform: scale(0.985); }
`;

export const ColumnEmpty = styled(C.ColumnEmpty)`
    padding: 28px 12px;
    font-size: 0.8rem;
    color: ${(p) => p.theme.colors.textSecondary};
    opacity: 1;
`;

/** 추가 — 글씨만 있는 작은 단추 */
export const AddTaskButton = styled(C.AddTaskButton)`
    ${seaButton("ghost")}
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 30px;
    padding: 0 10px;
    border-radius: ${R.sm};
    font-size: 0.78rem;
    font-weight: 500;

    &::before { content: "+"; font-size: 0.95rem; line-height: 1; font-weight: 400; }
    &:hover { box-shadow: none; border-color: transparent; }

    ${MOBILE} { height: 36px; min-height: 36px; padding: 0 12px; font-size: 0.8rem; }
`;

export const CardList = styled(C.CardList)`
    padding: 12px;
    gap: 8px;
    scrollbar-width: thin;
    scrollbar-color: ${(p) => ink(p.theme, 0.18)} transparent;

    ${MOBILE} { padding: 0 12px 12px; }
`;

/** 카드 — 판 안의 납작한 조각. 올리면 조금 더 하얘지고 선이 짙어진다 (그림자·빛 없이) */
export const CardBox = styled(C.CardBox)`
    ${surface("card")}
    position: relative;
    flex-shrink: 0;
    gap: 6px;
    padding: 11px 12px 10px;
    border-radius: ${R.md};
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
        box-shadow: none;
        border-color: ${(p) => ink(p.theme, dark(p) ? 0.2 : 0.16)};
        background-color: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.85)")};
    }
    &:active { transform: scale(0.985); }
`;

/** 제목 — 13.5px. 끝낸 일은 글자에만 줄을 긋는다 (중요도 꼬리표는 그대로) */
export const CardTitle = styled(C.CardTitle)`
    gap: 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.845rem;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: -0.005em;
    text-decoration: none;

    .title-text {
        text-decoration: ${(p) => (p.$isDone ? "line-through" : "none")};
        text-decoration-color: ${(p) => ink(p.theme, 0.35)};
    }
`;

/** 중요도 — 6px 모서리 꼬리표: 높음은 산호, 보통은 청록, 낮음은 먹 (옅은 면에 같은 색 글씨) */
export const PriorityTag = styled(C.PriorityTag)`
    border: none;
    border-radius: 6px;
    padding: 1px 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.68rem;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0;

    ${(p) => {
        const c = p.$priority === "high" ? p.theme.colors.weekend : p.$priority === "low" ? null : p.theme.colors.primary;
        return c
            ? css`color: ${c}; background: ${withAlpha(c, dark(p) ? 0.18 : 0.12)};`
            : css`color: ${p.theme.colors.textSecondary}; background: ${ink(p.theme, dark(p) ? 0.12 : 0.07)};`;
    }}

    /* 마름모 점은 Celestial 만 */
    display: inline;
    &::before { display: none; }
`;

/** 대기 — 앞선 일을 기다리는 중: 먹 꼬리표 */
export const LockedTag = styled(C.LockedTag)`
    border: none;
    border-radius: 6px;
    padding: 1px 6px;
    font-size: 0.68rem;
    font-weight: 600;
    line-height: 1.5;
    color: ${(p) => p.theme.colors.textSecondary};
    background: ${(p) => ink(p.theme, dark(p) ? 0.12 : 0.07)};
`;

export const CardMeta = styled(C.CardMeta)`
    gap: 8px;
`;

export const CardDate = styled(C.CardDate)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.colors.textSecondary};
`;

/** 담당자 — 세로 실선 대신 가운뎃점 */
export const CardAssignees = styled(C.CardAssignees)`
    position: relative;
    border-left: none;
    padding-left: 10px;
    font-size: 0.75rem;
    color: ${(p) => p.theme.colors.textSecondary};

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        width: 3px;
        height: 3px;
        margin-top: -1.5px;
        border-radius: 50%;
        background: ${(p) => ink(p.theme, 0.3)};
    }
`;

/** 옮기기 단추 — 마우스가 있는 화면에서는 자리를 차지하지 않고 카드 오른쪽 위에 떠오른다
    (숨은 단추가 폭을 먹어 좁은 칸에서 제목이 세 줄로 꺾이던 것). 손가락 화면은 늘 보이니 제자리에 둔다 */
export const CardActionGroup = styled(C.CardActionGroup)`
    gap: 4px;
    transition: opacity 0.15s ease;

    @media (hover: hover) {
        position: absolute;
        top: 7px;
        right: 7px;
        padding: 2px;
        border-radius: 9px;
        background: ${(p) => (dark(p) ? "#1A2526" : "#FFFFFF")};
        box-shadow: 0 0 0 1px ${(p) => hairline(p.theme)};
    }
    ${TOUCH} { opacity: 1; }
`;

export const CardMoveButton = styled(C.CardMoveButton)`
    ${seaButton("default")}
    height: 24px;
    padding: 0 8px;
    border-radius: 7px;
    font-size: 0.7rem;
    font-weight: 500;

    &:hover { box-shadow: none; }

    ${MOBILE} { height: 34px; min-height: 34px; padding: 0 12px; font-size: 0.75rem; border-radius: ${R.sm}; }
`;
