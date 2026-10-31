/**
 * ThemePicker 의 오브제 자리 — 모양은 갈래마다의 설정 짜임(L)이 맡고, 여기에는 오브제 칸이 설 자리만 있다(갈래와 상관없이).
 * 오브제는 축소판 그림이나 글자를 덮지 않는다: 타일은 아래 줄 오른쪽 끝, 무대는 이름 줄 오른쪽.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

/**
 * 진열장 감싸개 — 타일 아래 줄에 오브제가 서므로 타일을 조금 넓힌다(대문자 이름 CELESTIAL 도 잘리지 않게).
 * 갈래마다의 짜임 파일은 그대로 두고 여기서 덮는다. 폰의 옆으로 미는 띠는 그대로다(타일 오브제를 빼므로).
 */
export const GalleryFit = styled.div`
    & > [role="radiogroup"] { grid-template-columns: repeat(auto-fill, minmax(188px, 1fr)); }
    ${MOBILE} {
        && > [role="radiogroup"] {
            display:grid; grid-auto-flow:row; grid-template-columns:repeat(2,minmax(0,1fr));
            grid-auto-columns:auto; gap:10px; overflow:visible; padding:0;
        }
        [data-theme-tile] > :first-child { height:60px; }
    }
`;

/** 타일 아래 줄 오른쪽 끝의 작은 오브제 — 줄 높이를 거의 늘리지 않게 위아래로 조금 걸친다. 폰의 좁은 타일에서는 빼고 무대에만 */
export const TileObjet = styled.span`
    flex: none;
    width: 32px;
    height: 32px;
    margin: -8px -3px -8px 0;
    pointer-events: none;

    ${MOBILE} { display: none; }
`;

/** 무대의 이름 줄 — 이름은 왼쪽, 그 갈래의 오브제는 오른쪽 */
export const StageHead = styled.div`
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
`;

export const StageObjet = styled.span`
    flex: none;
    width: 84px;
    height: 84px;
    margin: -12px -4px -14px 0;
    pointer-events: none;

    ${MOBILE} { width: 64px; height: 64px; margin: -8px -2px -10px 0; }
`;

/** Celestial 의 타로 한 장 — 금 선화. 자리(타일·무대)를 가득 채우되 카드 비율(24:34)은 지킨다 */
export const Arcana = styled.svg`
    display: block;
    width: 100%;
    height: 100%;
    color: ${(p) => p.theme.colors.primary};
    stroke: currentColor;
    stroke-width: 1.1;
    .inner { opacity: 0.55; }
    .star { fill: currentColor; stroke: none; }
`;
