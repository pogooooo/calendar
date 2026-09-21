/**
 * Maple 의 창 틀 — 종이 한 장 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 테두리 대신 먹 하이라인 두 겹(색인 카드의 괘선). 폰에서는 위에서 내려오는 시트라 위쪽 먹선만.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialBaseModal.styles";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/CelestialBaseModal.styles";

export const Overlay = styled(C.Overlay)`
    background-color: ${(p) => withAlpha(p.theme.mode === "dark" ? "#000000" : "#3B2A20", p.theme.mode === "dark" ? 0.6 : 0.35)};
`;

export const Container = styled(C.Container)`
    border-color: ${(p) => hair(p.theme, 0.5)};
    border-radius: 2px;
    box-shadow: 0 0 0 4px ${(p) => p.theme.colors.surface}, 0 0 0 5px ${(p) => hair(p.theme, 0.16)}, 0 18px 40px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.55 : 0.25)};

    @media (max-width: 768px) {
        border-radius: 0;
        border-top-color: ${(p) => hair(p.theme, 0.5)};
        box-shadow: 0 -8px 24px ${withAlpha("#000000", 0.35)};
    }
`;
