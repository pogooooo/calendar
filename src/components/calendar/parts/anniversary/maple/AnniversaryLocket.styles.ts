/**
 * Maple 의 기념일 로켓(주간 달력 머리) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/AnniversaryLocket.styles";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/AnniversaryLocket.styles";

export const Root = styled(C.Root)`
    color: ${(p) => p.theme.colors.text};
    animation: none !important;
    svg, .chain, .locket { filter: none !important; animation: none !important; }
    &:hover svg { filter: none; }
`;

export const Plaque = styled(C.Plaque)`
    border-color: ${(p) => hair(p.theme, 0.4)};
    border-radius: 2px;
    background-color: ${(p) => p.theme.colors.surface};
`;
