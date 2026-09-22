/**
 * Maple 의 업데이트 쪽지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 테두리와 빛무리 대신 종이 한 장(먹 하이라인 두 겹), 귀퉁이 사선 대신 덩굴 귀, 단추는 도장.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialUpdateNotice.styles";
import { withAlpha } from "@/styles/color";
import { inkMask, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialUpdateNotice.styles";

export const Panel = styled(C.Panel)`
    ${paperCard("4px")}
    /* 조각이 거는 relative 뒤에 다시 적는다 — 이 쪽지는 떠 있어야 한다 */
    position: fixed;
    box-shadow: 0 10px 26px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.5 : 0.18)};
`;

/** 귀퉁이의 금빛 사선 → 덩굴 귀(C3) */
export const Corner = styled(C.Corner)`
    width: 20px;
    height: 20px;
    background: ${(p) => p.theme.colors.text};
    ${inkMask("corner.webp")}
    opacity: 0.55;
`;

export const Label = styled(C.Label)`
    letter-spacing: 0.1em;
`;

export const Version = styled(C.Version)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 1.15rem;
    letter-spacing: 0.04em;
`;

export const PrimaryBtn = styled(C.PrimaryBtn)`
    ${stampButton("primary")}
`;

export const GhostBtn = styled(C.GhostBtn)`
    ${stampButton("ghost")}
`;

