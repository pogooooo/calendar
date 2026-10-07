/**
 * 바다(Ocean) 갈래의 공통 조각 — "맑은 물 · 물빛 · 조개".
 *
 * Celestial 은 금빛 실선과 마름모, Maple 은 먹선·종이·도장이다. 바다는 그 어느 것도 빌리지 않는다:
 *   - 테두리 대신 유리(반투명 + 흐림)와 물빛 그림자
 *   - 직선 대신 물결선, 마름모·잎 대신 진주·물방울·조개
 *   - 네모 대신 둥근 모서리와 알약, 체크칸은 물이 차오르는 동그라미, 스위치는 물길 속 진주
 * 갈래 컴포넌트의 *.styles.ts 는 여기 조각을 섞어 쓴다 (styles/maple/ink.ts 와 같은 자리).
 */
import { css, keyframes, type DefaultTheme } from "styled-components";
import { withAlpha } from "@/styles/color";
import { BUBBLE_FILL, causticNet, foamBand, sandGrain, scallop, starfish } from "./shoreArt";

const dark = (t: DefaultTheme) => t.mode === "dark";

/** 모서리 — 물에 깎인 조약돌처럼 */
export const R = { sm: "10px", md: "16px", lg: "22px", pill: "999px" } as const;

/* ── 움직임 ─────────────────────────────────────────────────────────── */
export const ripple = keyframes`
    0%   { transform: scale(0.55); opacity: 0.55; }
    100% { transform: scale(1.7); opacity: 0; }
`;
export const bob = keyframes`
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-3px); }
`;
export const rise = keyframes`
    0%   { transform: translateY(8px) scale(0.6); opacity: 0; }
    30%  { opacity: 0.9; }
    100% { transform: translateY(-26px) scale(1); opacity: 0; }
`;
export const sheen = keyframes`
    0%   { background-position: -160% 0; }
    100% { background-position: 260% 0; }
`;
export const surfaceIn = keyframes`
    from { opacity: 0; transform: translateY(10px) scale(0.985); filter: blur(3px); }
    to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
`;

/** 움직임을 끈 사람·위젯 창(투명 창이라 끝없는 움직임이 깜빡임이 된다)에서는 멈춘다 */
export const calm = css`
    html[data-theme-motion="off"] &, [data-widget] & { animation: none !important; }
    @media (prefers-reduced-motion: reduce) { animation: none !important; }
`;

/* ── 물가 (2026-10-07, 참고 그림: 햇살 비치는 물가) ────────────────────
 * 화면 = 위에서 내려다본 맑은 물. 그 위에 바다유리 판이 떠 있고, 사이드바·탭바는 모래 물가다.
 * 물과 모래가 만나는 곳엔 하얀 물거품, 모래 위엔 조개·불가사리, 물속엔 물방울과 빛 그물. */

/** 물 위 글씨(참고 그림의 "Under the Sea") — 라틴 제목은 가는 세리프 Marcellus, 한글은 둥근 고운돋움 */
export const LATIN = "'Marcellus', 'Gowun Dodum', serif";

const SAND_TONES = { light: ["#F8EDD8", "#F2E0C0", "#EAD1A9"], dark: ["#3D4651", "#333B45", "#2A313B"] } as const;
const GRAIN = { light: sandGrain(false), dark: sandGrain(true) };
const FOAM = { light: foamBand(false), dark: foamBand(true) };
const NET = { light: causticNet({ freq: 0.012, seed: 11, alpha: 0.75 }), dark: causticNet({ freq: 0.012, seed: 11, alpha: 0.4, color: "150 245 235" }) };
const STARS = { amber: starfish("amber"), aqua: starfish("aqua"), coral: starfish("coral") };
const SHELLS = { peach: scallop("peach"), pearl: scallop("pearl"), coral: scallop("coral") };

/** 모래 위 글씨 — 바랜 유목(流木) 갈색. 밤엔 달빛 모래 위 옅은 상아색 */
export const sandInk = (t: DefaultTheme, soft = false) => (dark(t) ? (soft ? "#B9C2CC" : "#EEE8DD") : (soft ? "#9A7B5A" : "#5A4330"));

