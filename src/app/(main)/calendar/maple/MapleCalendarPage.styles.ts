/**
 * Maple 의 달력 틀 — 일간 기록을 먼저 놓는 별도 JSX 배치에 공통 조작 스타일을 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선·마름모·빛무리 대신: 종이 탭으로 갈아 끼우는 두 화면, 먹 하이라인 나눔선에 잎 손잡이,
 * 떠 있는 + 단추는 도장, 접은 판의 별은 잎.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCalendarPage.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafBullet, paperTab, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialCalendarPage.styles";

/** 폰의 월간 ↔ 주간·일간: 종이 탭 두 장 */
export const ViewSwitch = styled(C.ViewSwitch)`
    border-color: ${(p) => hair(p.theme, 0.4)};
`;

export const SwitchButton = styled(C.SwitchButton)`
    ${(p) => paperTab(p.$on)}
    padding: 12px 0;
    letter-spacing: 0.12em;
    border-right: 1px solid ${(p) => hair(p.theme, 0.25)};
    background: ${(p) => (p.$on ? withAlpha(p.theme.colors.accent, 0.2) : "transparent")};

    &:last-child { border-right: none; }
    &::after { left: 8%; right: 8%; bottom: 2px; }
    &:active { background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.3)}; }
`;

/** 떠 있는 + : 네모 도장 */
export const Fab = styled(C.Fab)`
    ${stampButton("primary", { square: true })}
    /* 도장 조각이 거는 relative 가 떠 있는 자리를 덮지 않게 (안 그러면 + 가 달력 칸 위 흐름 속으로 들어간다) */
    position: fixed;
    width: 52px;
    height: 52px;
    color: ${(p) => p.theme.colors.background};
    box-shadow: none;
    background-image: none;
`;

/** 접은 판의 세로 이름표: 별 → 잎 */
export const CollapsedRail = styled(C.CollapsedRail)`
    .star {
        ${leafBullet(true, "9px")}
        display: block;
        font-size: 0;
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

/** 접기 단추: 먹 하이라인, 빛무리 없음 */
export const ToggleButton = styled(C.ToggleButton)`
    @media(min-width:1251px) { left:auto; right:-28px; }
    svg { transform: scaleX(-1); }
    border-color: ${(p) => hair(p.theme, 0.4)};
    border-radius: 2px;

    &:hover {
        border-color: ${(p) => hair(p.theme, 0.8)};
        color: ${(p) => p.theme.colors.primary};
        box-shadow: none;
        background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.18)};
    }
`;

export const DaySection = styled(C.DaySection)`
    border-left: none;
    border-right: 1px solid ${(p) => (p.$collapsed ? hair(p.theme, 0.35) : "transparent")};

    @media (max-width: 1250px) {
        border-right: none;
    }
`;

/** 나눔선: 먹 하이라인에 잎 손잡이 (윤곽 → 짚으면 채운 잎), 빛무리 없음 */
export const Resizer = styled(C.Resizer)`
    /* 선만 옅게 — opacity 로 하면 잎 손잡이까지 바래므로 색에 섞는다 */
    background-color: ${(p) => `color-mix(in srgb, ${p.theme.line ?? p.theme.colors.primary} 55%, transparent)`};

    .line { box-shadow: none; background: ${(p) => p.theme.line ?? p.theme.colors.primary}; }

    .grip {
        width: 13px;
        height: 13px;
        margin: -6.5px 0 0 -6.5px;
        ${leafBullet(false, "13px")}
        color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p) => p.theme.colors.background};
    }

    &:hover .grip {
        ${leafBullet(true, "13px")}
        background-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p) => p.theme.colors.background};
    }
`;
