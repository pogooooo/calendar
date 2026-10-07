/**
 * 바다의 기념일 표시(주간 달력 요일 머리) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 사슬에 매달려 흔들리는 마름모 로켓(Celestial), 실에 매단 종이 꼬리표(Maple) 대신
 * 요일 옆에 놓인 작은 산호빛 네모 하나 — 안에 그 기념일의 아이콘. 흔들리거나 빛나지 않는다.
 * 올리면 이름표가 떠 있는 판으로 나타난다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/AnniversaryLocket.styles";
import { MONO, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/AnniversaryLocket.styles";

export const Root = styled(C.Root)`
    top: 4px;
    right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    color: ${(p) => p.theme.colors.weekend};
    background-color: ${(p) => withAlpha(p.theme.colors.weekend, p.theme.mode === "dark" ? 0.18 : 0.12)};
    animation: none !important;
    transition: background-color 0.15s ease;

    .art { display: none; }
    .ic {
        top: 4px;
        left: 4px;
        margin: 0;
        animation: none !important;
        filter: none !important;
    }

    ${(p) => p.$today && css`
        color: ${p.theme.mode === "dark" ? "#06110F" : "#FFFFFF"};
        background-color: ${p.theme.colors.weekend};
    `}

    &:hover {
        filter: none;
        animation: none !important;
        background-color: ${(p) => withAlpha(p.theme.colors.weekend, p.theme.mode === "dark" ? 0.28 : 0.2)};
        .ic { transform: none; filter: none; }
    }
`;

/** 이름표 — 떠 있는 작은 판 */
export const Plaque = styled(C.Plaque)`
    top: 26px;
    right: -2px;
    width: 120px;
    padding: 4px 8px;
    ${surface("float")}
    border-radius: 8px;
    font-size: 0.66rem;
    color: ${(p) => p.theme.colors.text};
    transform: translateY(-3px);

    .idx { font-family: ${MONO}; font-size: 0.56rem; }
`;
