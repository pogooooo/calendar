/**
 * 바다(Ocean) 갈래의 공통 조각 — "맑은 물 아래 흰 모래, 그 위를 지나는 빛".
 *
 * 2026-10-07 다시 짬: 장식(조개 그림·불가사리·물결선·광택 알약·그라데이션 글씨)을 걷어 내고 요즘 화면의 문법으로.
 *   - 바다는 배경 하나가 맡는다: 옅은 모래빛 바닥에 어른거리는 물빛(three.js). 판은 그 위의 무채색 반투명 유리.
 *   - 선은 아주 옅은 머리카락 선(1px) 하나, 그림자는 멀고 부드럽게. 색은 깊은 청록 하나만 — 강조할 곳에만.
 *   - 글꼴: 한글·숫자 Pretendard, 큰 라틴 제목 Instrument Serif(SERIF), 작은 꼬리표 Geist Mono(MONO).
 *   - 모서리: 판 20px, 카드 12px, 조작부 10px, 칩 8px. 알약은 토글·점처럼 원래 둥근 것에만.
 * Celestial(금빛 실선·별·Orbit)·Maple(먹·종이·잎·고운바탕)과는 재료부터 다르다.
 *
 * 예전 이름(seaGlass·seaButton·bubbleCheck …)은 여러 파일이 쓰고 있어 그대로 두고, 그리는 법만 새것으로 바꿨다.
 * 갈래 컴포넌트의 *.styles.ts 는 여기 조각을 섞어 쓴다 (styles/maple/ink.ts 와 같은 자리).
 */
import { css, keyframes, type DefaultTheme } from "styled-components";
import { withAlpha } from "@/styles/color";
import { causticNet } from "./shoreArt";

const dark = (t: DefaultTheme) => t.mode === "dark";

/** 모서리 */
export const R = { sm: "8px", md: "12px", lg: "20px", pill: "999px" } as const;

/** 큰 라틴 제목(October, Ocean …) — 기울인 Instrument Serif 가 어울린다 */
export const SERIF = "'Instrument Serif', 'Pretendard Variable', Pretendard, serif";
/** 작은 꼬리표(요일·개수·시각) — 대문자 고정폭 */
export const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
/** 예전 이름 */
export const LATIN = SERIF;

/* ── 움직임 ─────────────────────────────────────────────────────────── */
export const ripple = keyframes`
    0%   { transform: scale(0.6); opacity: 0.5; }
    100% { transform: scale(1.6); opacity: 0; }
`;
export const bob = keyframes`
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-2px); }
`;
export const rise = keyframes`
    from { transform: translateY(6px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
`;
export const sheen = keyframes`
    0%   { background-position: -160% 0; }
    100% { background-position: 260% 0; }
`;
/** 판이 떠오를 때 — 흐림 없이 살짝 올라오며 나타난다 */
export const surfaceIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;
export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** 움직임을 끈 사람·위젯 창(투명 창이라 끝없는 움직임이 깜빡임이 된다)에서는 멈춘다 */
export const calm = css`
    html[data-theme-motion="off"] &, [data-widget] & { animation: none !important; }
    @media (prefers-reduced-motion: reduce) { animation: none !important; }
`;

/* ── 색 도구 ────────────────────────────────────────────────────────── */
/** 글자색에 투명도를 입힌 것 — 선·옅은 칠에 */
export const ink = (t: DefaultTheme, a: number) => withAlpha(t.colors.text, a);
/** 머리카락 선 색. strong 은 조작부 테두리처럼 조금 더 보여야 할 때 */
export const hairline = (t: DefaultTheme, strong = false) =>
    dark(t) ? `rgba(255, 255, 255, ${strong ? 0.12 : 0.07})` : `rgba(18, 33, 32, ${strong ? 0.13 : 0.075})`;

/** 키보드로 왔을 때만 보이는 고리 */
export const focusRing = css`
    &:focus-visible {
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)};
        outline-offset: 2px;
    }
`;

/** 작은 꼬리표 글씨 — 고정폭 대문자 */
export const label = css`
    font-family: ${MONO};
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => p.theme.colors.textSecondary};
`;

