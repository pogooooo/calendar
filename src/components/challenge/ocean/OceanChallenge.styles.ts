/**
 * 바다의 챌린지 — 카드 갤러리와 펼친 무대 (배치는 OceanChallengeLayout).
 * Celestial·Maple: 왼쪽 목록 | 오른쪽 스티커 판·자세히를 손잡이로 끌어 나눈 세 칸.
 * 바다: 물 위에 얇은 머리줄(제목·개수 | 거르개·새 챌린지), 그 아래 유리 카드 격자.
 *   카드 한 장 = 카테고리 점 · 이름 · 반복 · 진행 고리(목표가 없으면 ∞) · 지난 이레의 점 일곱 · 이어 온 횟수.
 *   카드를 누르면 격자 위에 무대가 열린다(격자는 아래에 남고, 고른 카드는 청록 테) — 머리줄은 "‹ 챌린지 / 이름" 과
 *   앞뒤·고치기·지우기, 왼쪽 판(이름·큰 고리·숫자·오늘 단추) | 오른쪽 판(열 칸씩 서는 스티커 판과 이번 주).
 *   끄는 손잡이는 없다. 좁으면 두 판을 위아래로, 폰은 카드도 한 줄로.
 * 움직임: 카드·판이 차례로 한 번 떠오르고 고리가 한 번 차오른다. 끝없는 움직임 없음(calm).
 *
 * 스티커 판(StickerGrid·StickerSlot)은 ChallengeView 가 그려 넘기므로 Celestial 이름을 그대로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialChallenge.styles";
import { EASE, MONO, R, calm, focusRing, hairline, ink, label, seaButton, surface, surfaceIn } from "@/styles/ocean/water";
import { ghostIcon } from "@/components/modal/baseModal/ocean/oceanLayer";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialChallenge.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 한 번 떠오르기 — 끝나면 transform 을 남기지 않는다(backwards). 남기면 안의 fixed 층(거르개 바탕)이 판에 갇힌다 */
const arrive = (delay = 0) => css`
    animation: ${surfaceIn} 0.45s ${delay}s ${EASE} backwards;
    ${calm}
`;

/** 고리가 비어 있다가 제 자리까지 한 번 찬다 */
const ringFill = keyframes`
    from { stroke-dashoffset: var(--len); }
`;

const panel = css`
    ${surface("panel")}
    min-width: 0;
    border-radius: ${R.lg};
`;

/* ── 스티커 판 (ChallengeView 가 그린다) ─────────────────────────────── */

/** 열 칸씩 한 줄 — 세기 쉬운 셈판. 첫 칸과 열째 칸이 판 머리의 양 끝에 맞는다. 폰은 일곱 칸씩 */
export const StickerGrid = styled(C.StickerGrid)`
    display: grid;
    grid-template-columns: repeat(10, 42px);
    justify-content: space-between;
    align-content: start;
    gap: 14px 4px;
    ${MOBILE} { grid-template-columns: repeat(7, 38px); gap: 10px 4px; }
`;

export const StickerSlot = styled(C.StickerSlot)`
    width: 42px;
    height: 42px;
    ${MOBILE} { width: 38px; height: 38px; }
`;

/* ── 틀 ──────────────────────────────────────────────────────────── */

/** 화면 전체 — 넓게 쓴다. 독 자리는 뼈대(MainContent 의 --app-dock-clearance)가 비우므로 여기선 숨 쉴 틈만 */
export const Gallery = styled.div`
    width: min(1240px, 100%);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 24px;
    font-family: ${(p) => p.theme.fonts.body};
    color: ${(p) => p.theme.colors.text};

    ${MOBILE} { gap: 14px; padding-bottom: 8px; }
`;

/** 머리줄 — 판 없이 물 위에 바로. 거르개의 펼친 창이 아래 카드들 위로 오도록 쌓임 순서를 올린다 */
export const Bar = styled.header`
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    scroll-margin-top: 24px;
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

/** 제목 옆의 개수 — 작은 고정폭 꼬리표 */
export const Count = styled.span`
    ${label}
    font-variant-numeric: tabular-nums;
`;

export const Tools = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
`;

