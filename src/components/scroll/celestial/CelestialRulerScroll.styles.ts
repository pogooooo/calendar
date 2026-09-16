/**
 * RulerScrollView 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const RAIL = 26;

export const RAIL_MOBILE = 13;

export const Stage = styled.div`
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
`;

export const Area = styled.div`
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding-right: ${RAIL}px;

    ${MOBILE} { padding-right: ${RAIL_MOBILE}px; }

    /* 네이티브 막대만 감춘다. 휠·터치 스크롤은 그대로다. */
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar { display: none; width: 0; height: 0; }

    &:focus-visible {
        outline: 1px solid ${(p) => p.theme.colors.primary};
        outline-offset: -1px;
    }
`;

export const Rail = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: ${RAIL}px;
    cursor: pointer;

    ${MOBILE} { width: ${RAIL_MOBILE}px; }
`;

export const Tick = styled.span<{ $at: number; $major: boolean }>`
    position: absolute;
    right: 8px;
    top: ${(p) => p.$at * 100}%;
    height: 1px;
    width: ${(p) => (p.$major ? 11 : 5)}px;
    opacity: ${(p) => (p.$major ? 1 : 0.55)};
    background-color: ${(p) => p.theme.colors.primary}73;
    pointer-events: none;

    /* 레일이 좁아진 만큼 눈금도 짧게 */
    ${MOBILE} {
        right: 4px;
        width: ${(p) => (p.$major ? 7 : 4)}px;
    }
`;

/** 폰에서는 레일에 글자가 들어갈 자리가 없다. */
export const TickLabel = styled.span<{ $at: number }>`
    position: absolute;
    right: 21px;
    top: ${(p) => p.$at * 100}%;
    transform: translateY(-50%);
    font-size: 0.56rem;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.colors.textSecondary};
    pointer-events: none;

    ${MOBILE} { display: none; }
`;

export const Mark = styled.span<{ $at: number; $color?: string }>`
    position: absolute;
    right: 2px;
    top: ${(p) => p.$at * 100}%;
    width: 5px;
    height: 5px;
    transform: translateY(-50%);
    background-color: ${(p) => p.$color ?? p.theme.colors.primary};
    clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
    pointer-events: none;
`;

export const Thumb = styled.div<{ $top: number; $height: number }>`
    position: absolute;
    right: 1px;
    width: 7px;
    top: ${(p) => p.$top * 100}%;
    height: ${(p) => p.$height * 100}%;
    min-height: 18px;
    background-color: ${(p) => p.theme.colors.primary};
    cursor: grab;
    touch-action: none;

    &:active { cursor: grabbing; }
`;

export const Flag = styled.span<{ $at: number }>`
    position: absolute;
    right: 12px;
    top: ${(p) => p.$at * 100}%;
    transform: translateY(-50%);
    padding: 2px 7px;
    font-size: 0.6rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: ${(p) => p.theme.colors.background};
    background-color: ${(p) => p.theme.colors.primary};
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;

    ${Stage}:hover & { opacity: 1; }

    ${MOBILE} { display: none; }
`;