/** 모래 — 사이드바(물가)·폰 탭바·작은 쪽지. 따뜻한 모래알 결, 밤에는 달빛에 식은 회청색 모래 */
export const sand = css`
    background-color: ${(p) => SAND_TONES[p.theme.mode][1]};
    background-image: ${(p) => GRAIN[p.theme.mode]}, linear-gradient(180deg, ${(p) => SAND_TONES[p.theme.mode].join(", ")});
    background-size: 200px 200px, 100% 100%;
    color: ${(p) => sandInk(p.theme)};
`;

/** 물거품 띠 — 물(위)과 모래(아래)가 만나는 가장자리. 높이 36px 짜리 띠에 건다 */
export const foamEdge = css`
    background-image: ${(p) => FOAM[p.theme.mode]};
    background-repeat: repeat-x;
    background-size: 260px 36px;
`;

/** 멈춘 물빛 그물 — three.js 가 돌지 않는 곳(위젯 창·움직임 끔·떠 있는 창 안)에서 물로 읽히게 */
export const stillCaustics = (size = 520) => css`
    background-image: ${(p) => NET[p.theme.mode]};
    background-size: ${size}px ${size}px;
`;
export const causticNetImage = (t: DefaultTheme) => NET[t.mode];

/** 불가사리·가리비를 배경으로 (오늘 표시·빈 자리·머리글 장식) */
export const starfishImage = (tone: keyof typeof STARS = "amber") => STARS[tone];
export const scallopImage = (tone: keyof typeof SHELLS = "peach") => SHELLS[tone];

/** 물방울 하나 — 가장자리가 밝고 속이 비치는 동그라미 */
export const bubbleFill = css`
    border-radius: 50%;
    background: ${BUBBLE_FILL};
`;

/** 물 위에 바로 쓰는 글씨 — 흰 글씨에 물빛 그늘 (판 밖, 물 위) */
export const onWater = css`
    color: ${(p) => (dark(p.theme) ? "#E6FBF8" : "#FFFFFF")};
    text-shadow: 0 1px 2px ${(p) => (dark(p.theme) ? "rgba(0, 0, 0, 0.5)" : "rgba(6, 74, 86, 0.35)")}, 0 0 18px ${(p) => (dark(p.theme) ? "rgba(111, 227, 218, 0.25)" : "rgba(255, 255, 255, 0.45)")};
`;

/**
 * 바다유리 — 물에 닳은 유리 조각. 반투명하고, 위 가장자리에 햇빛이 맺히고, 아래로 물빛이 고인다.
 *   panel: 물 위에 떠 있는 큰 판(뒤가 흐리게 비친다)
 *   card:  판 안의 작은 조각(흐림 없이 — 마흔 개가 넘어도 가볍게)
 *   float: 떠 있는 창·차림표(거의 불투명)
 */