/** 새 챌린지 — 청록 단추 하나 */
export const NewButton = styled.button`
    ${seaButton("primary")}
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    margin-left: 4px;
    padding: 0 14px 0 11px;
    font-size: 0.84rem;
    white-space: nowrap;
    svg { width: 16px; height: 16px; stroke-width: 2; }
    ${MOBILE} { height: 40px; }
`;

/* ── 갤러리 ──────────────────────────────────────────────────────── */

export const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

/** 구역 이름 — 굵은 글씨와 고정폭 개수. 실선·마름모 없음 */
export const SectionHead = styled.h2`
    margin: 0;
    padding: 0 2px;
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};

    b { ${label} font-variant-numeric: tabular-nums; }
`;

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
    gap: 14px;
    ${MOBILE} { grid-template-columns: minmax(0, 1fr); gap: 10px; }
`;

/** 진행 고리 — 가는 홈 위로 청록이 찬다. 가운데에 백분율(목표가 없으면 ∞, 다 채우면 체크) */
export const Ring = styled.span<{ $size: number }>`
    position: relative;
    flex: none;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    & > svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        overflow: visible;
    }
    .track { fill: none; stroke: ${(p) => ink(p.theme, dark(p) ? 0.14 : 0.085)}; }
    .value {
        fill: none;
        stroke: ${(p) => p.theme.colors.primary};
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s ${EASE};
        animation: ${ringFill} 0.9s 0.15s ${EASE} backwards;
        ${calm}
    }
    .center {
        position: relative;
        display: inline-flex;
        align-items: baseline;
        font-size: ${(p) => (p.$size > 80 ? "1.75rem" : "0.74rem")};
        font-weight: ${(p) => (p.$size > 80 ? 700 : 600)};
        letter-spacing: -0.02em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.text};

        small { margin-left: 1px; font-size: 0.6em; font-weight: 500; color: ${(p) => p.theme.colors.textSecondary}; }
        svg { width: ${(p) => (p.$size > 80 ? 28 : 16)}px; height: ${(p) => (p.$size > 80 ? 28 : 16)}px; color: ${(p) => p.theme.colors.primary}; }
    }
