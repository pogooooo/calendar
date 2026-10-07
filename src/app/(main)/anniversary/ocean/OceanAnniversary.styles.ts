/**
 * 바다의 기념일 — 가장 가까운 날의 큰 숫자와, 그 뒤를 잇는 물때 줄 (배치는 OceanAnniversaryLayout).
 * Celestial·Maple: 별자리 워터마크 아래 위의 새 기념일 서식, 아래 가운데 정렬 카드 격자(마름모 귀퉁이·궤도 고리).
 * 바다: 물 위의 머리줄(제목·개수 | + 새 기념일 추가 — 누르면 그 아래 유리 서식이 펼쳐진다),
 *   큰 판 하나에 가장 가까운 기념일(고정폭 꼬리표·아이콘·이름·날짜 | 아주 큰 D 숫자),
 *   그 아래 남은 날들이 가로 한 줄 위에 정거장처럼 — 날 사이가 멀수록 간격도 조금 벌어진다.
 *   폰: 큰 판 아래 세로 줄(왼쪽 선 위 점, 오른쪽 한 줄 카드).
 * 서식 칸(아이콘 고르개·입력칸·고르개·추가)은 page.tsx 가 그린 것을 여기서 덮어쓴다.
 * 움직임: 판·정거장이 차례로 한 번 떠오르고 서식은 살짝 내려앉으며 열린다. 끝없는 움직임 없음(calm).
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialAnniversary.styles";
import { EASE, R, calm, focusRing, hairline, ink, label, seaButton, surface, surfaceIn, tideInput } from "@/styles/ocean/water";
import { ghostIcon } from "@/components/modal/baseModal/ocean/oceanLayer";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialAnniversary.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 한 번 떠오르기 — 끝나면 transform 을 남기지 않는다(backwards) */
const arrive = (delay: number) => css`
    animation: ${surfaceIn} 0.45s ${delay}s ${EASE} backwards;
    ${calm}
`;

/** 서식이 머리줄 아래로 살짝 내려앉으며 열린다 */
const drop = keyframes`
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: none; }
`;

const panel = css`
    ${surface("panel")}
    min-width: 0;
    border-radius: ${R.lg};
`;

/** 물때 줄의 높이 — 날짜 꼬리표(14) + 띄움(8) + 점의 반(4.5) */
const LINE_Y = 26;

/* ── 틀 ──────────────────────────────────────────────────────────── */

/** 화면 전체 — 넓게 쓰고, 아래 90px 는 독 자리로 비운다 */
export const Frame = styled.div`
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

/** + 새 기념일 추가 — 서식이 열려 있으면 흰 면으로 물러난다 */
export const Compose = styled.button<{ $open: boolean }>`
    ${(p) => seaButton(p.$open ? "default" : "primary")}
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: none;
    height: 36px;
    padding: 0 14px 0 11px;
    font-size: 0.84rem;
    white-space: nowrap;
    svg { width: 16px; height: 16px; stroke-width: 2; transition: transform 0.2s ${EASE}; }
    ${(p) => p.$open && css`svg { transform: rotate(45deg); }`}
    ${MOBILE} { height: 40px; }
`;

/** 새 기념일 서식 — 머리줄 아래 펼쳐지는 유리 판 하나 */
export const Composer = styled.form`
    ${panel}
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px 20px 20px;
    animation: ${drop} 0.28s ${EASE} backwards;
    ${calm}

    .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .cap { font-size: 0.95rem; font-weight: 600; letter-spacing: -0.01em; }

    ${MOBILE} { padding: 16px; gap: 12px; }
`;

export const Close = styled.button`
    ${ghostIcon("32px")}
    svg { width: 18px; height: 18px; }
    ${MOBILE} { width: 40px; height: 40px; }
`;

/* ── 서식 칸 (page.tsx 가 그린다) ──────────────────────────────────── */

export const IconRow = styled(C.IconRow)`
    gap: 6px;
    flex-wrap: wrap;
    ${MOBILE} { flex-wrap: nowrap; gap: 4px; }
`;

/** 아이콘 고르개 — 네모 단추, 고르면 옅은 청록 면과 청록 테 */
export const IconChoice = styled(C.IconChoice)`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.5) : hairline(p.theme, true))};
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.09) : dark(p) ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)")};
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    box-shadow: none;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    ${(p) => p.$selected && css`svg { filter: none; }`}

    &:hover { color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)}; border-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.6) : ink(p.theme, 0.2))}; }
    ${focusRing}
    ${MOBILE} { height: 42px; }
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

/* ── 가장 가까운 날 ──────────────────────────────────────────────── */

/** 지우기 — 판 오른쪽 위, 올리면 보인다 (손가락에는 늘 옅게) */
export const Delete = styled.button`
    ${ghostIcon("32px")}
    position: absolute;
    top: 14px;
    right: 14px;
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
    svg { width: 16px; height: 16px; }
    &:hover:not(:disabled) { color: ${(p) => p.theme.colors.error}; background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)}; }
    &:focus-visible { opacity: 1; }
    @media (hover: none) { opacity: 0.6; }
`;

