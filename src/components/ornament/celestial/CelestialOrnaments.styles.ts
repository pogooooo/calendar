/**
 * Celestial 문양의 모양 — 선 굵기·점선·채움과, 궤도를 도는 행성의 움직임.
 * 큰 그림(사이드바 기둥·바탕)도 같은 이름(.line·.hair·.dash·.fill·.orbiter)을 쓰도록 ornamentStrokes 를 끼워 넣는다.
 */
import styled, { css, keyframes } from "styled-components";

const revolve = keyframes`
    from { offset-distance: var(--from, 0%); }
    to   { offset-distance: calc(var(--from, 0%) + 100%); }
`;

/** 선 문양의 공통 붓 — 넣는 곳의 color 를 따른다 */
export const ornamentStrokes = css`
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;

    .line { fill: none; stroke-width: 1; }
    .hair { fill: none; stroke-width: 0.6; stroke-opacity: 0.75; }
    .dash { stroke-dasharray: 2.2 3.2; }
    .fill { fill: currentColor; stroke: none; }
    .orbiter { offset-rotate: 0deg; }

    /* 행성은 천천히 돈다 — 움직임 '풍성하게' 에서만. 끝없이 도는 것이라 위젯 창·움직임 끔에서는 멈춘다 */
    @media (prefers-reduced-motion: no-preference) {
        html:not([data-theme-motion="off"]):not([data-theme-motion="gentle"]) & .orbiter {
            animation: ${revolve} var(--orbit, 60s) linear infinite;
        }
    }
    /* 위젯 창은 투명 창이라 끝없는 움직임이 창 전체를 다시 칠한다(깜빡임) */
    [data-widget] & .orbiter { animation: none; }
`;

export const Svg = styled.svg`
    display: block;
    flex: none;
    overflow: visible;
    pointer-events: none;
    ${ornamentStrokes}
`;

/** 끝에 점을 단 가로 괘선 */
export const Rule = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: inherit;

    .line { flex: 1 1 auto; height: 1px; min-width: 12px; background: currentColor; opacity: 0.55; }
    .end { flex: none; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
`;

export const RuleMid = styled.svg`
    flex: none;
    display: block;
    overflow: visible;
    ${ornamentStrokes}
`;
