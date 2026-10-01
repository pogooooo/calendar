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
/**
 * 화면 가장자리의 시스템 막대 높이 — 위는 상태 표시줄(시계), 아래는 제스처 줄·단추 막대.
 * 안드로이드 앱은 네이티브(MainActivity.fitSystemEdges)가 --native-inset-* 로 정확한 값을 넣는다.
 * 웹뷰 140 미만은 env(safe-area-inset-*) 이 0 이거나 틀린 값을 주기 때문이다. 브라우저에서는 env() 를 쓴다.
 */
export const SAFE_T = `var(--native-inset-top, env(safe-area-inset-top, 0px))`;
export const SAFE_B = `var(--native-inset-bottom, env(safe-area-inset-bottom, 0px))`;
