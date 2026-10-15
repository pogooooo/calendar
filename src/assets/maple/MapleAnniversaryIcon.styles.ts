/**
 * MapleAnniversaryIcon 의 모양 — lucide 선 아이콘 하나를 감싸는 칸. 크기는 받은 값 그대로 못 박는다
 * (감싸는 쪽의 `svg { width: 100% }` 같은 규칙에 끌려 커지지 않게).
 */
import styled from "styled-components";

export const Glyph = styled.span<{ $size: number }>`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    color: inherit;

    && svg {
        display: block;
        width: ${(p) => p.$size}px;
        height: ${(p) => p.$size}px;
    }
`;