export const seaGlass = (kind: "panel" | "card" | "float" = "panel") => css`
    ${(p) => {
        const d = dark(p.theme);
        if (kind === "card") return css`
            background: ${d ? "linear-gradient(160deg, rgba(22, 84, 100, 0.55), rgba(10, 52, 66, 0.5))" : "linear-gradient(160deg, rgba(255, 255, 255, 0.82), rgba(240, 252, 250, 0.66))"};
            border: 1px solid ${d ? "rgba(127, 245, 234, 0.14)" : "rgba(255, 255, 255, 0.95)"};
            box-shadow: 0 8px 18px -10px ${d ? "rgba(0, 0, 0, 0.6)" : "rgba(4, 78, 92, 0.35)"}, inset 0 1px 0 ${d ? "rgba(160, 250, 240, 0.12)" : "#FFFFFF"};
        `;
        if (kind === "float") return css`
            background: ${d ? "linear-gradient(160deg, rgba(16, 66, 82, 0.96), rgba(7, 40, 52, 0.96))" : "linear-gradient(160deg, rgba(252, 255, 255, 0.96), rgba(230, 249, 247, 0.94))"};
            backdrop-filter: blur(22px) saturate(160%);
            -webkit-backdrop-filter: blur(22px) saturate(160%);
            border: 1px solid ${d ? "rgba(127, 245, 234, 0.22)" : "rgba(255, 255, 255, 0.95)"};
            box-shadow: 0 30px 60px -22px ${d ? "rgba(0, 0, 0, 0.75)" : "rgba(4, 60, 72, 0.5)"}, 0 2px 8px ${d ? "rgba(0, 0, 0, 0.3)" : "rgba(4, 60, 72, 0.1)"}, inset 0 1px 0 ${d ? "rgba(160, 250, 240, 0.18)" : "#FFFFFF"};
        `;
        return css`
            background: ${d
                ? "linear-gradient(155deg, rgba(24, 92, 110, 0.58) 0%, rgba(9, 50, 64, 0.52) 55%, rgba(5, 34, 46, 0.6) 100%)"
                : "linear-gradient(155deg, rgba(255, 255, 255, 0.7) 0%, rgba(238, 252, 250, 0.52) 45%, rgba(206, 245, 241, 0.46) 100%)"};
            backdrop-filter: blur(18px) saturate(165%);
            -webkit-backdrop-filter: blur(18px) saturate(165%);
            border: 1px solid ${d ? "rgba(127, 245, 234, 0.18)" : "rgba(255, 255, 255, 0.8)"};
            box-shadow:
                0 24px 46px -22px ${d ? "rgba(0, 0, 0, 0.7)" : "rgba(4, 78, 92, 0.5)"},
                0 2px 6px ${d ? "rgba(0, 0, 0, 0.25)" : "rgba(4, 78, 92, 0.08)"},
                inset 0 1px 0 ${d ? "rgba(160, 250, 240, 0.16)" : "rgba(255, 255, 255, 0.95)"},
                inset 0 -16px 30px -20px ${d ? "rgba(111, 227, 218, 0.22)" : "rgba(14, 140, 150, 0.35)"};
        `;
    }}
`;

/* ── 겉 ─────────────────────────────────────────────────────────────── */
/** 유리 — 예전 이름. 이제 바다유리(seaGlass)로 그린다: soft=물 위의 판, solid=떠 있는 창 */
export const glass = (strength: "soft" | "solid" = "soft") => seaGlass(strength === "solid" ? "float" : "panel");

/** 물빛 — 바닥에 어른거리는 빛 그물(caustics)을 멈춘 그림으로. three.js 효과가 없을 때도 바다로 읽히게 */
export const caustics = (alpha = 0.16) => css`
    background-image:
        radial-gradient(ellipse 22% 14% at 18% 22%, ${(p) => withAlpha(dark(p.theme) ? p.theme.colors.primary : "#FFFFFF", alpha * 1.6)}, transparent 70%),
        radial-gradient(ellipse 18% 12% at 64% 14%, ${(p) => withAlpha(dark(p.theme) ? p.theme.colors.primary : "#FFFFFF", alpha * 1.2)}, transparent 70%),
        radial-gradient(ellipse 26% 16% at 82% 58%, ${(p) => withAlpha(p.theme.colors.accent, alpha)}, transparent 72%),
        radial-gradient(ellipse 20% 13% at 34% 74%, ${(p) => withAlpha(p.theme.colors.accent, alpha * 0.9)}, transparent 70%),
        radial-gradient(ellipse 60% 40% at 50% 120%, ${(p) => withAlpha(p.theme.colors.primary, alpha * 0.6)}, transparent 70%);
`;

