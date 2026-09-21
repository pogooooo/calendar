/**
 * Maple 의 폰 탭바 — 종이 띠. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 마름모 대신 잎: 고른 탭 위에 붉은 잎 하나가 돋는다. 선은 먹 하이라인.
 */
import styled from "styled-components";
import { MOBILE_BREAKPOINT } from "@/styles/breakpoints";
import * as C from "../celestial/CelestialMobileTabBar.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, leafBullet } from "@/styles/maple/ink";

export * from "../celestial/CelestialMobileTabBar.styles";

export const Bar = styled(C.Bar)`
    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        border-top-color: ${(p) => hair(p.theme, 0.4)};
    }
`;

export const Tab = styled(C.Tab)`
    span { font-family: ${(p) => p.theme.fonts.display}; }
    &:active { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.2)}; }

    &::before {
        ${leafBullet(true, "10px")}
        margin-left: -5px;
        top: 2px;
        background-color: ${(p) => p.theme.colors.primary};
        transform: scale(${(p) => (p.$on ? 1 : 0)});
    }
`;

export const SheetBody = styled(C.SheetBody)`
    border-top-color: ${(p) => hair(p.theme, 0.5)};
`;

export const SheetHead = styled(C.SheetHead)`
    letter-spacing: 0.08em;
    border-bottom-color: ${(p) => hair(p.theme, 0.25)};

    i {
        ${crest("13px")}
        border: none;
        transform: none;
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

export const SheetRow = styled(C.SheetRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.16)};
    &:active { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.2)}; }
`;
