export const MOBILE_BREAKPOINT = 768;
export const TAB_BAR_HEIGHT = 58;

export const MOBILE = `@media (max-width: ${MOBILE_BREAKPOINT}px)`;
export const TOUCH = `@media (hover: none)`;

/**
 * 위젯 창이 아닐 때만. `${MOBILE} { ${NOT_WIDGET} & { … } }` 꼴로 쓴다.
 *
 * 위젯 창은 200~416px 이라 MOBILE 미디어 쿼리에 걸리지만, 마우스로 쓰는
 * 데스크톱이다. 폰 꾸밈(마름모·큰 손가락 단추)을 위젯에까지 주면 안 되는
 * 자리에서 이걸로 뺀다. :where 라서 세기(specificity)는 더하지 않는다.
 */
export const NOT_WIDGET = `:where(body:not(:has([data-widget])))`;
export const SAFE_B = `env(safe-area-inset-bottom, 0px)`;