/* ── 겉 ─────────────────────────────────────────────────────────────── */
/**
 * 커서를 따라 판 위에 고이는 빛 — OceanAtmosphere 가 커서 아래의 판(--ocean-glass: 1)에 --gx·--gy 를 적어 준다.
 * 판 바깥에 있을 때는 -999px 라 보이지 않는다.
 */
const spotlight = (t: DefaultTheme, strength = 1) =>
    `radial-gradient(560px circle at var(--gx, -999px) var(--gy, -999px), ${dark(t) ? `rgba(120, 240, 225, ${0.13 * strength})` : `rgba(255, 255, 255, ${0.42 * strength})`}, transparent 55%)`;

/**
 * 판 — 물 위에 뜬 액체 유리. 뒤의 물빛이 짙게(채도를 올려) 비치고, 왼쪽 위 가장자리에 빛이 맺히며(정반사),
 * 커서를 따라 빛이 고인다. 그림자는 멀고 옅게.
 *   panel: 물 위에 바로 놓이는 큰 판(뒤가 흐리게 비친다)
 *   card:  판 안의 작은 조각(흐림 없이 — 여러 개여도 가볍게)
 *   float: 떠 있는 창·차림표(거의 불투명, 그림자 조금 더)
 */
export const surface = (kind: "panel" | "card" | "float" = "panel") => css`
    --ocean-glass: 1;
    ${(p) => {
        const d = dark(p.theme);
        if (kind === "card") return css`
            background-color: ${d ? "rgba(255, 255, 255, 0.045)" : "rgba(255, 255, 255, 0.42)"};
            background-image: ${spotlight(p.theme, 0.8)}, linear-gradient(140deg, ${d ? "rgba(160, 240, 230, 0.06)" : "rgba(255, 255, 255, 0.5)"}, transparent 46%);
            border: 1px solid ${d ? "rgba(160, 240, 230, 0.1)" : "rgba(255, 255, 255, 0.7)"};
            box-shadow: inset 0 1px 0 ${d ? "rgba(180, 250, 240, 0.08)" : "rgba(255, 255, 255, 0.85)"}, 0 6px 16px -12px ${d ? "rgba(0, 0, 0, 0.6)" : "rgba(6, 60, 66, 0.35)"};
        `;
        if (kind === "float") return css`
            background-color: ${d ? "rgba(14, 34, 38, 0.9)" : "rgba(255, 255, 255, 0.86)"};
            background-image: linear-gradient(140deg, ${d ? "rgba(160, 240, 230, 0.08)" : "rgba(255, 255, 255, 0.7)"}, transparent 42%);
            backdrop-filter: blur(30px) saturate(180%);
            -webkit-backdrop-filter: blur(30px) saturate(180%);
            border: 1px solid ${d ? "rgba(160, 240, 230, 0.16)" : "rgba(255, 255, 255, 0.85)"};
            box-shadow: inset 0 1px 0 ${d ? "rgba(180, 250, 240, 0.12)" : "#FFFFFF"}, 0 28px 64px -24px ${d ? "rgba(0, 0, 0, 0.75)" : "rgba(6, 60, 66, 0.42)"}, 0 2px 8px ${d ? "rgba(0, 0, 0, 0.3)" : "rgba(6, 60, 66, 0.08)"};
        `;
        return css`
            background-color: ${d ? "rgba(10, 32, 37, 0.5)" : "rgba(255, 255, 255, 0.54)"};
            background-image: ${spotlight(p.theme)}, linear-gradient(140deg, ${d ? "rgba(160, 240, 230, 0.1)" : "rgba(255, 255, 255, 0.55)"} 0%, ${d ? "rgba(160, 240, 230, 0.02)" : "rgba(255, 255, 255, 0.12)"} 38%, transparent 62%, ${d ? "rgba(160, 240, 230, 0.04)" : "rgba(255, 255, 255, 0.16)"} 100%);
            backdrop-filter: blur(30px) saturate(135%) brightness(1.03);
            -webkit-backdrop-filter: blur(30px) saturate(135%) brightness(1.03);
            border: 1px solid ${d ? "rgba(160, 240, 230, 0.14)" : "rgba(255, 255, 255, 0.62)"};
            box-shadow:
                inset 0 1px 0 ${d ? "rgba(180, 250, 240, 0.14)" : "rgba(255, 255, 255, 0.92)"},
                inset 0 -1px 0 ${d ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.3)"},
                0 1px 2px ${d ? "rgba(0, 0, 0, 0.25)" : "rgba(6, 60, 66, 0.06)"},
                0 24px 56px -28px ${d ? "rgba(0, 0, 0, 0.75)" : "rgba(6, 60, 66, 0.5)"};
        `;
    }}
`;
/** 예전 이름들 */
export const seaGlass = surface;
export const glass = (strength: "soft" | "solid" = "soft") => surface(strength === "solid" ? "float" : "panel");

