/**
 * Maple 의 날짜·시간 고르기 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 고른 날은 마름모 틀이 아니라 붉은 잎 위의 흰 숫자, 오늘은 잎 한 장 밑줄, 기간은 황토 물.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDateTimePicker.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkInput, leafBullet, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialDateTimePicker.styles";

export const Trigger = styled(C.Trigger)`
    ${inkInput}
    border-color: ${(p) => (p.$open ? p.theme.colors.primary : hair(p.theme, 0.45))};

    svg { color: ${(p) => p.theme.colors.text}; opacity: 0.7; }
    &:hover { border-color: ${(p) => hair(p.theme, 0.8)}; }
    ${(p) => p.$open && css`box-shadow: none;`}
`;

export const Popover = styled(C.Popover)`
    ${paperCard("4px")}
    border-radius: 2px;
    border-color: ${(p) => hair(p.theme, 0.5)};
    box-shadow: 0 12px 30px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.5 : 0.18)};
`;

export const MonthNav = styled(C.MonthNav)`
    border-color: ${(p) => hair(p.theme, 0.3)};
    font-family: ${(p) => p.theme.fonts.display};

    button {
        ${stampButton("ghost")}
        color: ${(p) => p.theme.colors.text};
    }
`;

export const WeekHead = styled(C.WeekHead)`
    border-color: ${(p) => hair(p.theme, 0.3)};
    font-family: ${(p) => p.theme.fonts.numeral};
`;

/** 시작·종료 탭: 종이 탭 */
export const EdgeTabs = styled(C.EdgeTabs)`
    border-color: ${(p) => hair(p.theme, 0.35)};
    border-radius: 2px;

    button + button { border-left-color: ${(p) => hair(p.theme, 0.35)}; }

    button[data-on="1"] {
        background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.22)};
        color: ${(p) => p.theme.colors.primary};
        font-family: ${(p) => p.theme.fonts.display};
    }
`;

export const Day = styled(C.Day)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.86rem;

    ${(p) => (p.$inRange || p.$edgeStart || p.$edgeEnd) && css`
        &::before {
            top: 15%;
            height: 70%;
            background-color: ${withAlpha(p.theme.colors.accent, 0.22)};
        }
    `}

    ${(p) => p.$today && !p.$selected && css`
        span { text-decoration: none; }
        span::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: -6px;
            ${leafBullet(true, "7px")}
            margin-left: -3.5px;
            background-color: ${p.theme.colors.primary};
        }
    `}

    ${(p) => p.$selected && css`
        &::after {
            ${leafBullet(true, "30px")}
            margin: -15px 0 0 -15px;
            border: none;
            background-color: ${p.theme.colors.primary};
            transform: none;
            opacity: 0.9;
        }
        span { color: ${p.theme.colors.background}; font-weight: 600; }
    `}
`;

export const TimeArea = styled(C.TimeArea)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const TimeLabel = styled(C.TimeLabel)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.9rem;
`;

export const Foot = styled(C.Foot)`
    border-top-color: ${(p) => hair(p.theme, 0.3)};

    button { ${stampButton("default")} font-size: 0.74rem; }
    .ok { ${stampButton("primary")} font-size: 0.74rem; }
`;
