/**
 * Maple 의 달력 틀 — 일간을 먼저(왼쪽) 놓는 별도 JSX 배치에 공통 조작 스타일을 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림 ("가을 노트"): 종이 위에 두 판 — 왼쪽 그날의 카드들, 오른쪽 달력 카드.
 * 금빛 실선·마름모·빛무리, 예전의 먹 하이라인·잎 손잡이 대신 옅은 나눔선과 둥근 손잡이 하나.
 * 폰의 월간 ↔ 주간·일간은 밑줄 탭 둘(바다는 미끄러지는 분절 단추), 떠 있는 + 는 붉은 둥근 네모.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCalendarPage.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, paperTab, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialCalendarPage.styles";

/** 폰의 월간 ↔ 주간·일간: 밑줄 탭 둘, 아래로 옅은 선 하나 */
export const ViewSwitch = styled(C.ViewSwitch)`
    border: none;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.1)};
`;

export const SwitchButton = styled(C.SwitchButton)`
    ${(p) => paperTab(p.$on)}
    padding: 11px 0 10px;
    border-right: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    letter-spacing: 0;
    background: transparent;

    /* 밑줄은 탭 가운데에 짧게, 아래 선 위에 얹는다 */
    &::after { left: 22%; right: 22%; bottom: -1px; }

    &:active { background-color: ${(p) => hair(p.theme, 0.04)}; }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.3)};
        border-radius: 8px;
    }
`;

/**
 * 갈아 끼우는 두 화면 — 몸짓은 갈래의 꼴(종이 한 장을 밀어 넣듯, styles/maple/motion.ts)로 calendar/page 가 그린다.
 * 뼈대의 CSS 몸짓은 끝난 뒤에도 transform 을 남겨, 안의 fixed 층(거르개의 바탕 막)이 이 판에 갇혔다
 */
export const MobilePane = styled(C.MobilePane)`
    animation: none;
`;

/** 떠 있는 + : 단풍 붉음으로 채운 둥근 네모 */
export const Fab = styled(C.Fab)`
    ${stampButton("primary", { square: true })}
    /* 단추 조각이 거는 relative 가 떠 있는 자리를 덮지 않게 (안 그러면 + 가 달력 칸 위 흐름 속으로 들어간다) */
    position: fixed;
    width: 54px;
    height: 54px;
    border-radius: 18px;
    background-image: none;
    box-shadow: 0 2px 4px ${(p) => withAlpha(p.theme.colors.primary, 0.25)},
                0 12px 24px -10px ${(p) => withAlpha(p.theme.colors.primary, 0.7)};

    &:hover { box-shadow: 0 2px 4px ${(p) => withAlpha(p.theme.colors.primary, 0.3)}, 0 14px 28px -10px ${(p) => withAlpha(p.theme.colors.primary, 0.75)}; }
    &:active { transform: scale(0.94); }
`;

/** 접은 판의 세로 이름표: 별 → 작은 단풍잎 */
export const CollapsedRail = styled(C.CollapsedRail)`
    gap: 10px;

    .label {
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.3em;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .star {
        ${crest("11px")}
        font-size: 0;
        opacity: 1;
        color: ${(p) => p.theme.colors.primary};
    }
`;

/** 일간 접기 단추: 두 판 사이에 놓인 작은 둥근 네모 (빛무리 없음) */
export const ToggleButton = styled(C.ToggleButton)`
    ${stampButton("default", { square: true })}
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    color: ${(p) => p.theme.colors.textSecondary};

    /* 펼치면 두 판 사이 틈에(머리 줄 높이에 맞춰), 접으면 접힌 띠 안 위쪽에 — 틈이 좁아져 옆 달력 위로 넘어가지 않게 */
    @media (min-width: 1251px) {
        left: auto;
        right: ${(p) => (p.$collapsed ? "4px" : "-33px")};
        top: ${(p) => (p.$collapsed ? "0" : "7px")};
    }

    /* 일간이 왼쪽이라 꺾쇠의 뜻이 반대 — 펼친 판은 왼쪽으로 접힌다 */
    svg { transform: scaleX(-1); }

    &:hover { color: ${(p) => p.theme.colors.text}; }
`;

export const DaySection = styled(C.DaySection)`
    border-left: none;
    border-right: 1px solid ${(p) => (p.$collapsed ? hair(p.theme, 0.1) : "transparent")};

    @media (max-width: 1250px) {
        border-right: none;
    }
`;

/** 두 판 사이의 나눔선: 옅은 머리카락 선에 둥근 손잡이 하나 — 짚으면 붉어진다 */
export const Resizer = styled(C.Resizer)`
    background-color: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.1 : 0.08)};

    .line { display: none; }

    .grip {
        width: 6px;
        height: 36px;
        margin: -18px 0 0 -3px;
        border: none;
        border-radius: 3px;
        transform: none;
        background-color: ${(p) => hair(p.theme, 0.2)};
        box-shadow: 0 0 0 3px ${(p) => p.theme.colors.background};
        transition: background-color 0.15s ease, height 0.2s ease, margin 0.2s ease;
    }

    &:hover .grip {
        height: 48px;
        margin-top: -24px;
        background-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p) => p.theme.colors.background};
    }
`;