/** 물가 판(사이드바·폰 탭바) — 따뜻한 흰빛 액체 유리. 예전의 모래 그림 대신 */
export const sand = css`
    --ocean-glass: 1;
    background-color: ${(p) => (dark(p.theme) ? "rgba(9, 26, 30, 0.6)" : "rgba(252, 252, 249, 0.46)")};
    background-image: ${(p) => spotlight(p.theme, 0.7)}, linear-gradient(160deg, ${(p) => (dark(p.theme) ? "rgba(160, 240, 230, 0.08)" : "rgba(255, 255, 255, 0.6)")}, transparent 40%);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    color: ${(p) => p.theme.colors.text};
`;
/** 물가 판 위 글씨 — 이제 그냥 글자색 */
export const sandInk = (t: DefaultTheme, soft = false) => (soft ? t.colors.textSecondary : t.colors.text);

/** 판의 위쪽 가장자리 선 — 예전 물거품 띠 자리 */
export const foamEdge = css`
    background-image: linear-gradient(${(p) => hairline(p.theme)}, ${(p) => hairline(p.theme)});
    background-repeat: no-repeat;
    background-size: 100% 1px;
    background-position: top;
`;

/** 멈춘 물빛 그물 — three.js 가 돌지 않는 곳(위젯 창·떠 있는 창 안)에서 아주 옅게 */
const NET = {
    light: causticNet({ freq: 0.011, seed: 11, alpha: 0.5 }),
    dark: causticNet({ freq: 0.011, seed: 11, alpha: 0.18, color: "150 230 220" }),
};
export const stillCaustics = (size = 560) => css`
    background-image: ${(p) => NET[p.theme.mode]};
    background-size: ${size}px ${size}px;
`;
export const causticNetImage = (t: DefaultTheme) => NET[t.mode];

/** 예전의 그림 장식(불가사리·가리비). 이제 그리지 않는다 — 남은 자리가 있으면 비어 보이게 */
export const starfishImage = (_tone?: string) => "none";
export const scallopImage = (_tone?: string) => "none";

/** 물방울 — 가는 테두리 동그라미 */
export const bubbleFill = css`
    border-radius: 50%;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    background: ${(p) => (dark(p.theme) ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.6)")};
`;

/** 물(바탕) 위에 바로 쓰는 글씨 — 바탕이 밝아졌으니 그냥 글자색 */
export const onWater = css`
    color: ${(p) => p.theme.colors.text};
`;

/** 옛 물빛 얼룩 — 판 안쪽에 아주 옅은 빛 한 번 */
export const caustics = (alpha = 0.16) => css`
    background-image: radial-gradient(ellipse 60% 40% at 20% 0%, ${(p) => withAlpha(dark(p.theme) ? p.theme.colors.primary : "#FFFFFF", alpha)}, transparent 70%);
`;

/** 나눔선 — 머리카락 선 하나 (예전 물결선 자리) */
export const waveRule = (_alpha = 0.5) => css`
    height: 1px;
    border: none;
    background: ${(p) => hairline(p.theme)};
`;
/** 밑줄 — 머리카락 선 (탭·제목 아래) */
export const waveUnderline = (_alpha = 0.7) => css`
    background-image: linear-gradient(${(p) => hairline(p.theme)}, ${(p) => hairline(p.theme)});
    background-repeat: no-repeat;
    background-position: 0 100%;
    background-size: 100% 1px;
`;

