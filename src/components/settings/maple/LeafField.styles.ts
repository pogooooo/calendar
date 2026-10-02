/**
 * LeafField 의 모양 — 설정 화면 바탕에 눌러 말린 잎 넉 장(B2·B3·B4·B5)이 옅게 놓인다.
 * 화면에 고정돼 글 뒤로 지나가며, 손가락·마우스는 통과한다.
 */
import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
const sway = keyframes`0%,100% { translate:0 0; rotate:-1deg; } 50% { translate:3px -6px; rotate:1.5deg; }`;

export const Field = styled.div`
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    img {
        position: absolute;
        opacity: ${(p) => (p.theme.mode === "dark" ? 0.16 : 0.2)};
        filter: ${(p) => (p.theme.mode === "dark" ? "saturate(0.8)" : "none")};
        animation:${sway} 15s ease-in-out infinite;
        transform-origin:bottom center;
    }

    .a { right: -60px; top: 40px; width: 300px; transform: rotate(18deg); }
    .b { right: 190px; bottom: -70px; width: 220px; transform: rotate(-32deg); animation-delay:-5s; animation-duration:19s; }
    .c { left: 44%; top: -90px; width: 200px; transform: rotate(140deg); animation-delay:-11s; }
    .d { left: 240px; bottom: -60px; width: 170px; transform: rotate(-150deg); animation-delay:-7s; animation-duration:22s; }

    ${MOBILE} {
        .b, .c, .d { display: none; }
        .a { right: -80px; top: auto; bottom: 40px; width: 220px; }
    }
`;
