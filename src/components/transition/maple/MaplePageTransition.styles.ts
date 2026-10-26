/**
 * MaplePageTransition 의 모양 — 새 화면이 옅게 떠오르기만 한다(바람과 잎은 효과 무대와 바탕 장면이 맡는다).
 *
 * 움직이는 것은 투명도뿐 — 합성(compositor)에서 돌아서, 새 화면을 세우느라 본 스레드가 바쁜 동안에도 끊기지 않는다.
 * 본문에는 transform 을 걸지 않는다: transform 이 고정 단추(폰의 +)의 기준 상자를 바꿨다(BUGS.md).
 */
import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const drawEdge = keyframes`
    0% { opacity:0; scale:1 .1; }
    25% { opacity:.7; }
    100% { opacity:0; scale:1 1; }
`;

export const PageEdge = styled.span<{ $dir:1 | -1; $gentle:boolean }>`
    position:absolute; z-index:10; pointer-events:none;
    top:12px; bottom:12px; width:2px;
    ${(p) => p.$dir > 0 ? 'left:4px' : 'right:4px'};
    background:${(p) => p.theme.colors.primary}; opacity:0;
    transform-origin:top;
    :where(html[data-theme-motion="full"]) & { animation:${drawEdge} .48s ease-out; }
    ${(p) => p.$gentle && css`display:none;`}
`;

export const Stage = styled.div`
    position: relative;
    height: 100%;
`;

export const Body = styled.div<{ $enter: "full" | "gentle" | null }>`
    position: relative;
    height: 100%;

    ${(p) => p.$enter && css`
        :where(html:not([data-theme-motion="off"])) & {
            animation: ${fadeIn} ${p.$enter === "full" ? "0.36s" : "0.22s"} ease-out backwards;
        }
    `}
`;
