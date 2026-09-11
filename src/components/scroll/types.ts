import type * as React from "react";

/**
 * 스크롤 컴포넌트가 테마별 구현에 넘기는 값.
 * 화면 분기 방식은 설정·캘린더와 같다 — 데이터와 동작은 위에서 정하고
 * 테마 컴포넌트는 생김새만 맡는다.
 */

/**
 * 눈금이 내용을 가리키는 스크롤 영역.
 *
 * 쓰는 쪽에서 줄에 표시만 하면 되고 데이터를 두 번 적을 필요가 없다:
 *   data-ruler-tick            눈금을 놓을 줄
 *   data-ruler-label="14"      긴 눈금 옆에 적을 글자
 *   data-ruler-mark            그 줄에 내용이 있음 (표지를 찍는다)
 *   data-ruler-color="#8FA98F" 표지 색 (없으면 테마 강조색)
 */
export interface RulerScrollProps {
    children: React.ReactNode;
    className?: string;
    /** 몇 번째 눈금마다 길게 그을지. 기본 3 */
    majorEvery?: number;
    /** 막대 옆 이름표에 쓸 글자. 없으면 가장 가까운 긴 눈금의 글자를 쓴다. */
    flagFor?: (ratio: number) => string;
}
