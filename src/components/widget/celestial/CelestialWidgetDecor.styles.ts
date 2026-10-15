/**
 * CelestialWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤). 별은 옅게, 테는 금선 두 겹.
 * 큰 궤도와 해와 달은 앱의 바탕(CelestialAtmosphere)과 같은 자리 — 궤도는 오른쪽 위 모서리에 가운데를 두고, 해와 달은 아래에 걸친다.
 * 크기는 창의 짧은 변(vmin)에 맞춘다 — 위젯 창이 곧 위젯이라 어떤 크기에서도 같은 비율로 걸린다.
 * 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce) — 끝없이 도는 것은 없다.
 */
import styled, { keyframes } from "styled-components";
import { ornamentStrokes } from "@/components/ornament/celestial/CelestialOrnaments.styles";
import { cornerStars } from "@/styles/celestial/ornaments";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

/* 투명도는 건드리지 않는다 — 별마다 제 밝기(깊이)가 있어 한꺼번에 밝아지면 번쩍였다 */
const twinkleOnce = keyframes`
    0%   { transform: scale(1); }
    35%  { transform: scale(2.2); filter: brightness(1.6); }
    100% { transform: scale(1); }
`;
const swellOnce = keyframes`
    0%   { transform: scale(1); }
    40%  { transform: scale(1.45); }
    100% { transform: scale(1); }
`;
const turnOnce = keyframes`
    0%   { transform: rotate(0deg); }
    55%  { transform: rotate(-14deg); }
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
    .sky { inset: 0; width: 100%; height: 100%; opacity: ${(p) => (dark(p) ? 0.85 : 0.7)}; }
    .star, .moon { transform-box: fill-box; transform-origin: center; }

    /* 큰 천체 궤도 — 가운데가 오른쪽 위 모서리 16px 안쪽, 지름은 짧은 변의 1.1배 */
    .orrery {
        width: 110vmin;
        height: 110vmin;
        right: calc(-55vmin + 16px);
        top: calc(-55vmin + 16px);
        opacity: ${(p) => (dark(p) ? 0.24 : 0.2)};
    }
    .orrery .turn { transform-box: view-box; transform-origin: 320px 320px; }
    /* 아래의 해와 달 — 판 아래 끝에 반쯤 걸친다 */
    .halo {
        left: 22%;
        bottom: -38vmin;
        width: 76vmin;
        height: 76vmin;
        opacity: ${(p) => (dark(p) ? 0.1 : 0.08)};
    }
    /* 위상 줄 — 아래 테(판 끝에서 5px)에 구슬처럼 꿴다 */
    .phases { left: 50%; bottom: 2px; translate: -50% 0; opacity: ${(p) => (dark(p) ? 0.8 : 0.7)}; }

    /* 칸이 판을 채우는 위젯(달력·주간) — 큰 그림을 더 옅게, 해와 달은 걷는다 */
    &[data-busy] .orrery { opacity: ${(p) => (dark(p) ? 0.14 : 0.12)}; }
    &[data-busy] .halo { display: none; }

    /* 아주 작은 위젯에서는 해와 달이 내용과 다툰다 */
    @media (max-height: 180px) { .halo { display: none; } }
    @media (max-width: 160px) { .phases { display: none; } }

    /* 커서가 들어오면 한 번 — 별이 차례로 반짝이고, 위상 줄의 달이 차례로 부풀고, 궤도가 조금 돌았다 돌아온다 */
    &[data-glint] .star { animation: ${twinkleOnce} 1.2s ease-out both; }
    &[data-glint] .moon { animation: ${swellOnce} 0.9s ease-out both; }
    &[data-glint] .orrery .turn { animation: ${turnOnce} 1.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
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