/** 점 — 표식 자리. 납작한 동그라미 */
export const pearl = (size = "6px", color?: string) => css`
    width: ${size};
    height: ${size};
    border-radius: 50%;
    flex: none;
    background: ${(p) => color ?? p.theme.colors.primary};
`;

/** 가는 선 조개 — 꼭 필요한 한두 곳(빈 자리·상표)에만. 색은 background-color 로 */
const SHELL = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20.5c-1 0-1.8-.5-2.2-1.3L4.2 9.4C3.5 8.1 4.3 6.5 5.8 6.2 7.5 4.1 9.6 3 12 3s4.5 1.1 6.2 3.2c1.5.3 2.3 1.9 1.6 3.2l-5.6 9.8c-.4.8-1.2 1.3-2.2 1.3Z'/><path d='M12 20.5 8.6 4.4M12 20.5V3M12 20.5l3.4-16.1M12 20.5 5.8 6.2M12 20.5l6.2-14.3'/></svg>",
)}")`;
export const shell = (size = "14px", color?: string) => css`
    width: ${size};
    height: ${size};
    flex: none;
    background-color: ${(p) => color ?? p.theme.colors.textSecondary};
    -webkit-mask: ${SHELL} center / contain no-repeat;
    mask: ${SHELL} center / contain no-repeat;
`;

