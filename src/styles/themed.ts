"use client";

import { useTheme } from "styled-components";

/**
 * 테마 갈래를 고르는 자리.
 *
 * 화면은 갈래마다 제 구현을 갖는다 (`.../celestial/CelestialFoo.tsx`).
 * 예전에는 그 고르는 코드가 파일마다 제각각이었다 — 열일곱 곳은 테마 이름을
 * 구해 놓고 쓰지도 않은 채 언제나 Celestial 을 돌려줬고, 다섯 곳만 switch 를
 * 갖췄고, 한 곳은 if 의 양쪽 결과가 같았다. 그 상태로 테마를 하나 더 넣으면
 * 스물세 곳을 서로 다른 방식으로 고쳐야 한다.
 *
 * 이제 고르는 방법은 usePickTheme 하나다.
 *
 * ── 테마를 새로 넣을 때 ──────────────────────────────────────────────
 * 1. THEME_FAMILIES 에 갈래 이름을 더한다.
 * 2. styles/theme.ts 에 밝은 벌·어두운 벌을 만든다.
 * 3. 그러면 usePickTheme 을 쓰는 모든 자리에서 타입 오류가 난다.
 *    ThemeImpls 가 갈래를 하나도 빠뜨릴 수 없는 형태라 컴파일러가
 *    "아직 안 만든 화면"을 전부 짚어 준다. 그 목록이 곧 할 일이다.
 */

export const THEME_FAMILIES = ["celestial", "maple"] as const;

export type ThemeFamily = (typeof THEME_FAMILIES)[number];

export const DEFAULT_FAMILY: ThemeFamily = "celestial";

const isKnownFamily = (v: unknown): v is ThemeFamily =>
    typeof v === "string" && (THEME_FAMILIES as readonly string[]).includes(v);

/**
 * 갈래마다 하나씩. 부분(Partial)이 아니라 전부 채워야 한다 —
 * 빠진 갈래를 조용히 기본값으로 때우면, 새 테마에서 어느 화면이
 * 아직 옛 모습인지 아무도 모른 채 배포된다.
 */
export type ThemeImpls<T> = Record<ThemeFamily, T>;

/** 지금 테마의 갈래. 'celestial-dark' 처럼 벌이 달라도 갈래는 같다. */
export function useThemeFamily(): ThemeFamily {
    const theme = useTheme();
    // 저장된 테마 이름이 낡아 알 수 없는 값일 수 있다. 그때는 기본 갈래로 돌아간다.
    return isKnownFamily(theme?.family) ? theme.family : DEFAULT_FAMILY;
}

/**
 * 지금 테마에 맞는 구현을 고른다.
 *
 * 컴포넌트를 감싸지 않고 **타입 그대로** 돌려준다. 그래서 ref 전달도,
 * 제네릭 props 도 평소처럼 동작한다.
 *
 *   const View = usePickTheme({ celestial: MonthCalendarView });
 *   return <View ref={ref} {...themeProps} />;
 */
export function usePickTheme<T>(impls: ThemeImpls<T>): T {
    const family = useThemeFamily();
    return impls[family] ?? impls[DEFAULT_FAMILY];
}
