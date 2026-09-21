/**
 * Maple 의 고른 날 목록 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDayPeek.styles";
import { hair, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialDayPeek.styles";

export const Head = styled(C.Head)`
    letter-spacing: 0.06em;
    font-size: 0.8rem;

    .hd {
        ${(p) => leafBullet(p.$today, "11px")}
        background-color: ${(p) => p.theme.colors.primary};
    }

    .hr { background: ${(p) => hair(p.theme, 0.3)}; }
`;

export const Row = styled(C.Row)`
    border-bottom-color: ${(p) => hair(p.theme, 0.16)};

    .mark {
        ${(p) => leafBullet(p.$done, "11px")}
        background-color: ${(p) => p.theme.colors.primary};
    }
`;
