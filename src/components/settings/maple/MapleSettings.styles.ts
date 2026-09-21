/**
 * Maple 의 설정 조작부 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 단추는 도장, 입력칸은 먹선 칸, 줄은 먹 하이라인.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSettings.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkInput, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialSettings.styles";

export const InfoRow = styled(C.InfoRow)`
    border-color: ${(p) => hair(p.theme, 0.25)};
`;

export const FormInput = styled(C.FormInput)`
    ${inkInput}
`;

export const FormButton = styled(C.FormButton)`
    ${(p) => stampButton(p.$variant === "primary" ? "primary" : p.$variant === "danger" ? "danger" : "default")}
    font-size: 0.8rem;
    letter-spacing: 0.06em;

    &:hover:not(:disabled) {
        background: ${(p) => p.$variant === "primary"
            ? `color-mix(in srgb, ${p.theme.colors.primary} 86%, #000)`
            : p.$variant === "danger" ? p.theme.colors.error
            : withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.14 : 0.2)};
    }
`;

export const StatusMessage = styled(C.StatusMessage)`
    border-radius: 2px;
`;
