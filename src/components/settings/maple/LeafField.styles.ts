/**
 * LeafField 의 모양 — 설정 화면 바탕에 눌러 말린 잎 석 장(B2·B3·B4)이 옅게 놓인다.
 * 화면에 고정돼 글 뒤로 지나가며, 손가락·마우스는 통과한다.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

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
    }

    .a { right: -60px; top: 40px; width: 300px; transform: rotate(18deg); }
    .b { right: 190px; bottom: -70px; width: 220px; transform: rotate(-32deg); }
    .c { left: 44%; top: -90px; width: 200px; transform: rotate(140deg); }

    ${MOBILE} {
        .b, .c { display: none; }
        .a { right: -80px; top: auto; bottom: 40px; width: 220px; }
    }
`;
