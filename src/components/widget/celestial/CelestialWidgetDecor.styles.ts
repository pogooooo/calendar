/**
 * CelestialWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤). 별은 옅게, 테는 금선 두 겹.
 * 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce) — 끝없이 도는 것은 없다.
 */
import styled, { keyframes } from "styled-components";
import { ornamentStrokes } from "@/components/ornament/celestial/CelestialOrnaments.styles";
import { cornerStars } from "@/styles/celestial/ornaments";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

const twinkleOnce = keyframes`
    0%   { transform: scale(1); opacity: 1; }
    35%  { transform: scale(2.2); opacity: 1; filter: brightness(1.6); }
    100% { transform: scale(1); opacity: 1; }
`;
const swellOnce = keyframes`
    0%   { transform: scale(1); }
    40%  { transform: scale(1.45); }
    100% { transform: scale(1); }
`;
const turnOnce = keyframes`
    0%   { transform: rotate(0deg); }
    55%  { transform: rotate(-28deg); }
    100% { transform: rotate(0deg); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    color: ${(p) => p.theme.colors.primary};

    svg { ${ornamentStrokes} position: absolute; overflow: visible; }
    .sky { inset: 0; width: 100%; height: 100%; opacity: ${(p) => (dark(p) ? 0.62 : 0.5)}; }
    .star, .moon { transform-box: fill-box; transform-origin: center; }
    /* 위상 줄 — 아래 테(판 끝에서 5px)에 구슬처럼 꿴다 */
    .phases { left: 50%; bottom: 2px; translate: -50% 0; opacity: ${(p) => (dark(p) ? 0.8 : 0.7)}; }
    .seal { right: 12px; bottom: 14px; width: 54px; height: 54px; opacity: ${(p) => (dark(p) ? 0.34 : 0.28)}; }
    .turn { transform-box: view-box; transform-origin: 30px 30px; }

    /* 아주 작은 위젯에서는 혼천의가 내용과 다툰다 */
    @media (max-height: 180px), (max-width: 260px) { .seal { display: none; } }
    @media (max-width: 160px) { .phases { display: none; } }

    /* 커서가 들어오면 한 번 — 별이 차례로 반짝이고, 위상 줄의 달이 차례로 부풀고, 혼천의가 조금 돌았다 돌아온다 */
    &[data-glint] .star { animation: ${twinkleOnce} 1.2s ease-out both; }
    &[data-glint] .moon { animation: ${swellOnce} 0.9s ease-out both; }
    &[data-glint] .turn { animation: ${turnOnce} 1.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
`;

/**
 * 속테 — 판의 테(겉테) 안쪽 5px 에 금선, 그 안쪽 4px 에 더 옅은 금선 한 겹(두 겹 테). 네 갈래 별은 네 귀퉁이와
 * 양옆 가운데, 그리고 아래 테의 위상 줄 양끝 곁에 꿴다(★ ○○◐●◑○○ ★ — 좁은 위젯에서도 겹치지 않게 줄에 붙인다).
 * 양옆 테 안쪽에는 눈금 — 혼천의 고리의 도수처럼 가로 짧은 금이 고르게, 다섯째마다 길게. 모두 곧은 금(사선 없음).
 */
export const Frame = styled.span`
    position: absolute;
    inset: 5px;
    border: 1px solid ${(p) => p.theme.colors.primary}${(p) => (dark(p) ? "66" : "59")};
    outline: 1px solid ${(p) => p.theme.colors.primary}26;
    outline-offset: -5px;
    pointer-events: none;

    i { position: absolute; }
    ${cornerStars(9)}
    i:nth-child(5) { top: calc(50% - 4.5px); left: -4.5px; }
    i:nth-child(6) { top: calc(50% - 4.5px); right: -4.5px; }
    i:nth-child(7) { bottom: -4.5px; left: calc(50% - 68.5px); }
    i:nth-child(8) { bottom: -4.5px; left: calc(50% + 59.5px); }
    @media (max-width: 160px) { i:nth-child(7), i:nth-child(8) { display: none; } }
    /* 위젯 쪽 바탕색 지우기와 상관없이 칠해지게 — 그라데이션으로 */
    i { background-image: linear-gradient(currentColor, currentColor); opacity: 0.9; }

    &::before, &::after {
        content: "";
        position: absolute;
        top: 26px;
        bottom: 26px;
        width: 7px;
        color: ${(p) => p.theme.colors.primary};
        opacity: ${(p) => (dark(p) ? 0.5 : 0.42)};
        background:
            repeating-linear-gradient(180deg, currentColor 0 1px, transparent 1px 40px) 0 0 / 7px 100% no-repeat,
            repeating-linear-gradient(180deg, currentColor 0 1px, transparent 1px 8px) 0 0 / 4px 100% no-repeat;
    }
    &::before { left: 0; }
    &::after { right: 0; transform: scaleX(-1); }
`;
