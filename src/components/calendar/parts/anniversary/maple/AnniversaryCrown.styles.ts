/**
 * Maple 의 기념일 관(달력 칸의 숫자 둘레) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 빛나는 금빛 고리·구슬·별 대신 먹으로 그은 고리 하나와 그 위에 앉은 잎.
 */
import styled from "styled-components";
import * as C from "../celestial/AnniversaryCrown.styles";
import { leafBullet } from "@/styles/maple/ink";

export * from "../celestial/AnniversaryCrown.styles";

export const Root = styled(C.Root)`
    color: ${(p) => p.theme.colors.text};
    &:hover svg { filter: none; }
    .ring { animation: none !important; stroke-dashoffset: 0 !important; }
    &:hover .sweep { display: none; }
`;

export const Ring = styled(C.Ring)`
    .ring { stroke-width: 1; opacity: 0.8; }
    .ring2 { opacity: 0.3; }
    .jewel, .bead, .sweep { display: none; }

    /* 고리 꼭대기의 잎 */
    &::after {
        content: "";
        position: absolute;
        top: -5px;
        left: 50%;
        ${leafBullet(true, "10px")}
        margin-left: -5px;
        background-color: ${(p) => p.theme.colors.primary};
    }
`;
