/**
 * 바다의 카테고리 — 위에 색 칩 띠, 아래에 고른 카테고리의 판 셋 (배치는 OceanCategoryLayout).
 * Celestial·Maple: 별자리 워터마크, 왼쪽 세로 카드 덱 | 오른쪽 표제부 · 탭(상세 정보 / 할 일 목록).
 * 바다: 물 위의 머리줄(제목·개수 | 새 카테고리), 옆으로 흐르는 유리 칩 띠(제 색 견본과 이름, 고른 칩은 청록 테),
 *   그 아래 탭 없이 한눈에 — [색·이름·설명] [멤버·만든 사람·지우기] | [할 일 목록]. 할 일이 길면 그 판 안에서 구른다.
 *   폰: 띠는 옆으로 밀고, 판은 이름 → 할 일 → 멤버 순으로 한 줄.
 * 조각(색 견본·이름 칸·설명·참여자·할 일 줄)은 CategoryView 가 그린 것을 여기서 덮어쓴다.
 * 움직임: 칩과 판이 차례로 한 번 떠오른다. 끝없는 움직임 없음(calm).
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialCategory.styles";
import { EASE, R, bubbleCheck, calm, focusRing, hairline, ink, label, seaButton, surface, surfaceIn, tideInput } from "@/styles/ocean/water";
import { ghostIcon } from "@/components/modal/baseModal/ocean/oceanLayer";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialCategory.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const DESK = "@media (min-width: 769px)";

/** 한 번 떠오르기 — 끝나면 transform 을 남기지 않는다(backwards). 남기면 안의 fixed 층이 판에 갇힌다 */
const arrive = (delay: number) => css`
    animation: ${surfaceIn} 0.45s ${delay}s ${EASE} backwards;
    ${calm}
`;

/* ── 틀 ──────────────────────────────────────────────────────────── */

/** 화면 전체 — 넓게 쓰고, 아래 90px 는 독 자리로 비운다 */
export const Page = styled.div`
    width: min(1240px, 100%);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-bottom: 90px;
    font-family: ${(p) => p.theme.fonts.body};
    color: ${(p) => p.theme.colors.text};

    ${MOBILE} { gap: 12px; padding-bottom: 8px; }
`;

export const Bar = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
`;

export const Heading = styled.div`
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
`;

export const Title = styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
    white-space: nowrap;
    ${MOBILE} { font-size: 1.3rem; }
`;

export const Count = styled.span`
    ${label}
    font-variant-numeric: tabular-nums;
`;

export const AddButton = styled.button`
    ${seaButton("primary")}
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: none;
    height: 36px;
    padding: 0 14px 0 11px;
    font-size: 0.84rem;
    white-space: nowrap;
    svg { width: 16px; height: 16px; stroke-width: 2; }
    ${MOBILE} { height: 40px; }
`;

/* ── 칩 띠 ───────────────────────────────────────────────────────── */

/**
 * 옆으로 흐르는 띠. 구르는 상자는 제 밖을 잘라 내므로, 고른 칩의 테와 칩의 멀고 부드러운 그림자가 다 번질 만큼
 * 안쪽을 띄우고 그만큼 바깥을 당겨 자리는 그대로 둔다. 폰에서는 화면 끝에서 끝까지 민다
 */
export const Rail = styled.div`
    display: flex;
    gap: 10px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    scroll-padding-inline: 28px;
    scrollbar-width: thin;
    margin: -8px -28px -34px;
    padding: 8px 28px 40px;

    & > * { flex: none; scroll-snap-align: start; }

    ${MOBILE} {
        scroll-padding-inline: 12px;
        margin: -8px -12px -34px;
        padding: 8px 12px 40px;
    }
`;

