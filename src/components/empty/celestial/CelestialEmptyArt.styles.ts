/**
 * CelestialEmptyArt 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 */
import styled, { css } from "styled-components";
import { ornamentStrokes } from "@/components/ornament/celestial/CelestialOrnaments.styles";
import type { EmptyArtKind } from "../EmptyArt";

export const Art = styled.svg<{ $kind: EmptyArtKind }>`
    display: block;
    flex: none;
    overflow: visible;
    pointer-events: none;
    color: ${(p) => p.theme.colors.primary};
    opacity: 0.8;
    ${ornamentStrokes}

    width: 132px;
    height: 88px;
    margin: 0 auto 6px;

    /* 홈의 할 일 목록 — 좁은 칸의 왼쪽에, 작게 */
    ${(p) => p.$kind === "todos" && css`
        width: 72px;
        height: 48px;
        margin: 4px 0 6px;
    `}

    /* 기념일 — 케이크 그림 위의 가는 위상 줄 */
    ${(p) => p.$kind === "anniversaries" && css`
        width: 160px;
        height: 24px;
        opacity: 0.9;
    `}
`;
