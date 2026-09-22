/**
 * Maple 의 위젯 틀 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 보석·빛무리 대신 잎과 먹 하이라인. 위젯 화면은 바탕색을 통째로 지우므로 색은 inkFill 로 칠한다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetShell.styles";
import { hair, inkFill, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialWidgetShell.styles";

/** 손잡이 줄의 보석 → 잎 (윤곽 → 켜지거나 짚으면 채운 잎), 빛무리 없음 */
export const Gem = styled(C.Gem)`
    width: 11px;
    height: 11px;
    border: none;
    box-shadow: none;
    ${(p) => leafBullet(!!p.$active, "11px")}
    ${(p) => inkFill(p.$danger ? p.theme.colors.error : p.theme.colors.primary)}

    &:hover {
        ${leafBullet(true, "11px")}
        ${(p) => inkFill(p.$danger ? p.theme.colors.error : p.theme.colors.primary)}
        box-shadow: none;
    }
`;

export const Rule = styled(C.Rule)`
    background: ${(p) => hair(p.theme, 0.35)};
`;

/** 설정 패널의 "다 됐다" 줄: 마름모 → 잎 */
export const PanelDone = styled(C.PanelDone)`
    border-top-color: ${(p) => hair(p.theme, 0.3)};

    &::before {
        border: none;
        transform: none;
        ${leafBullet(true, "9px")}
        ${(p) => inkFill(p.theme.colors.primary)}
    }
`;

export const PanelDivider = styled(C.PanelDivider)`
    background: ${(p) => hair(p.theme, 0.25)};
`;