/** 칩 — 작은 유리 카드: 왼쪽 위 제 색 견본, 아래 이름. 함께 쓰는 카테고리면 오른쪽 위에 사람 수 */
export const Chip = styled.button<{ $color: string; $on: boolean }>`
    ${surface("panel")}
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    width: 150px;
    height: 78px;
    padding: 13px 14px 12px;
    border-radius: 14px;
    text-align: left;
    font: inherit;
    color: ${(p) => p.theme.colors.text};
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
    ${arrive(0)}

    .sw {
        width: 18px;
        height: 18px;
        border-radius: 6px;
        background-color: ${(p) => p.$color};
        box-shadow: inset 0 0 0 1px ${(p) => ink(p.theme, 0.08)};
    }
    .nm {
        max-width: 100%;
        font-size: 0.9rem;
        font-weight: ${(p) => (p.$on ? 700 : 600)};
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .meta {
        position: absolute;
        top: 12px;
        right: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        ${label}
        font-variant-numeric: tabular-nums;
        svg { width: 13px; height: 13px; stroke-width: 1.75; }
    }

    &:hover { background-color: ${(p) => (dark(p) ? "rgba(18, 48, 54, 0.62)" : "rgba(255, 255, 255, 0.72)")}; }
    &:active { transform: scale(0.98); }
    ${focusRing}

    ${(p) => p.$on && css`
        background-color: ${dark(p) ? "rgba(20, 54, 60, 0.7)" : "rgba(255, 255, 255, 0.82)"};
        outline: 1.5px solid ${withAlpha(p.theme.colors.primary, 0.55)};
        outline-offset: 3px;
        &:hover { background-color: ${dark(p) ? "rgba(20, 54, 60, 0.7)" : "rgba(255, 255, 255, 0.82)"}; }
    `}

    ${MOBILE} { width: 132px; height: 72px; }
`;

/* ── 판 셋 ───────────────────────────────────────────────────────── */

/** [이름 | 할 일] / [멤버 | 할 일] — 할 일 판이 두 줄을 차지하고, 셋의 키가 맞물린다 */
export const Bento = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    grid-template-rows: auto 1fr;
    grid-template-areas:
        "id    todos"
        "team  todos";
    gap: 16px;

    ${MOBILE} {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: none;
        grid-template-areas: "id" "todos" "team";
        gap: 12px;
    }
`;

export const Panel = styled.section<{ $area: "id" | "team" | "todos"; $at: number }>`
    ${surface("panel")}
    grid-area: ${(p) => p.$area};
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 22px 24px;
    border-radius: ${R.lg};
    ${(p) => arrive(p.$at * 0.05)}

    ${MOBILE} { padding: 18px 16px; }
`;

/** 멤버 판 바닥 — 만든 사람(왼쪽)과 지우기(오른쪽), 위에 머리카락 선 */
export const PanelFoot = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid ${(p) => hairline(p.theme)};
`;

/** 지우기 — 글자 단추, 올리면 산호 */
export const Remove = styled.button`
    ${ghostIcon("auto")}
    flex: none;
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    svg { width: 15px; height: 15px; }
    &:hover:not(:disabled) { color: ${(p) => p.theme.colors.error}; background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)}; }
    ${MOBILE} { height: 40px; }
`;

/** 고르기 전 — 판 한 장에 안내 문구 */
export const Pick = styled.div`
    ${surface("panel")}
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    padding: 32px 24px;
    border-radius: ${R.lg};
    ${arrive(0.05)}
`;

/* ── CategoryView 가 그린 조각들 ──────────────────────────────────── */

/** 마름모 귀퉁이는 바다에 없다 */
export const Corners = styled(C.Corners)`
    display: none;
`;

/** 표제부 — 테두리 없이: 색 견본 + 이름 + 요약 */
export const Plate = styled(C.Plate)`
    gap: 16px;
    padding: 0;
    margin: 0 0 22px;
    border: none;
`;

/** 색 견본 — 눌러서 색을 바꾼다 (별·고리 그림 대신 그 색의 둥근 네모) */
export const EmblemWrap = styled(C.EmblemWrap)`
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background-color: ${(p) => p.$color};
    box-shadow: inset 0 0 0 1px ${(p) => ink(p.theme, 0.08)};
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    animation: none;

    svg { display: none; }
    &:hover { box-shadow: inset 0 0 0 1px ${(p) => ink(p.theme, 0.12)}, 0 0 0 3px ${(p) => withAlpha(p.$color, 0.25)}; }
    &:active { transform: scale(0.97); }
    &:focus-within { box-shadow: inset 0 0 0 1px ${(p) => ink(p.theme, 0.12)}, 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.4)}; }
    .color-input { border-radius: 14px; }
`;

