/**
 * Maple 의 챌린지 창 — 깨끗한 서식 카드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 고운바탕 굵은 제목 아래, 칸마다 위에 13px 이름(굵게, 옅은 글씨)과 inkInput 칸. 단추 줄은 취소(카드 단추) · 만들기(붉은 알약).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialChallengeModal.styles";
import { MOBILE } from "@/styles/breakpoints";
import { hair } from "@/styles/maple/ink";
import { field, titleType } from "../../baseModal/maple/mapleLayer";

export * from "../celestial/CelestialChallengeModal.styles";

export const ModalHeader = styled(C.ModalHeader)`
    ${titleType("1.25rem")}
    padding: 20px 24px 14px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.08)};

    ${MOBILE} { padding: 18px 20px 12px; }
`;

export const ModalBody = styled(C.ModalBody)`
    padding: 18px 24px 20px;

    ${MOBILE} { padding: 16px 20px 18px; }
`;

export const FormArea = styled(C.FormArea)`
    gap: 16px;

    .form-group-row { gap: 12px; }

    .form-group {
        gap: 6px;

        label {
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 0.8125rem;
            font-weight: 600;
            letter-spacing: 0;
            color: ${(p) => p.theme.colors.textSecondary};
        }

        input, textarea {
            ${field}
            height: 40px;
            padding: 0 12px;
            ${MOBILE} { height: 44px; font-size: max(16px, 1rem); }
        }
    }

    .form-actions {
        gap: 8px;
        margin-top: 6px;

        & > button { height: 42px; font-size: 0.9375rem; }
        ${MOBILE} { & > button { height: 48px; } }
    }
`;
