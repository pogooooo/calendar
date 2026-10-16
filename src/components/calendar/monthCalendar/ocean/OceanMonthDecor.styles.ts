/**
 * OceanMonthDecor 의 모양 — 오늘 칸의 물(물때), 달을 넘길 때의 물마루 빛(장면), 고른 날의 물결 한 번.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/* ── 물때 ── */
/** 물결 한 마루의 폭·물낯 띠의 높이(px) — 그림 한 장이 한 마루라 옆으로 이어 깔면 끊김이 없다 */
const CREST_W = 56;
const CREST_H = 8;
const CREST = "M0 4C7 1.2 21 1.2 28 4S49 6.8 56 4";
const svg = (body: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${CREST_W}' height='${CREST_H}' viewBox='0 0 ${CREST_W} ${CREST_H}'>${body}</svg>`)}")`;
/** 물낯 아래를 채운 모양(마스크) — 물결 띠 한 장과 그 아래를 채우는 판 */
const WAVE_MASK = `${svg(`<path d='${CREST}V${CREST_H}H0Z' fill='#000'/>`)} 0 0 / ${CREST_W}px ${CREST_H}px repeat-x, linear-gradient(#000, #000) 0 ${CREST_H - 1}px / 100% 100% no-repeat`;
/** 물낯의 빛줄 — 물결 마루를 따라 그은 가는 선 */
const shine = (color: string) => svg(`<path d='${CREST}' fill='none' stroke='${color}' stroke-width='1.3' stroke-linecap='round'/>`);

/** 물결이 옆으로 흐른다 — 물낯 무늬(마스크)와 빛줄(배경)을 한 몸짓으로 옮겨 서로 어긋나지 않는다 */
const flow = keyframes`
    from { -webkit-mask-position: 0 0, 0 ${CREST_H - 1}px; mask-position: 0 0, 0 ${CREST_H - 1}px; background-position: 0 0, 0 0; }
    to   { -webkit-mask-position: ${CREST_W}px 0, 0 ${CREST_H - 1}px; mask-position: ${CREST_W}px 0, 0 ${CREST_H - 1}px; background-position: ${CREST_W}px 0, 0 0; }
`;
const flowBack = keyframes`
    from { -webkit-mask-position: 22px 0, 0 ${CREST_H - 1}px; mask-position: 22px 0, 0 ${CREST_H - 1}px; }
    to   { -webkit-mask-position: ${22 - CREST_W}px 0, 0 ${CREST_H - 1}px; mask-position: ${22 - CREST_W}px 0, 0 ${CREST_H - 1}px; }
`;
/** 물이 처음 차오른다 — 칸이 그려질 때 한 번 */
const fill = keyframes`
    from { transform: translateY(100%); }
`;

/**
 * 오늘 칸의 물 — 칸 안쪽(유리 판과 같은 둥근 네모)에 하루가 흐른 만큼(--tide, 0~1) 물이 차 있다.
 * 앞 물결은 짙고 빛줄이 얹히며, 뒤 물결은 옅게 반대쪽으로 흐른다('풍성하게'에서만 — 위젯 창·움직임 끔은 멈춘 물결).
 * 글 뒤에 깔린다(z 0, 날짜 줄 z 2·막대 z 1 보다 아래). 숫자 줄까지는 차오르지 않는다(물때 위 끝 0.76).
 */
export const Tide = styled.span`
    position: absolute;
    inset: 3px;
    z-index: 0;
    border-radius: 10px;
    overflow: hidden;
    pointer-events: none;

    i {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: block;
        -webkit-mask: ${WAVE_MASK};
        mask: ${WAVE_MASK};
    }
    .back {
        height: calc(var(--tide) * 100% + ${CREST_H + 3}px);
        background: ${(p) => (dark(p) ? withAlpha(p.theme.colors.primary, 0.16) : withAlpha(p.theme.colors.accent, 0.2))};
        -webkit-mask-position: 22px 0, 0 ${CREST_H - 1}px;
        mask-position: 22px 0, 0 ${CREST_H - 1}px;
    }
    .front {
        height: calc(var(--tide) * 100% + ${CREST_H}px);
        background:
            ${(p) => shine(dark(p) ? "rgba(190,255,245,0.75)" : "rgba(255,255,255,0.95)")} 0 0 / ${CREST_W}px ${CREST_H}px repeat-x,
            /* 낮에는 맑은 물빛(얕은 쪽은 accent, 깊어질수록 primary) — primary 하나로 칠하면 흰 유리 위에서 탁한 잿빛으로 보였다 */
            linear-gradient(180deg,
                ${(p) => (dark(p) ? withAlpha(p.theme.colors.primary, 0.26) : withAlpha(p.theme.colors.accent, 0.36))},
                ${(p) => (dark(p) ? withAlpha(p.theme.colors.primary, 0.42) : withAlpha(p.theme.colors.primary, 0.3))});
    }

    :where(html:not([data-theme-motion="off"])) & i { animation: ${fill} 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
    :where(html[data-theme-motion="full"]) & .front { animation: ${fill} 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) both, ${flow} 3.4s linear infinite; }
    :where(html[data-theme-motion="full"]) & .back { animation: ${fill} 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) both, ${flowBack} 5.2s linear infinite; }
    [data-widget] & i { animation: none; }

    ${MOBILE} { ${NOT_WIDGET} & { inset: 2px; border-radius: 8px; } }
`;

/** 물마루 빛 — 오는 쪽 바깥에서 들어와 반대쪽으로 빠져나간다 */
const sweepNext = keyframes`
    0%   { transform: translateX(110%) skewX(-10deg); opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateX(-140%) skewX(-10deg); opacity: 0; }
`;
const sweepPrev = keyframes`
    0%   { transform: translateX(-140%) skewX(10deg); opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateX(110%) skewX(10deg); opacity: 0; }
`;

export const Crest = styled.span`
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 34%;
    z-index: 4;
    pointer-events: none;
    opacity: 0;
    background: linear-gradient(90deg,
        transparent 0%,
        ${(p) => (dark(p) ? "rgba(140, 240, 225, 0.05)" : "rgba(255, 255, 255, 0.12)")} 30%,
        ${(p) => (dark(p) ? "rgba(170, 255, 240, 0.2)" : "rgba(255, 255, 255, 0.55)")} 50%,
        ${(p) => (dark(p) ? "rgba(140, 240, 225, 0.05)" : "rgba(255, 255, 255, 0.12)")} 70%,
        transparent 100%);
    mix-blend-mode: ${(p) => (dark(p) ? "screen" : "soft-light")};

    :where(html:not([data-theme-motion="off"])) &[data-dir="next"] { animation: ${sweepNext} 1.05s cubic-bezier(0.45, 0.05, 0.4, 1) both; }
    :where(html:not([data-theme-motion="off"])) &[data-dir="prev"] { animation: ${sweepPrev} 1.05s cubic-bezier(0.45, 0.05, 0.4, 1) both; }
    [data-widget] & { display: none; }
`;

const splash = keyframes`
    0%   { transform: scale(0.15); opacity: 0.85; }
    100% { transform: scale(1.5); opacity: 0; }
`;

/** 고른 날 — 칸 가운데서 물결 한 번 */
export const Splash = styled.span`
    position: absolute;
    left: 50%;
    top: 50%;
    width: 70px;
    height: 70px;
    margin: -35px 0 0 -35px;
    z-index: 0;
    border-radius: 50%;
    border: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)};
    box-shadow: 0 0 18px ${(p) => withAlpha(p.theme.colors.primary, 0.25)} inset;
    pointer-events: none;
    opacity: 0;
    :where(html:not([data-theme-motion="off"])) & { animation: ${splash} 0.9s cubic-bezier(0.15, 0.6, 0.3, 1) both; }
    [data-widget] & { display: none; }
`;

