/**
 * Maple 의 저장 실패 띠 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 떠 있는 카드 한 장(12px 모서리·얕은 그림자)에 오류색은 옅은 테와 아이콘에만. 글은 14px 본문 글꼴, 닫기는 동그란 글자 단추.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSaveFailureNotice.styles";
import { withAlpha } from "@/styles/color";
import { popCard, roundIcon } from "@/components/modal/baseModal/maple/mapleLayer";

export * from "../celestial/CelestialSaveFailureNotice.styles";

export const Bar = styled(C.Bar)`
    ${popCard("12px")}
    gap: 10px;
    padding: 8px 8px 8px 14px;
    border-color: ${(p) => withAlpha(p.theme.colors.error, 0.3)};
    font-family: ${(p) => p.theme.fonts.body};

    svg { width: 16px; height: 16px; }

    .msg {
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${(p) => p.theme.colors.text};

        b { font-weight: 700; color: ${(p) => p.theme.colors.error}; }
    }

    button {
        ${roundIcon("32px", "15px")}
        svg { color: ${(p) => p.theme.colors.textSecondary}; }
        &:hover:not(:disabled) svg { color: ${(p) => p.theme.colors.text}; }
    }
`;
