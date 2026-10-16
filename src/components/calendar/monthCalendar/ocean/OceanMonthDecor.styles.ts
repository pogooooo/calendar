/**
 * OceanMonthDecor 의 모양 — 오늘 칸으로 내려오는 햇살(판), 물마루 빛(장면), 오늘 숫자의 물결과 물방울, 고른 날의 물결 한 번.
 * 오늘 숫자 알약의 가운데는 칸 왼쪽 위에서 (17px, 17px) 쯤이다(OceanMonthCalendar.styles 의 .day-number).
 */
import styled, { css, keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
/** 끝없이 움직이는 것 — 움직임 '풍성하게'에서만, 위젯 창(투명 창은 깜빡인다)·움직임 끔에서는 멈춘다 */
const live = (rules: ReturnType<typeof css>) => css`
    :where(html[data-theme-motion="full"]) & { ${rules} }
    [data-widget] & { animation: none; }
`;

/* ── 햇살 ── */
const netIn = keyframes`
    from { opacity: 0; }
`;
/** 빛 그물이 물살에 천천히 밀려 갔다 돌아온다 — 두 겹이 서로 엇갈려 일렁인다 */
const drift = keyframes`
    from { transform: translate(-14px, -22px); }
    to   { transform: translate(16px, 26px); }
`;
const driftLate = keyframes`
    from { transform: translate(18px, 10px) scale(1.12); }
    to   { transform: translate(-12px, -30px) scale(1.12); }
`;
/** 햇살 속 티끌 — 천천히 가라앉으며 반짝였다 사라진다 */
const mote = keyframes`
    0%   { transform: translate(0, 0); opacity: 0; }
    18%  { opacity: 0.95; }
    55%  { opacity: 0.45; }
    75%  { opacity: 0.9; }
    100% { transform: translate(9px, 150px); opacity: 0; }
`;

/**
 * 오늘 칸의 세로줄로 내려오는 햇살 — 판(요일 줄+격자)의 위에서 오늘 칸까지 내려와 닿고, 그 아래로는 옅어진다(--land).
 * 가장자리는 무르게. 칸 뒤에 깔린다(판의 첫 자식, z-index 0) — 숫자·막대를 덮지 않는다.
 * --col·--row·--rows·--net 은 OceanMonthDecor 의 Board 가 준다.
 */
export const Beam = styled.div`
    --land: calc((var(--row) + 1) / var(--rows) * 100%);
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--col) * 100% / 7);
    width: calc(100% / 7);
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    /* 판 위 가장자리에서 무르게 들어와(물낯) 오늘 칸을 지나며 옅어진다 */
    -webkit-mask-image:
        linear-gradient(90deg, transparent, #000 26%, #000 74%, transparent),
        linear-gradient(180deg, rgba(0, 0, 0, 0.35), #000 34px, #000 calc(var(--land) - 7%), transparent calc(var(--land) + 8%));
    -webkit-mask-composite: source-in;
    mask-image:
        linear-gradient(90deg, transparent, #000 26%, #000 74%, transparent),
        linear-gradient(180deg, rgba(0, 0, 0, 0.35), #000 34px, #000 calc(var(--land) - 7%), transparent calc(var(--land) + 8%));
    mask-composite: intersect;

    i, b { position: absolute; display: block; }

    /* 빛줄기 — 위가 가장 밝고(물낯을 지난 자리) 내려올수록 옅어진다. 낮에는 금빛 햇살(흰빛은 맑은 유리 위에서 묻혔다), 밤에는 물빛 달빛 */
    .shaft {
        inset: 0;
        background:
            radial-gradient(60% 90px at 50% 0, ${(p) => (dark(p) ? "rgba(170, 250, 238, 0.2)" : "rgba(255, 246, 210, 0.75)")}, transparent),
            linear-gradient(180deg,
                ${(p) => (dark(p) ? "rgba(150, 236, 224, 0.17)" : "rgba(255, 236, 178, 0.34)")} 0%,
                ${(p) => (dark(p) ? "rgba(150, 236, 224, 0.1)" : "rgba(255, 238, 190, 0.22)")} 55%,
                ${(p) => (dark(p) ? "rgba(150, 236, 224, 0.07)" : "rgba(255, 240, 200, 0.16)")} 100%);
    }

    /* 빛 그물 — 앱의 물과 같은 식으로 그린 한 장(Board 의 --net). 두 겹이 엇갈려 일렁인다('풍성하게'에서만) */
    .net {
        left: -45%;
        right: -45%;
        top: -60px;
        bottom: -60px;
        background: var(--net) center / cover no-repeat;
        opacity: ${(p) => (dark(p) ? 0.5 : 0.7)};
        animation: ${netIn} 0.9s ease both;
    }
    .net.late { opacity: ${(p) => (dark(p) ? 0.28 : 0.45)}; transform: translate(18px, 10px) scale(1.12); }
    :where(html[data-theme-motion="full"]) & .net { animation: ${netIn} 0.9s ease both, ${drift} 13s ease-in-out infinite alternate; }
    :where(html[data-theme-motion="full"]) & .net.late { animation: ${netIn} 0.9s ease both, ${driftLate} 17s ease-in-out -6s infinite alternate; }
    [data-widget] & .net { animation: none; }

    /* 티끌 — 위쪽에서 천천히 가라앉는다('풍성하게'에서만, 그 밖에는 없다) */
    .mote {
        left: 34%;
        top: 6%;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: ${(p) => (dark(p) ? "rgba(200, 255, 246, 0.9)" : "#FFFFFF")};
        box-shadow: 0 0 4px ${(p) => (dark(p) ? "rgba(160, 255, 240, 0.7)" : "rgba(255, 252, 230, 0.95)")}, 0 0 0 0.5px ${(p) => (dark(p) ? "transparent" : withAlpha(p.theme.colors.primary, 0.22))};
        opacity: 0;
    }
    .mote.m2 { left: 58%; top: 14%; width: 2px; height: 2px; }
    .mote.m3 { left: 46%; top: 2%; }
    .mote.m4 { left: 66%; top: 26%; width: 2px; height: 2px; }
    .mote.m5 { left: 28%; top: 34%; width: 2px; height: 2px; }
    ${live(css`
        .mote { animation: ${mote} 9.5s linear infinite; }
        .mote.m2 { animation-duration: 12s; animation-delay: -4s; }
        .mote.m3 { animation-duration: 10.5s; animation-delay: -7.5s; }
        .mote.m4 { animation-duration: 13s; animation-delay: -2s; }
        .mote.m5 { animation-duration: 11s; animation-delay: -9s; }
    `)}
    [data-widget] & .mote { display: none; }
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

const ripple = keyframes`
    0%   { transform: scale(0.9); opacity: 0.75; }
    70%  { opacity: 0; }
    100% { transform: scale(2.6); opacity: 0; }
`;
const rise = keyframes`
    0%   { transform: translate(0, 0) scale(0.4); opacity: 0; }
    15%  { opacity: 0.95; }
    60%  { transform: translate(3px, -13px) scale(1); opacity: 0.8; }
    100% { transform: translate(-1px, -26px) scale(1.1); opacity: 0; }
`;

/** 오늘 숫자 둘레 — 물결 둘(엇갈려)과 숫자 옆에서 피어오르는 물방울 셋 */
export const Today = styled.span`
    position: absolute;
    left: 17px;
    top: 17px;
    width: 0;
    height: 0;
    z-index: 1;
    pointer-events: none;

    .ripple {
        position: absolute;
        left: -14px;
        top: -14px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1.5px solid ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.6 : 0.5)};
        opacity: 0;
        ${live(css`animation: ${ripple} 4.6s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;`)}
    }
    .ripple.late { ${live(css`animation-delay: 2.3s;`)} }

    .bubble {
        position: absolute;
        left: 12px;
        top: -2px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        border: 1px solid ${(p) => withAlpha(p.theme.colors.primary, 0.7)};
        background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0 25%, ${(p) => withAlpha(p.theme.colors.primary, 0.15)} 60%);
        opacity: 0;
        ${live(css`animation: ${rise} 5.4s ease-out infinite;`)}
    }
    .bubble.b2 { left: 16px; width: 4px; height: 4px; ${live(css`animation-delay: 1.7s; animation-duration: 6.1s;`)} }
    .bubble.b3 { left: 10px; width: 3px; height: 3px; ${live(css`animation-delay: 3.4s; animation-duration: 4.9s;`)} }

    ${MOBILE} { ${NOT_WIDGET} & { left: 12px; top: 13px; .ripple { left: -11px; top: -11px; width: 22px; height: 22px; } .bubble { display: none; } } }
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