/** 큰 판 — 왼쪽에 꼬리표·아이콘·이름·날짜, 오른쪽에 아주 큰 남은 날 수 */
export const Hero = styled.section<{ $today: boolean }>`
    ${panel}
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 24px;
    padding: 28px 36px 32px 32px;
    ${arrive(0)}

    .eyebrow { ${label} display: block; margin-bottom: 26px; }
    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        margin-bottom: 16px;
        border-radius: 12px;
        background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1)};
        color: ${(p) => p.theme.colors.primary};
        svg { width: 22px; height: 22px; }
    }
    .name {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.2;
        word-break: keep-all;
        overflow-wrap: anywhere;
    }
    .date {
        display: block;
        margin-top: 8px;
        font-size: 0.92rem;
        color: ${(p) => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    .count {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-family: ${(p) => p.theme.fonts.numeral};
        line-height: 0.8;
        white-space: nowrap;
    }
    .count .d {
        margin-top: 0.5rem;
        font-size: 1.7rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    .count b {
        font-size: 8.5rem;
        font-weight: 700;
        letter-spacing: -0.055em;
        font-variant-numeric: tabular-nums;
        color: ${(p) => (p.$today ? p.theme.colors.primary : p.theme.colors.text)};
    }
    ${(p) => p.$today && css`.count b { font-size: 5.5rem; letter-spacing: -0.04em; }`}

    &:hover ${Delete} { opacity: 1; }

    ${MOBILE} {
        gap: 16px;
        padding: 20px 20px 22px;
        .eyebrow { margin-bottom: 18px; }
        .icon { width: 40px; height: 40px; margin-bottom: 12px; svg { width: 20px; height: 20px; } }
        .name { font-size: 1.45rem; }
        .count .d { font-size: 1.2rem; margin-top: 0.3rem; }
        .count b { font-size: ${(p) => (p.$today ? "3.2rem" : "4.6rem")}; }
        ${Delete} { top: 8px; right: 8px; width: 40px; height: 40px; }
    }
`;

/* ── 물때 줄 ─────────────────────────────────────────────────────── */

export const Tide = styled.section`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const TideHead = styled.div`
    ${label}
    padding: 0 2px;
    b { margin-left: 6px; font-weight: 500; color: ${(p) => p.theme.colors.text}; }
`;

/**
 * 가로로 구르는 자리. 구르는 상자는 제 밖을 잘라 내므로, 카드의 멀고 부드러운 그림자가 다 번질 만큼
 * 안쪽을 띄우고(옆 28 · 아래 52) 그만큼 바깥을 당겨 자리는 그대로 둔다. 폰에서는 구르지 않고 세로로 선다
 */
export const Track = styled.div`
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
    margin: 0 -28px -32px;
    padding: 0 28px 52px;

    ${MOBILE} { overflow: visible; margin: 0; padding: 0; }
`;

/** 정거장들 — 그 뒤로 가는 선 하나가 지나간다 (폰에서는 왼쪽 세로선) */
export const Stops = styled.ol`
    position: relative;
    display: flex;
    width: max-content;
    min-width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: ${LINE_Y}px;
        height: 1px;
        background-color: ${(p) => hairline(p.theme, true)};
        pointer-events: none;
    }

    ${MOBILE} {
        flex-direction: column;
        gap: 10px;
        width: auto;
        min-width: 0;
        &::before { left: 11px; right: auto; top: 18px; bottom: 18px; width: 1px; height: auto; }
    }
`;

/** 정거장 하나 — 날짜 꼬리표, 선 위의 점, 그 아래 카드 */
export const Stop = styled.li<{ $first: boolean }>`
    position: relative;
    flex: none;
    display: flex;
    flex-direction: column;
    width: 208px;
    ${arrive(0.08)}

    .when {
        ${label}
        height: 14px;
        line-height: 14px;
        padding-left: 18px;
        white-space: nowrap;
    }
    .node {
        display: block;
        width: 9px;
        height: 9px;
        margin: 8px 0 14px 14px;
        border-radius: 50%;
        background-color: ${(p) => (p.$first ? p.theme.colors.primary : p.theme.colors.surface)};
        box-shadow: 0 0 0 1.5px ${(p) => (p.$first ? p.theme.colors.primary : ink(p.theme, dark(p) ? 0.4 : 0.3))};
    }

    ${MOBILE} {
        width: auto;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        margin-left: 0 !important;
        .when { display: none; }
        .node { flex: none; margin: 0 0 0 7px; }
    }
`;

/** 정거장 카드 — 아이콘, 이름, 날짜, D 숫자. 올리면 지우기가 보인다. 폰에서는 한 줄 */
export const StopCard = styled.div`
    ${surface("panel")}
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 16px 18px 16px;
    border-radius: 16px;

    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        margin-bottom: 14px;
        border-radius: 10px;
        background-color: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)};
        color: ${(p) => p.theme.colors.text};
        svg { width: 18px; height: 18px; }
    }
    .text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .name {
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .date { font-size: 0.78rem; color: ${(p) => p.theme.colors.textSecondary}; font-variant-numeric: tabular-nums; }
    .dday {
        margin-top: 14px;
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.4rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
    }

    ${Delete} { top: 10px; right: 10px; width: 30px; height: 30px; }
    &:hover ${Delete} { opacity: 1; }

    ${MOBILE} {
        flex: 1;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        padding: 12px 8px 12px 14px;
        .icon { flex: none; margin: 0; }
        .text { flex: 1; }
        .dday { flex: none; margin: 0; font-size: 1.1rem; }
        ${Delete} { position: static; flex: none; width: 36px; height: 36px; }
    }
`;

/** 기념일이 하나도 없을 때 — 판 한 장에 그림·문구·단추 */
export const Nothing = styled.div`
    ${panel}
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 44px 24px 40px;
    text-align: center;
    ${arrive(0)}

    p { margin: 0 0 18px; font-size: 0.9rem; line-height: 1.7; color: ${(p) => p.theme.colors.textSecondary}; }
`;