/** 물결선 — 가로 나눔선 대신 (Celestial 의 금빛 실선, Maple 의 먹 덩굴과 다르게) */
const wavePath = (color: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='8' viewBox='0 0 40 8'><path d='M0 4 Q5 0 10 4 T20 4 T30 4 T40 4' fill='none' stroke='${color}' stroke-width='1.2' stroke-linecap='round'/></svg>`,
    )}")`;
export const waveRule = (alpha = 0.5) => css`
    height: 8px;
    border: none;
    background: ${(p) => wavePath(withAlpha(p.theme.colors.primary, alpha))} repeat-x center / 40px 8px;
`;
/** 물결선을 밑줄로 (탭·제목 아래) */
export const waveUnderline = (alpha = 0.7) => css`
    background-image: ${(p) => wavePath(withAlpha(p.theme.colors.primary, alpha))};
    background-repeat: repeat-x;
    background-position: 0 100%;
    background-size: 20px 5px;
`;

/** 진주 — 점·표식 자리 (마름모·잎 대신) */
export const pearl = (size = "8px", color?: string) => css`
    width: ${size};
    height: ${size};
    border-radius: 50%;
    flex: none;
    background:
        radial-gradient(circle at 32% 30%, #FFFFFF 0 18%, transparent 42%),
        ${(p) => color ?? p.theme.colors.primary};
    box-shadow: 0 1px 2px ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
`;

/** 조개 — 머리글·빈 자리 장식. 가리비 실루엣을 마스크로 */
const SHELL = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21c-1.2 0-2.2-.6-2.7-1.6L3.2 9.6C2.4 8 3.5 6 5.3 5.6 7.3 3.2 9.6 2 12 2s4.7 1.2 6.7 3.6c1.8.4 2.9 2.4 2.1 4L14.7 19.4c-.5 1-1.5 1.6-2.7 1.6Z'/></svg>",
)}")`;
export const shell = (size = "14px", color?: string) => css`
    width: ${size};
    height: ${size};
    flex: none;
    background-color: ${(p) => color ?? p.theme.colors.primary};
    -webkit-mask: ${SHELL} center / contain no-repeat;
    mask: ${SHELL} center / contain no-repeat;
`;

/* ── 조작부 ─────────────────────────────────────────────────────────── */
/** 단추 — 바다 유리 알약. 누르면 살짝 가라앉고, 올리면 물빛이 한 번 스친다 */
export const seaButton = (variant: "default" | "primary" | "danger" | "ghost" = "default") => css`
    position: relative;
    overflow: hidden;
    border-radius: ${R.pill};
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.02em;
    transition: transform 0.18s ease, box-shadow 0.25s ease, background-color 0.25s ease;
    ${(p) => {
        const c = p.theme.colors;
        if (variant === "primary") return css`
            color: ${dark(p.theme) ? c.background : "#FFFFFF"};
            border: 1px solid transparent;
            background: linear-gradient(135deg, ${c.primary}, ${c.accent});
            box-shadow: 0 6px 16px ${withAlpha(c.primary, 0.32)}, inset 0 1px 0 rgba(255, 255, 255, 0.35);
        `;
        if (variant === "danger") return css`
            color: #FFFFFF;
            border: 1px solid transparent;
            background: linear-gradient(135deg, ${c.error}, ${withAlpha(c.error, 0.78)});
            box-shadow: 0 6px 14px ${withAlpha(c.error, 0.28)};
        `;
        if (variant === "ghost") return css`
            color: ${c.primary};
            border: 1px solid transparent;
            background: transparent;
        `;
        return css`
            color: ${c.primary};
            border: 1px solid ${withAlpha(c.primary, 0.28)};
            background: ${dark(p.theme) ? withAlpha(c.primary, 0.08) : "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(226,246,245,0.95))"};
            box-shadow: 0 3px 10px ${withAlpha(c.primary, 0.12)};
        `;
    }}

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%) no-repeat;
        background-size: 60% 100%;
        background-position: -160% 0;
    }
    &:hover:not(:disabled) { transform: translateY(-1px); }
    &:hover:not(:disabled)::after { animation: ${sheen} 0.9s ease; }
    &:active:not(:disabled) { transform: translateY(1px) scale(0.98); }
    &:disabled { opacity: 0.45; cursor: default; }
    &::after { ${calm} }
`;

/** 입력칸 — 조용한 물웅덩이: 둥글고 안쪽으로 살짝 고인 그림자, 누르면 물결 테두리 */
export const tideInput = css`
    border-radius: 14px;
    border: 1px solid ${(p) => withAlpha(p.theme.colors.primary, 0.22)};
    background-color: ${(p) => (dark(p.theme) ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.78)")};
    box-shadow: inset 0 2px 5px ${(p) => withAlpha(p.theme.colors.primary, dark(p.theme) ? 0.25 : 0.08)};
    transition: border-color 0.2s ease, box-shadow 0.25s ease;
    &:focus, &:focus-within {
        outline: none;
        border-color: ${(p) => p.theme.colors.primary};
        box-shadow: inset 0 2px 5px ${(p) => withAlpha(p.theme.colors.primary, 0.08)}, 0 0 0 4px ${(p) => withAlpha(p.theme.colors.accent, 0.3)};
    }
`;

