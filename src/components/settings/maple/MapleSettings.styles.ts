/**
 * Maple 의 설정 조작부 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 단추는 알약(primary 는 단풍 붉음 채움), 입력칸은 둥근 칸, 줄은 옅은 선.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSettings.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkInput, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialSettings.styles";

export const InfoRow = styled(C.InfoRow)`
    padding: 12px 0;
    border-color: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.12 : 0.09)};
`;

export const InfoLabel = styled(C.InfoLabel)`
    font-size: 0.85rem;
`;

export const InfoValue = styled(C.InfoValue)`
    font-size: 0.9rem;
    font-weight: 500;
`;

export const FormLabel = styled(C.FormLabel)`
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0;
`;

export const FormInput = styled(C.FormInput)`
    ${inkInput}
`;

export const FormButton = styled(C.FormButton)`
    ${(p) => stampButton(p.$variant === "primary" ? "primary" : p.$variant === "danger" ? "danger" : "default")}
    padding: 8px 18px;
    font-family: inherit;
    font-size: 0.85rem;
    letter-spacing: 0;
`;

export const StatusMessage = styled(C.StatusMessage)`
    padding: 9px 12px;
    border-left: none;
    border-radius: 10px;
    font-size: 0.82rem;
    color: ${(p) => (p.$type === "success" ? p.theme.colors.success : p.theme.colors.error)};
    background-color: ${(p) => withAlpha(p.$type === "success" ? p.theme.colors.success : p.theme.colors.error, p.theme.mode === "dark" ? 0.16 : 0.1)};
`;