export const PlateText = styled(C.PlateText)`
    gap: 2px;
    .numeral { display: none; }
    .title-input {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        padding: 2px 0;
        border-radius: 6px;
        &::placeholder { color: ${(p) => ink(p.theme, 0.3)}; }
        &:focus-visible { outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.4)}; outline-offset: 2px; }
    }
    .sub {
        font-size: 0.8rem;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
    }
`;

/** 만든 사람 — 점선 이음 없이 이름표와 값 한 줄 */
export const LoreRow = styled(C.LoreRow)`
    gap: 8px;
    min-width: 0;
    .k { font-size: 0.78rem; letter-spacing: 0; }
    .dots { display: none; }
    .v { max-width: none; font-size: 0.84rem; font-weight: 600; }
`;

/** 설명 — 작은 이름표와 입력칸 (테두리를 가르는 캡션 없음) */
export const DescBlock = styled(C.DescBlock)`
    gap: 8px;
    padding: 0;
    border: none;

    .cap {
        position: static;
        padding: 0;
        background: none;
        font-size: 0.8rem;
        font-weight: 600;
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

/** 구역 이름 — 굵은 글씨와 고정폭 개수, 실선 없음 */
export const SectionCap = styled(C.SectionCap)`
    gap: 8px;
    margin-bottom: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    b { ${label} color: ${(p) => p.theme.colors.textSecondary}; }
    hr { display: none; }
`;

export const MedalRow = styled(C.MedalRow)`
    gap: 12px 18px;
    margin-bottom: 18px;
`;

/** 참여자 — 동그란 머리글자. 주인은 이름 옆 청록 점, 초대는 점선 동그라미 */
export const Medal = styled(C.Medal)`
    gap: 8px;
    min-height: 36px;
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
    /* 손가락에는 올리기가 없다 — 폰에서는 내보내기 단추가 늘 보인다 */
    @media (hover: none) { .kick { opacity: 0.8; } }
`;

/** 할 일 — 판 안의 줄 목록. 넓은 화면에서는 판 키에 맞춰 그 안에서 구른다 */
export const TodoGrid = styled(C.TodoGrid)`
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0 -10px;

    ${DESK} {
        flex: 1 1 auto;
        min-height: 220px;
        overflow-y: auto;
        contain: size;
    }
`;

/** 할 일 한 줄 — 동그란 체크, 이름과 날짜, 올리면 보이는 지우기 */
export const TodoCard = styled(C.TodoCard)`
    flex: none;
    gap: 12px;
    min-height: 52px;
    padding: 8px 10px;
    border: none;
    border-radius: 10px;
    background: transparent;
    transition: background-color 0.15s ease, opacity 0.2s ease;

    &::before { display: none; }
    /* 줄 사이 머리카락 선 — 올린 줄의 위아래에서는 지운다 */
    & + &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 10px;
        right: 10px;
        height: 1px;
        background-color: ${(p) => hairline(p.theme)};
        pointer-events: none;
    }
    &:hover::after, &:hover + &::after { opacity: 0; }
    &:hover {
        box-shadow: none;
        background-color: ${(p) => ink(p.theme, dark(p) ? 0.06 : 0.04)};
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
        ${focusRing}
    }
    .todo-info {
        gap: 2px;
        .title { font-size: 0.88rem; font-weight: 500; text-decoration-color: ${(p) => ink(p.theme, 0.4)}; }
        .date { font-size: 0.74rem; letter-spacing: 0; font-variant-numeric: tabular-nums; }
    }
    .delete-btn {
        width: 28px;
        height: 28px;
        padding: 0;
        border-radius: 8px;
        font-size: 1rem;
        transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)}; }
        &:focus-visible { opacity: 1; }
    }
    @media (hover: none) { .delete-btn { opacity: 0.6; } }
`;

/** 할 일이 없을 때 — 판의 남은 자리 가운데 문구 하나 */
export const EmptyBox = styled(C.EmptyBox)`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    padding: 24px 12px;
    border: none;
    p { font-size: 0.86rem; letter-spacing: 0; }
`;

/** 고르기 전 — 그림 없이 문구만 */
export const EmptyStateContainer = styled(C.EmptyStateContainer)`
    height: auto;
    gap: 0;
    font-size: 0.9rem;
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
