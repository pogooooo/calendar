/**
 * Maple 의 폰 탭바 — 카드색 띠. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 고른 탭은 그림 뒤에 단풍 붉음을 옅게 깐 알약이 선다(마름모·잎 표식 대신). 더보기 시트는 위가 둥근 카드.
 * 2026-10-15 다시 그리며 위를 찢은 종이 시트·명조 탭 이름을 걷었다 — 작은 명조 글씨가 흐렸다.
 */
import styled from "styled-components";
import { MOBILE_BREAKPOINT } from "@/styles/breakpoints";
import * as C from "../celestial/CelestialMobileTabBar.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair } from "@/styles/maple/ink";

export * from "../celestial/CelestialMobileTabBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Bar = styled(C.Bar)`
    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        background: ${(p) => p.theme.colors.surface};
        border-top: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.08)};
        box-shadow: 0 -6px 18px -12px ${(p) => withAlpha("#000000", dark(p) ? 0.6 : 0.18)};
    }
`;

export const Tab = styled(C.Tab)`
    gap: 4px;

    span {
        font-size: 0.68rem;
        font-weight: ${(p) => (p.$on ? 600 : 500)};
        letter-spacing: 0;
    }

    /* 그림 뒤의 알약 — 고른 탭에만 */
    svg {
        box-sizing: content-box;
        padding: 3px 14px;
        border-radius: 999px;
        background-color: ${(p) => (p.$on ? withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.12) : "transparent")};
        transition: background-color 0.18s ease;
    }

    &:active { background-color: ${(p) => hair(p.theme, 0.05)}; }
    &::before { display: none; }
`;

export const SheetBody = styled(C.SheetBody)`
    border-top: none;
    border-radius: 18px 18px 0 0;
    background: ${(p) => p.theme.colors.surface};
    box-shadow: 0 -10px 30px -12px ${(p) => withAlpha("#000000", dark(p) ? 0.6 : 0.22)};
`;

export const SheetHead = styled(C.SheetHead)`
    padding: 16px 18px 12px;
    border-bottom-color: ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.08)};
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};

    i {
        ${crest("13px")}
        border: none;
        transform: rotate(-12deg);
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const SheetRow = styled(C.SheetRow)`
    border-bottom-color: ${(p) => hair(p.theme, dark(p) ? 0.08 : 0.06)};
    font-weight: ${(p) => (p.$on ? 600 : 400)};

    &:active { background-color: ${(p) => hair(p.theme, 0.05)}; }
`;
