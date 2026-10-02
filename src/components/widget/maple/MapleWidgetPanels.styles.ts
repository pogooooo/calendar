/**
 * Maple 의 위젯 속 내용 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 위젯 화면은 `& * { background-color: transparent }` 로 바탕색을 통째로 지운다.
 * 그래서 마스크에 색을 입힐 때는 background-color 가 아니라 같은 색의 그라데이션(inkFill)으로 칠한다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetPanels.styles";
import { inkCheckbox, inkFill, inkMask, leafChip, leafShapeOf } from "@/styles/maple/ink";

export * from "../celestial/CelestialWidgetPanels.styles";

/** 날짜 넘김: 먹 화살(J8) — 꺾쇠 글자는 숨긴다 */
export const NavBtn = styled(C.NavBtn)`
    width: 26px;
    border: none;
    font-size: 0;
    ${inkMask("ink-arrow-left.webp")}
    ${(p) => inkFill(p.theme.colors.primary)}

    &:last-of-type {
        ${inkMask("ink-arrow-right.webp")}
        ${(p) => inkFill(p.theme.colors.primary)}
    }
`;

/** 체크 칸: 손으로 그린 네모(J9)에 붉은 도장(C7) */
export const Box = styled(C.Box)`
    background-image: none;
    ${(p) => inkCheckbox(p.$done)}
`;

/** 카테고리 표식: 카테고리마다 다른 잎(J10) */
export const Mark = styled(C.Mark)`
    ${(p) => leafChip(leafShapeOf(p.$c), "9px")}
    ${(p) => inkFill(p.$c)}
`;

/** 주간 점: 일정 있는 날은 채운 잎, 오늘은 진하게 */
export const Dot = styled(C.Dot)`
    width: 10px;
    height: 10px;
    border: none;
    box-shadow: none;
    ${(p) => leafChip(p.$on ? 5 : 3, "10px")}
    ${(p) => inkFill(p.theme.colors.primary)}
    opacity: ${(p) => (p.$today || p.$on ? 1 : 0.5)};
`;

/** ✦ 자리: 잎 문장 */
export const Star = styled(C.Star)`
    font-size: 0;
    ${inkMask("crest.webp")}
    ${(p) => inkFill(p.theme.colors.primary)}
    width: 9px;
    height: 9px;
    display: inline-block;
`;
