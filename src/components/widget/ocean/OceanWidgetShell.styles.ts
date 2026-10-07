/**
 * 바다의 위젯 틀 — 무채색 반투명 판, 모서리 20px, 테두리는 머리카락 선 하나.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 * 금빛 테두리·마름모 손잡이·검은 그라데이션 머리(Celestial), 잎·먹선(Maple) 대신:
 * 손잡이는 짧은 막대, 머리 줄은 바탕 없이 단추 셋(올리면 옅게 칠해지고 닫기만 산호빛), 설정은 칩·머리카락 선.
 * 위젯은 투명한 창이라 끝없는 움직임·빛무리는 두지 않는다 (가만히 둔 위젯은 다시 칠하지 않는다).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetShell.styles";
import { withAlpha } from "@/styles/color";
import { MONO, R, hairline, ink, seaButton, seaChip } from "@/styles/ocean/water";

export * from "../celestial/CelestialWidgetShell.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Shell = styled(C.Shell)`
    --widget-pad: 12px;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    border-radius: ${R.lg};
`;

/** 유리 모드의 광택 — 그라데이션 대신 아주 옅은 흰 막 한 겹 */
export const GlossOverlay = styled(C.GlossOverlay)`
    background: rgba(255, 255, 255, 0.05);
    box-shadow: none;
`;

export const TopBar = styled(C.TopBar)`
    gap: 6px;
    padding: 5px 6px 5px 12px;
    background: none;
    opacity: 0.55;
    transition: opacity 0.15s ease;
`;

/** 손잡이 — 마름모 대신 짧은 막대 */
export const Gem = styled(C.Gem)`
    width: 18px;
    height: 4px;
    border: none;
    border-radius: 2px;
    transform: none;
    opacity: 1;
    background: ${(p) => ink(p.theme, dark(p) ? 0.3 : 0.22)};
    box-shadow: none;
    transition: background-color 0.15s ease;

    &:hover {
        opacity: 1;
        border: none;
        box-shadow: none;
        background: ${(p) => p.theme.colors.primary};
    }
`;

/** 가운데 선은 없다 — 빈자리 */
export const Rule = styled(C.Rule)`
    background: none;
`;

export const BtnGroup = styled(C.BtnGroup)`
    gap: 2px;
`;

export const Control = styled(C.Control)`
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 8px;
    color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    background: ${(p) => (p.$active ? withAlpha(p.theme.colors.primary, 0.12) : "transparent")};
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
        color: ${(p) => (p.$danger ? "#FFFFFF" : p.theme.colors.text)};
        background: ${(p) => (p.$danger ? p.theme.colors.error : ink(p.theme, dark(p) ? 0.1 : 0.07))};
    }
`;

/** 설정 판 — 불투명한 면(테마의 원래 surface), 위는 머리카락 선 */
export const SettingsPanel = styled(C.SettingsPanel)`
    gap: 2px;
    padding: 12px;
    background: ${(p) => p.theme.baseColors?.surface ?? (dark(p) ? "#121B1C" : "#FFFFFF")};
    border-top: 1px solid ${(p) => hairline(p.theme)};
`;

export const PanelLabel = styled(C.PanelLabel)`
    margin: 10px 0 6px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0;
    opacity: 1;
`;

export const ModeRow = styled(C.ModeRow)`
    gap: 6px;
`;

export const ModeChip = styled(C.ModeChip)`
    ${(p) => seaChip(p.$active)}
    padding: 4px 10px;
    font-size: 0.72rem;
    font-weight: ${(p) => (p.$active ? 600 : 500)};
    letter-spacing: 0;
    opacity: 1;
`;

export const Slider = styled(C.Slider)`
    height: 18px;
    accent-color: ${(p) => p.theme.colors.primary};
`;

export const PanelDivider = styled(C.PanelDivider)`
    margin: 12px 0 8px;
    background: ${(p) => hairline(p.theme)};
`;

export const ToggleLabel = styled(C.ToggleLabel)`
    font-size: 0.74rem;
    letter-spacing: 0;
    opacity: 1;
`;

/** 켬/끔 — 작은 칩 */
export const ToggleSwitch = styled(C.ToggleSwitch)`
    ${(p) => seaChip(p.$on)}
    min-width: 42px;
    padding: 3px 8px;
    font-family: ${MONO};
    font-size: 0.64rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    opacity: 1;
`;

export const ColorPicker = styled(C.ColorPicker)`
    width: 34px;
    height: 26px;
    padding: 2px;
    border: 1px solid ${(p) => hairline(p.theme, true)};
    border-radius: 6px;
`;

export const ColorHex = styled(C.ColorHex)`
    font-family: ${MONO};
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    opacity: 1;
`;

/** 다 됐다 — 아래에 붙은 흰 단추 (마름모 없음) */
export const PanelDone = styled(C.PanelDone)`
    ${seaButton("default")}
    margin-top: auto;
    padding: 0;
    height: 32px;
    border-top: 1px solid ${(p) => hairline(p.theme, true)};
    font-size: 0.78rem;
    letter-spacing: 0;
    opacity: 1;

    &::before { display: none; }
`;
