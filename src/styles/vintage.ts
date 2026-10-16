/**
 * 결이 다른 벌 '빈티지'(theme.variant === "vintage") — 짜임은 갈래 그대로 두고 재료만 오래 둔 종이·빛바랜 사진으로.
 * 지금은 Maple 에만 있다(theme.ts 의 maple-vintage). 갈래가 아니라 벌의 성질이라 화면 전체에 걸리는 것(효과 캔버스)도
 * 이것을 본다 — 갈래 이름으로 가르지 않는다(scripts/check-theme-styles.mjs).
 */
import { css } from "styled-components";

/** 빈티지 벌인가 */
export const vintage = (p: { theme: { variant?: string } }) => p.theme.variant === "vintage";

/** 그림(수채 잎·가지·지는 잎·효과)을 빛바랜 사진처럼 — 세피아로 누르고 채도·대비를 조금 낮춘다 */
export const AGED_TONE = "sepia(0.5) saturate(0.74) hue-rotate(-6deg) contrast(0.93) brightness(0.98)";

/** 그림 한 장(캔버스·잎 그림 칸)에 — 빈티지 벌에서만. 글이 든 상자에는 걸지 말 것(글도 바랜다) */
export const agedArt = css`
    ${(p: { theme: { variant?: string } }) => vintage(p) && css`filter: ${AGED_TONE};`}
`;
