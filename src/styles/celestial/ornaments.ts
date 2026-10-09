/**
 * Celestial 의 작은 표식 — 마름모(45° 돌린 네모) 대신 점·고리·네 갈래 별.
 * Celestial 은 비스듬한 선과 마름모를 쓰지 않는다(직선·달·별·혼천의). 글머리표·고른 표시·괘선 끝에 쓴다.
 * 모두 currentColor 를 따른다 — color 로 금빛·옅은 먹을 고른다.
 */
import { css, type DefaultTheme, type RuleSet } from "styled-components";

/**
 * Celestial 갈래에서만 거는 모양 — Maple·Ocean 은 Celestial 의 바탕 모양을 이어받아(styled(C.X)) 쓰므로,
 * Celestial 만 바꾸는 것(마름모 → 별·점)은 이걸로 감싸 그 둘에 새지 않게 한다.
 */
export const celestialOnly = <P extends object>(rules: RuleSet<P>) => (p: P & { theme: DefaultTheme }) =>
    p.theme.family === "celestial" ? rules : null;

const STAR4 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-1 -1 2 2'%3E%3Cpath d='M0 -1C.08 -.24 .24 -.08 1 0C.24 .08 .08 .24 0 1C-.08 .24 -.24 .08 -1 0C-.24 -.08 -.08 -.24 0 -1Z'/%3E%3C/svg%3E";
const STAR8 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-1 -1 2 2'%3E%3Cpath d='M0 -1L.065 -.157L.354 -.354L.157 -.065L1 0L.157 .065L.354 .354L.065 .157L0 1L-.065 .157L-.354 .354L-.157 .065L-1 0L-.157 -.065L-.354 -.354L-.065 -.157Z'/%3E%3C/svg%3E";
const CRESCENT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-1 -1 2 2'%3E%3Cpath d='M.42 -.9A1 1 0 1 0 .42 .9A.62 .62 0 1 1 .42 -.9Z'/%3E%3C/svg%3E";

const masked = (src: string, size: string) => css`
    width: ${size};
    height: ${size};
    background: currentColor;
    border: none;
    border-radius: 0;
    transform: none;
    -webkit-mask: url("${src}") center / contain no-repeat;
    mask: url("${src}") center / contain no-repeat;
`;

/** 네 갈래 별 */
export const star4Mark = (size: string) => masked(STAR4, size);
/** 여덟 갈래 별 */
export const star8Mark = (size: string) => masked(STAR8, size);
/** 초승달 */
export const crescentMark = (size: string) => masked(CRESCENT, size);

/** 찬 점(보름) */
export const dotMark = (size: string) => css`
    width: ${size};
    height: ${size};
    border: none;
    border-radius: 50%;
    background: currentColor;
    transform: none;
`;

/** 빈 고리(삭) — 안 끝난 것 */
export const ringMark = (size: string) => css`
    width: ${size};
    height: ${size};
    border: 1px solid currentColor;
    border-radius: 50%;
    background: transparent;
    transform: none;
`;
