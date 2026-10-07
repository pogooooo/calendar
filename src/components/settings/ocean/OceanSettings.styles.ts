/**
 * 바다의 설정 조작부 — 뼈대는 Celestial 과 같으므로 통째로 가져오고 달라지는 것만 덮어쓴다.
 * 단추는 바다유리 알약, 입력칸은 둥근 물웅덩이, 줄 사이는 물결, 알림은 물방울 알약.
 * (Celestial: 금빛 실선 칸과 사각 단추, Maple: 먹선 칸과 도장)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSettings.styles";
import { withAlpha } from "@/styles/color";
import { R, seaButton, tideInput, waveUnderline } from "@/styles/ocean/water";

export * from "../celestial/CelestialSettings.styles";

/** 정보 줄 — 실선 대신 옅은 물결 밑줄 */
export const InfoRow = styled(C.InfoRow)`
    border-bottom: none;
    ${waveUnderline(0.22)}
    background-size: 18px 5px;
    padding: 12px 0;
    &:last-child { background-image: none; }
`;

export const InfoValue = styled(C.InfoValue)`
    font-family: ${(p) => p.theme.fonts.body};
`;

export const FormLabel = styled(C.FormLabel)`
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.04em;
`;

export const FormInput = styled(C.FormInput)`
    ${tideInput}
    padding: 10px 14px;
`;

export const FormButton = styled(C.FormButton)`
    ${(p) => seaButton(p.$variant === "primary" ? "primary" : p.$variant === "danger" ? "danger" : "default")}
    padding: 9px 20px;
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    &:hover:not(:disabled) { background-color: transparent; }
`;

export const StatusMessage = styled(C.StatusMessage)`
    border-left: none;
    border-radius: ${R.pill};
    padding: 8px 14px;
    color: ${(p) => (p.$type === "success" ? p.theme.colors.success : p.theme.colors.error)};
    background: ${(p) => withAlpha(p.$type === "success" ? p.theme.colors.success : p.theme.colors.error, 0.1)};
`;
