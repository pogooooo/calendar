/**
 * Maple 의 주간 띠 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 날짜 칸은 종이 쪽지: 고른 날은 황토 물이 든 쪽지, 오늘은 숫자 뒤에 눌러 말린 잎(F3), 일정 점은 잎.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWeekStrip.styles";
import { withAlpha } from "@/styles/color";
import { ASSET, hair, leafBullet, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialWeekStrip.styles";

export const Strip = styled(C.Strip)`
    border-color: ${(p) => hair(p.theme, 0.35)};
`;

export const Head = styled(C.Head)`
    border-color: ${(p) => hair(p.theme, 0.35)};
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.04em;

    button { ${stampButton("ghost")} }
`;

export const Day = styled(C.Day)`
    border-radius: 2px;
    background: ${(p) => (p.$selected ? withAlpha(p.theme.colors.accent, 0.22) : "transparent")};
    border-color: ${(p) => (p.$selected ? hair(p.theme, 0.5) : "transparent")};

    .name { font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.66rem; }

    .num {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.1rem;
        border: none;
        ${(p) => p.$today && `
            color: ${p.theme.colors.primary};
            font-weight: 600;
            background: url("${ASSET}/today-marker.webp") center / 30px 30px no-repeat;
        `}
    }

    .dots i {
        ${leafBullet(true, "7px")}
        border-radius: 0;
    }

    &:active { background: ${(p) => withAlpha(p.theme.colors.accent, 0.3)}; }
`;
