/**
 * Maple 의 위젯 틀 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 앱의 카드 한 장: 둥근 모서리 16px, 옅은 선 하나. 손잡이는 작은 벡터 단풍잎, 머리 줄은 바탕 없이 단추 셋(올리면 옅게 칠해지고
 * 닫기만 붉게), 설정은 알약 칩·옅은 선. 위젯 화면은 바탕색을 통째로 지우므로 잎의 색은 inkFill 로 칠한다.
 * 2026-10-15 다시 그리며 먹 하이라인·잎 윤곽 보석을 걷었다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetShell.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkChip, stampButton, watercolorLeaf } from "@/styles/maple/ink";

export * from "../celestial/CelestialWidgetShell.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const line = (p: { theme: { mode: string; colors: { text: string } } }) => hair(p.theme, dark(p) ? 0.14 : 0.1);

export const Shell = styled(C.Shell)`
    --widget-pad: 12px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.12)};
    border-radius: 16px;
`;
export const BackgroundSurface = styled(Shell)`${C.backdropLayer}`;

/** 유리 모드의 광택 — 아주 옅은 흰 막 한 겹 */
export const GlossOverlay = styled(C.GlossOverlay)`
    background: rgba(255, 255, 255, 0.05);
    box-shadow: none;
`;

export const TopBar = styled(C.TopBar)`
    gap: 6px;
    padding: 5px 6px 5px 12px;
    background: none;
    opacity: 0.55;
`;

/**
 * 손잡이 — 수채 단풍잎 하나. 위젯의 단풍 표식이다(판 위에는 또렷한 잎을 두지 않으므로 — MapleWidgetDecor).
 * 올리면 바람에 살짝 돌며 커진다. 위젯 화면은 바탕색을 지우지만 그림(background-image)은 남는다
 */
export const Gem = styled(C.Gem)`
    ${watercolorLeaf("red", "16px")}
    border: none;
    transform: none;
    box-shadow: none;
    opacity: 1;
    rotate: -16deg;
    transition: rotate 0.35s ease, scale 0.2s ease;

    &:hover {
        border: none;
        box-shadow: none;
        background: url("/themes/maple/leaf-red.webp") center / contain no-repeat;
        rotate: 8deg;
        scale: 1.12;
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
        background: ${(p) => (p.$danger ? p.theme.colors.error : hair(p.theme, dark(p) ? 0.1 : 0.07))};
    }
`;

/** 설정 판 — 불투명한 카드색, 위는 옅은 선 */
export const SettingsPanel = styled(C.SettingsPanel)`
    gap: 2px;
    padding: 12px;
    border-top: 1px solid ${line};
`;

export const PanelLabel = styled(C.PanelLabel)`
    margin: 10px 0 6px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0;
    opacity: 0.7;
`;

export const ModeRow = styled(C.ModeRow)`
    gap: 6px;
`;

export const ModeChip = styled(C.ModeChip)`
    ${(p) => inkChip(p.$active)}
    padding: 4px 10px;
    font-size: 0.72rem;
    font-weight: ${(p) => (p.$active ? 600 : 500)};
    letter-spacing: 0;
    opacity: 1;
`;

export const Slider = styled(C.Slider)`
    height: 18px;
`;

export const PanelDivider = styled(C.PanelDivider)`
    margin: 12px 0 8px;
    background: ${line};
`;

export const ToggleLabel = styled(C.ToggleLabel)`
    font-size: 0.74rem;
    letter-spacing: 0;
    opacity: 1;
`;

/** 켬/끔 — 작은 알약 */
export const ToggleSwitch = styled(C.ToggleSwitch)`
    ${(p) => inkChip(p.$on)}
    min-width: 42px;
    padding: 3px 8px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0;
    opacity: 1;
`;

export const ColorPicker = styled(C.ColorPicker)`
    width: 34px;
    height: 26px;
    padding: 2px;
    border: 1px solid ${line};
    border-radius: 6px;
`;

export const ColorHex = styled(C.ColorHex)`
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    opacity: 0.8;
`;

/** 다 됐다 — 아래에 붙은 카드 단추 (마름모·잎 없음) */
export const PanelDone = styled(C.PanelDone)`
    ${stampButton("default", { square: true })}
    margin-top: auto;
    padding: 0;
    height: 32px;
    font-family: inherit;
    font-size: 0.78rem;
    letter-spacing: 0;
    opacity: 1;

    &::before { display: none; }
`;