`;

/** 지난 이레 — 날마다 고정폭 머리글자 하나와 점 하나. 해낸 칸은 청록으로 차고, 놓친 칸은 빈 고리, 칸이 아닌 날은 작은 점 */
export const Week = styled.span`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    align-items: end;

    .day { display: flex; flex-direction: column; align-items: center; gap: 7px; }
    .day b {
        font-family: ${MONO};
        font-size: 0.6rem;
        font-weight: 500;
        letter-spacing: 0.04em;
        line-height: 1;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    .day i {
        display: block;
        width: 12px;
        height: 12px;
        box-sizing: border-box;
        border-radius: 50%;
        transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .done i { background-color: ${(p) => p.theme.colors.primary}; }
    .miss i { border: 1.5px solid ${(p) => ink(p.theme, dark(p) ? 0.28 : 0.2)}; }
    .open i { border: 1.5px solid ${(p) => p.theme.colors.primary}; }
    .off i { width: 4px; height: 4px; margin: 4px; background-color: ${(p) => ink(p.theme, dark(p) ? 0.22 : 0.16)}; }
    .today b { color: ${(p) => p.theme.colors.primary}; font-weight: 600; }
    .today:not(.off) i { outline: 1.5px solid ${(p) => withAlpha(p.theme.colors.primary, 0.3)}; outline-offset: 2px; }
`;

/** 카드 — 물 위의 유리 한 장. 올리면 조금 맑아지고, 누르면 살짝 눌린다. 무대에 올라 있는 카드는 청록 테 */
export const Tile = styled.button<{ $muted: boolean; $current: boolean }>`
    ${panel}
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 18px 14px 20px;
    text-align: left;
    font: inherit;
    color: ${(p) => p.theme.colors.text};
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
    ${arrive()}

    &:hover {
        background-color: ${(p) => (dark(p) ? "rgba(18, 48, 54, 0.62)" : "rgba(255, 255, 255, 0.7)")};
        border-color: ${(p) => (dark(p) ? "rgba(160, 240, 230, 0.2)" : "rgba(255, 255, 255, 0.9)")};
    }
    &:active { transform: scale(0.985); }
    ${focusRing}

    .head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        column-gap: 14px;
        row-gap: 3px;
        align-items: start;
    }
    .head > ${Ring} { grid-column: 2; grid-row: 1 / span 3; }
    .cat {
        grid-column: 1;
        display: flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.textSecondary};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .cat i { flex: none; width: 8px; height: 8px; border-radius: 50%; background-color: ${(p) => ink(p.theme, 0.25)}; }
    .name {
        grid-column: 1;
        margin-top: 2px;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: -0.012em;
        line-height: 1.35;
        word-break: keep-all;
        overflow-wrap: anywhere;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        color: ${(p) => (p.$muted ? p.theme.colors.textSecondary : p.theme.colors.text)};
    }
    .cadence { grid-column: 1; font-size: 0.78rem; color: ${(p) => p.theme.colors.textSecondary}; }

    .foot {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid ${(p) => hairline(p.theme)};
        font-size: 0.78rem;
        color: ${(p) => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }
    .foot b { font-size: 0.92rem; font-weight: 700; color: ${(p) => (p.$muted ? p.theme.colors.textSecondary : p.theme.colors.text)}; }
    .foot em { font-style: normal; }
    .foot .streak { white-space: nowrap; }

    ${(p) => p.$muted && css`${Ring} .value { stroke: ${ink(p.theme, 0.32)}; }`}
    ${(p) => p.$current && css`
        outline: 1.5px solid ${withAlpha(p.theme.colors.primary, 0.55)};
        outline-offset: 3px;
    `}

    ${MOBILE} { padding: 16px 16px 12px 18px; gap: 14px; }
`;

/** 챌린지가 하나도 없을 때 — 판 한 장에 그림·문구·단추 */
export const Nothing = styled.div`
    ${panel}
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 44px 24px 40px;
    text-align: center;
    ${arrive()}

    p { margin: 0 0 18px; font-size: 0.9rem; color: ${(p) => p.theme.colors.textSecondary}; }
    ${NewButton} { margin-left: 0; }
`;

/* ── 펼친 무대 ───────────────────────────────────────────────────── */

/** ‹ 챌린지 / 이름 — 이름은 폰에서 숨긴다(아래 판 머리에 크게 있다) */
export const Crumbs = styled.nav`
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
`;

export const Back = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex: none;
    height: 36px;
    padding: 0 12px 0 6px;
    border: none;
    border-radius: 10px;
    background: transparent;
    font-family: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.textSecondary};
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;

    svg { width: 18px; height: 18px; stroke-width: 1.75; }
    &:hover { color: ${(p) => p.theme.colors.text}; background-color: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)}; }
    &:active { transform: scale(0.97); }
    ${focusRing}
    ${MOBILE} { height: 40px; }
`;

export const Slash = styled.span`
    flex: none;
    font-size: 1rem;
    color: ${(p) => ink(p.theme, 0.25)};
    ${MOBILE} { display: none; }
`;

export const Here = styled.span`
    min-width: 0;
    padding-left: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${MOBILE} { display: none; }
`;

/** 앞뒤로 — ‹ 2 / 6 › , 오른쪽에 머리카락 선 하나로 고치기·지우기와 가른다 */
export const Stepper = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
    margin-right: 6px;
    padding-right: 8px;
    border-right: 1px solid ${(p) => hairline(p.theme)};

    .pos {
        ${label}
        min-width: 3.6em;
        text-align: center;
        color: ${(p) => p.theme.colors.text};
        font-variant-numeric: tabular-nums;
    }
`;

/** 글자 단추 — 36px. 지우기는 올리면 산호 */
export const IconButton = styled.button<{ $danger?: boolean }>`
    ${ghostIcon("36px")}
    border-radius: 10px;
    svg { width: 18px; height: 18px; }
    ${(p) => p.$danger && css`
        &:hover:not(:disabled) { color: ${p.theme.colors.error}; background-color: ${withAlpha(p.theme.colors.error, 0.1)}; }
    `}
    ${MOBILE} { width: 40px; height: 40px; }
`;

/** 무대 — 왼쪽 자세히 | 오른쪽 스티커 판, 키를 맞춘다. 좁으면(열 칸 셈판이 들어설 폭이 없으면) 위아래로 */
export const Stage = styled.div`
    display: grid;
    grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
    @media (max-width: 1000px) { grid-template-columns: minmax(0, 1fr); }
    ${MOBILE} { gap: 12px; }
`;

export const Brief = styled.section`
    ${panel}
    display: flex;
    flex-direction: column;
    padding: 24px;
    ${arrive()}

    .cat {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    .cat i { width: 8px; height: 8px; border-radius: 50%; background-color: ${(p) => ink(p.theme, 0.25)}; }
    .name {
        margin: 10px 0 0;
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1.25;
        word-break: keep-all;
        overflow-wrap: anywhere;
    }
    .desc {
        margin: 8px 0 0;
        font-size: 0.88rem;
        line-height: 1.6;
        color: ${(p) => p.theme.colors.textSecondary};
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    ${MOBILE} { padding: 20px 18px; .name { font-size: 1.4rem; } }
`;

/** 큰 고리와 숫자 — 위아래 머리카락 선 사이 */
export const Meter = styled.div`
    display: flex;
    align-items: center;
    gap: 22px;
    margin: 22px 0;
    padding: 20px 0;
    border-top: 1px solid ${(p) => hairline(p.theme)};
    border-bottom: 1px solid ${(p) => hairline(p.theme)};

    dl {
        flex: 1;
        min-width: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    dl > div { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    dt { font-size: 0.8rem; color: ${(p) => p.theme.colors.textSecondary}; white-space: nowrap; }
    dd {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }
    ${MOBILE} { gap: 18px; margin: 18px 0; padding: 16px 0; }
`;

/** 오늘 — 판 바닥의 넓은 단추 하나 (해냈으면 흰 면의 되돌리기) */
export const TodayButton = styled.button<{ $undo: boolean }>`
    ${(p) => seaButton(p.$undo ? "default" : "primary")}
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 46px;
    font-size: 0.92rem;
    svg { width: 18px; height: 18px; stroke-width: 2; }
`;

/** 오늘 할 것이 없을 때 — 단추 대신 조용한 띠 (목표를 채웠으면 청록) */
export const Status = styled.div<{ $good: boolean }>`
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 600;
    text-align: center;
    color: ${(p) => (p.$good ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    background-color: ${(p) => (p.$good ? withAlpha(p.theme.colors.primary, dark(p) ? 0.14 : 0.09) : ink(p.theme, dark(p) ? 0.06 : 0.04))};
    svg { flex: none; width: 18px; height: 18px; stroke-width: 1.75; }
`;

/** 오른쪽 — 스티커 판. 바닥에 이번 주 점과 이어 온 횟수 */
export const Board = styled.section`
    ${panel}
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 22px 24px 20px;
    ${arrive(0.06)}

    & > header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    h3 { margin: 0; font-size: 0.95rem; font-weight: 600; letter-spacing: -0.01em; }
    .count { ${label} color: ${(p) => p.theme.colors.text}; font-variant-numeric: tabular-nums; }

    .board { flex: 1; display: flex; min-height: 96px; }
    .board .placeholder {
        margin: auto;
        padding: 16px 0;
        font-size: 0.86rem;
        line-height: 1.6;
        text-align: center;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    & > footer {
        display: flex;
        align-items: center;
        gap: 18px;
        padding-top: 16px;
        border-top: 1px solid ${(p) => hairline(p.theme)};
    }
    & > footer .label { flex: none; font-size: 0.8rem; font-weight: 600; color: ${(p) => p.theme.colors.textSecondary}; }
    & > footer ${Week} { flex: 1; max-width: 280px; }
    & > footer .streak { margin-left: auto; font-size: 0.8rem; color: ${(p) => p.theme.colors.textSecondary}; white-space: nowrap; }

    ${MOBILE} {
        padding: 18px 16px 16px;
        & > footer { gap: 12px; }
        & > footer .label { display: none; }
        & > footer ${Week} { max-width: none; }
    }
`;