/* ── 조작부 ─────────────────────────────────────────────────────────── */
/** 단추 — 납작한 면, 10px 모서리. primary 는 청록을 꽉 채우고, default 는 흰 면에 선 하나, ghost 는 글씨만 */
export const seaButton = (variant: "default" | "primary" | "danger" | "ghost" = "default") => css`
    position: relative;
    border-radius: 10px;
    font-family: ${(p) => p.theme.fonts.body};
    font-weight: 600;
    letter-spacing: -0.005em;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
    ${(p) => {
        const c = p.theme.colors;
        const d = dark(p.theme);
        if (variant === "primary") return css`
            color: ${d ? "#06110F" : "#FFFFFF"};
            background-color: ${c.primary};
            background-image: linear-gradient(180deg, rgba(255, 255, 255, ${d ? 0.28 : 0.2}), rgba(255, 255, 255, 0) 60%);
            border: 1px solid ${d ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.16)"};
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, ${d ? 0.45 : 0.32}), 0 8px 20px -8px ${withAlpha(c.primary, d ? 0.55 : 0.7)};
            &:hover:not(:disabled) {
                background-color: color-mix(in srgb, ${c.primary} 88%, #FFFFFF);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 10px 26px -8px ${withAlpha(c.primary, d ? 0.7 : 0.85)};
            }
        `;
        if (variant === "danger") return css`
            color: #FFFFFF;
            background-color: ${c.error};
            border: 1px solid transparent;
            &:hover:not(:disabled) { background-color: color-mix(in srgb, ${c.error} 88%, #000000); }
        `;
        if (variant === "ghost") return css`
            color: ${c.textSecondary};
            background-color: transparent;
            border: 1px solid transparent;
            &:hover:not(:disabled) { color: ${c.text}; background-color: ${ink(p.theme, d ? 0.08 : 0.05)}; }
        `;
        return css`
            color: ${c.text};
            background-color: ${d ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.62)"};
            border: 1px solid ${d ? "rgba(160, 240, 230, 0.16)" : "rgba(255, 255, 255, 0.9)"};
            box-shadow: inset 0 1px 0 ${d ? "rgba(180, 250, 240, 0.1)" : "#FFFFFF"}, 0 2px 8px -3px ${d ? "rgba(0, 0, 0, 0.4)" : "rgba(6, 60, 66, 0.18)"};
            &:hover:not(:disabled) { background-color: ${d ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.92)"}; box-shadow: inset 0 1px 0 #FFFFFF, 0 6px 16px -6px ${d ? "rgba(0, 0, 0, 0.5)" : "rgba(6, 60, 66, 0.28)"}; }
        `;
    }}
    &:active:not(:disabled) { transform: translateY(0.5px) scale(0.985); }
    &:disabled { opacity: 0.45; cursor: default; }
    ${focusRing}
`;

/** 입력칸 — 흰 면, 선 하나, 누르면 청록 선과 옅은 고리 */
export const tideInput = css`
    border-radius: 10px;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    background-color: ${(p) => (dark(p.theme) ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.9)")};
    box-shadow: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
    &:hover { border-color: ${(p) => ink(p.theme, dark(p.theme) ? 0.22 : 0.2)}; }
    &:focus, &:focus-within {
        outline: none;
        border-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.16)};
    }
`;

/** 체크칸 — 동그라미. 끝내면 청록으로 차고 흰 체크가 선다 */
export const bubbleCheck = (done: boolean, size = "18px") => css`
    position: relative;
    width: ${size};
    height: ${size};
    flex: none;
    border-radius: 50%;
    border: 1.5px solid ${(p) => (done ? p.theme.colors.primary : ink(p.theme, 0.3))};
    background: ${(p) => (done ? p.theme.colors.primary : "transparent")};
    color: ${(p) => (dark(p.theme) ? "#06110F" : "#FFFFFF")};
    transition: background-color 0.18s ease, border-color 0.18s ease;
    svg { opacity: ${done ? 1 : 0}; transition: opacity 0.15s ease; }
`;

/** 스위치(label > input + .slider) — 납작한 홈 위를 흰 손잡이가 미끄러진다 */
export const pearlToggle = css`
    .slider {
        border-radius: ${R.pill};
        background: ${(p) => ink(p.theme, dark(p.theme) ? 0.22 : 0.16)};
        box-shadow: none;
    }
    .slider::before {
        background: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
    }
    input:checked + .slider { background: ${(p) => p.theme.colors.primary}; }
`;

/** 작은 고르개(칩) — 8px 모서리. 고르면 청록 기운이 돈다 */
export const seaChip = (active: boolean, color?: string) => css`
    border-radius: 8px;
    border: 1px solid ${(p) => (active ? withAlpha(color ?? p.theme.colors.primary, 0.45) : hairline(p.theme, true))};
    background-color: ${(p) => (active ? withAlpha(color ?? p.theme.colors.primary, 0.1) : "transparent")};
    color: ${(p) => (active ? p.theme.colors.text : p.theme.colors.textSecondary)};
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
`;

/** 둥근 고리 표식 — 끝없이 번지지 않고 가만히 있다 */
export const rippleMark = (size = "30px") => css`
    position: absolute;
    width: ${size};
    height: ${size};
    border-radius: 50%;
    pointer-events: none;
    border: 1.5px solid ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
`;

/** 진행 — 가는 막대 */
export const waterLevel = (ratio: number) => css`
    position: relative;
    overflow: hidden;
    border-radius: ${R.pill};
    background: ${(p) => ink(p.theme, dark(p.theme) ? 0.12 : 0.08)};
    &::before {
        content: "";
        position: absolute;
        inset: 0;
        width: ${Math.max(0, Math.min(1, ratio)) * 100}%;
        background: ${(p) => p.theme.colors.primary};
        border-radius: inherit;
        transition: width 0.6s ${EASE};
    }
`;

/* ── 시간 축 (프로젝트 타임라인·주간 달력) ─────────────────────────────── */
/** 오늘을 가리키는 세로선 — 위가 진하고 아래로 옅어지는 청록 한 줄 */
export const sunBeam = (tint?: string | ((t: DefaultTheme) => string)) => css`
    pointer-events: none;
    ${(p) => {
        const base = typeof tint === "function" ? tint(p.theme) : tint ?? p.theme.colors.primary;
        return css`background-image: linear-gradient(180deg, ${withAlpha(base, 0.9)}, ${withAlpha(base, 0.15)});`;
    }}
    background-size: 1.5px 100%;
    background-position: center top;
    background-repeat: no-repeat;
`;
