/**
 * Maple 의 기념일 표시(주간 달력 머리) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 매단 것이 다르다 — Celestial 은 사슬에 걸린 마름모 로켓이 빛나며 흔들리지만,
 * Maple 은 책갈피 삼아 끼운 종이 꼬리표다. 실 한 오라기에 아래를 제비추리로 자른 종이가 달리고,
 * 그림은 그 종이 위에 앉는다. 여럿이면 아래로 작은 쪽지가 더 달린다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/AnniversaryLocket.styles";
import { hair } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/AnniversaryLocket.styles";

export const Root = styled(C.Root)`
    color: ${(p) => p.theme.colors.text};
    animation: none !important;
    svg, .chain, .locket { filter: none !important; animation: none !important; }
    &:hover svg { filter: none; }

    /* 마름모 액자와 매듭 별, 타고 내리는 빛은 걷는다 — 실만 남긴다 */
    .art .ring,
    .art .jw,
    .art .spark { display: none; }

    .art .chain { stroke-width: 0.7; opacity: 0.75; }

    /* 하나뿐일 때 끝에 달리는 마름모, 여럿일 때의 쪽지: 빛 없이 먹으로 */
    .art .drop { stroke-width: 0.8; }
    .art .pip { stroke-width: 0.8; }
    .art .pip.on {
        fill: ${(p) => p.theme.colors.primary};
        filter: none;
    }

    /* 실에 매단 종이 꼬리표 */
    &::before {
        content: "";
        position: absolute;
        top: 6px;
        left: 50%;
        margin-left: -11px;
        width: 22px;
        height: 26px;
        box-sizing: border-box;
        background-color: ${(p) => p.theme.colors.surface};
        border: 1px solid ${(p) => hair(p.theme, 0.55)};
        border-radius: 1px;
        transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    /* 실이 지나는 구멍 */
    &::after {
        content: "";
        position: absolute;
        top: 9px;
        left: 50%;
        margin-left: -2.5px;
        width: 5px;
        height: 5px;
        box-sizing: border-box;
        border: 1px solid ${(p) => hair(p.theme, 0.5)};
        border-radius: 50%;
    }

    /* 그림은 꼬리표의 아래쪽 — 구멍 밑에 */
    .ic {
        top: 17px;
        color: ${(p) => p.theme.colors.text};
    }

    &:hover::before {
        border-color: ${(p) => hair(p.theme, 0.85)};
        background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.35)};
    }

    /* 오늘이 기념일이면 꼬리표에 물이 들고 글씨가 붉어진다 — 숨쉬는 빛 대신 */
    ${(p) => p.$today && css`
        &::before {
            background-color: ${withAlpha(p.theme.colors.accent, 0.55)};
            border-color: ${p.theme.colors.primary};
        }
        .ic { color: ${p.theme.colors.primary}; }
        .art .chain { opacity: 1; }
    `}
`;

export const Plaque = styled(C.Plaque)`
    border-color: ${(p) => hair(p.theme, 0.4)};
    border-radius: 2px;
    background-color: ${(p) => p.theme.colors.surface};
`;