/** 체크칸 — 물방울. 끝내면 아래에서 물이 차오른다 */
export const bubbleCheck = (done: boolean, size = "18px") => css`
    position: relative;
    width: ${size};
    height: ${size};
    flex: none;
    border-radius: 50%;
    border: 1.5px solid ${(p) => p.theme.colors.primary};
    background:
        radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.95) 0 14%, transparent 34%),
        linear-gradient(0deg, ${(p) => withAlpha(p.theme.colors.accent, 0.95)} 0 50%, ${(p) => withAlpha(p.theme.colors.primary, 0.9)} 50% 100%) no-repeat;
    background-size: 100% 100%, 100% ${done ? "200%" : "0%"};
    background-position: 0 0, 0 100%;
    transition: background-size 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    color: ${(p) => (done ? (dark(p.theme) ? p.theme.colors.background : "#FFFFFF") : "transparent")};
    svg { opacity: 0; }
`;

/** 스위치(label > input + .slider) — 물길 속을 미끄러지는 진주 */
export const pearlToggle = css`
    .slider {
        border-radius: ${R.pill};
        background: ${(p) => (dark(p.theme) ? "rgba(255, 255, 255, 0.08)" : withAlpha(p.theme.colors.primary, 0.14))};
        box-shadow: inset 0 2px 4px ${(p) => withAlpha(p.theme.colors.primary, 0.18)};
    }
    .slider::before {
        background: radial-gradient(circle at 35% 30%, #FFFFFF 0 25%, #E9F4F2 60%, #CFE3E1 100%);
        box-shadow: 0 2px 5px ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
    }
    input:checked + .slider {
        background: linear-gradient(90deg, ${(p) => p.theme.colors.primary}, ${(p) => p.theme.colors.accent});
    }
`;

/** 작은 고르개(칩) — 바다 유리 조각. 고르면 물빛이 찬다 */
export const seaChip = (active: boolean, color?: string) => css`
    border-radius: ${R.pill};
    border: 1px solid ${(p) => withAlpha(color ?? p.theme.colors.primary, active ? 0.7 : 0.25)};
    background-color: ${(p) => withAlpha(color ?? p.theme.colors.accent, active ? 0.28 : 0.06)};
    color: ${(p) => (active ? p.theme.colors.text : p.theme.colors.textSecondary)};
    transition: background-color 0.2s ease, border-color 0.2s ease;
`;

/** 오늘 — 물결 고리 (동심원 둘이 천천히 번진다) */
export const rippleMark = (size = "30px") => css`
    position: absolute;
    width: ${size};
    height: ${size};
    border-radius: 50%;
    pointer-events: none;
    border: 1.5px solid ${(p) => withAlpha(p.theme.colors.primary, 0.75)};
    &::before, &::after {
        content: "";
        position: absolute;
        inset: -1.5px;
        border-radius: 50%;
        border: 1px solid ${(p) => withAlpha(p.theme.colors.primary, 0.5)};
        animation: ${ripple} 3.6s ease-out infinite;
    }
    &::after { animation-delay: 1.8s; }
    &::before, &::after { ${calm} }
`;

/** 수위 — 진행 막대 대신 물이 찬 높이 (가로) */
export const waterLevel = (ratio: number) => css`
    position: relative;
    overflow: hidden;
    border-radius: ${R.pill};
    background: ${(p) => withAlpha(p.theme.colors.primary, 0.1)};
    &::before {
        content: "";
        position: absolute;
        inset: 0;
        width: ${Math.max(0, Math.min(1, ratio)) * 100}%;
        background: linear-gradient(90deg, ${(p) => p.theme.colors.accent}, ${(p) => p.theme.colors.primary});
        border-radius: inherit;
        transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
`;
