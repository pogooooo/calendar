/**
 * Maple 의 오른쪽 단추 메뉴 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 떠 있는 카드 한 장 — 둥근 모서리, 옅은 선, 부드러운 그림자. 단추는 둥근 칸, 지우기는 붉은 글씨.
 */
import styled from "styled-components";
import * as C from "../celestial/TodoContextMenu.styles";
import { withAlpha } from "@/styles/color";
import { hair, paperCard } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/TodoContextMenu.styles";

export const FloatingContextMenu = styled(C.FloatingContextMenu)`
    ${paperCard()}
    /* 조각이 거는 relative 뒤에 다시 적는다 — 이 창은 떠 있어야 한다 */
    position: fixed;
    gap: 2px;
    padding: 4px;
    border-radius: 12px;
    box-shadow: ${(p) => (p.theme.mode === "dark"
        ? "0 2px 6px rgba(0, 0, 0, 0.35), 0 16px 36px -14px rgba(0, 0, 0, 0.7)"
        : "0 2px 6px rgba(86, 54, 32, 0.06), 0 16px 36px -14px rgba(86, 54, 32, 0.3)")};

    button {
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 500;

        &:hover { background-color: ${(p) => hair(p.theme, 0.06)}; }

        &.danger:hover { background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)}; }
    }

    .divider { background-color: ${(p) => hair(p.theme, 0.12)}; }

    ${MOBILE} {
        padding: 4px;
        border-radius: 14px;

        button {
            border-radius: 10px;
            font-size: 0.9375rem;

            &:active { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.1)}; }
        }
    }
`;
