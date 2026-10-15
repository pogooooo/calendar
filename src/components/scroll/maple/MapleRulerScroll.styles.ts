/**
 * Maple 의 눈금자 스크롤(시간표 오른쪽 레일) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 책갈피 리본 막대·명조 눈금 숫자 대신 가는 둥근 막대와 옅은 눈금. 일정이 있는 시각엔 카테고리 색 잎 하나.
 * 눈금 숫자는 시간표의 시각과 같은 말이라 걷었다(9px 글씨는 읽히지도 않았다).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialRulerScroll.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafChip } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialRulerScroll.styles";

export const Area = styled(C.Area)`
    &:focus-visible {
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.3)};
        outline-offset: -2px;
    }
`;

export const Tick = styled(C.Tick)`
    right: 9px;
    width: ${(p) => (p.$major ? 7 : 4)}px;
    opacity: 1;
    background-color: ${(p) => hair(p.theme, p.$major ? 0.22 : 0.12)};

    /* 폰의 레일은 13px — 눈금도 짧게 */
    ${MOBILE} {
        right: 4px;
        width: ${(p) => (p.$major ? 6 : 3)}px;
    }
`;

export const TickLabel = styled(C.TickLabel)`
    display: none;
`;

/** 일정이 있는 시각 — 카테고리 색 단풍잎 */
export const Mark = styled(C.Mark)`
    ${leafChip(5, "8px")}
    /* 잎 조각이 transform 을 지우므로 가운데 맞춤을 다시 건다 */
    transform: translateY(-50%);
    /* 눈금 자리에 앉아 그 눈금을 대신한다 (막대와 겹치지 않게) */
    right: 9px;
    clip-path: none;
    background-color: ${(p) => p.$color ?? p.theme.colors.primary};

    ${MOBILE} {
        right: 3px;
        width: 7px;
        height: 7px;
    }
`;

/** 막대 — 가는 둥근 막대, 짚으면 진해진다 */
export const Thumb = styled(C.Thumb)`
    right: 3px;
    width: 4px;
    min-height: 28px;
    border-radius: 4px;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)};
    transition: background-color 0.15s ease, width 0.15s ease, right 0.15s ease;

    &:hover, &:active {
        right: 2px;
        width: 6px;
        background-color: ${(p) => p.theme.colors.primary};
    }

    ${MOBILE} {
        right: 1px;
        width: 3px;
    }
`;

/** 지금 보고 있는 시각 — 둥근 알약 */
export const Flag = styled(C.Flag)`
    right: 14px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 600;
    color: ${(p) => (p.theme.mode === "dark" ? "#1A1512" : "#FFFFFF")};
    background-color: ${(p) => p.theme.colors.primary};
    box-shadow: 0 2px 6px -2px ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
`;
