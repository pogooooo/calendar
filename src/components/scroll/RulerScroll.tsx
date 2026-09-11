"use client";

import * as React from "react";
import { usePickTheme } from "@/styles/themed";
import CelestialRulerScroll from "./celestial/CelestialRulerScroll";
import type { RulerScrollProps } from "./types";

/**
 * 눈금이 내용을 가리키는 스크롤 영역.
 *
 * 테마 분기만 맡는다. 화면은 테마 컴포넌트가 그린다 —
 * 설정·캘린더가 쓰는 방식과 같다.
 *
 * 쓰는 쪽에서 줄에 표시만 하면 되고 데이터를 두 번 적을 필요가 없다:
 *   data-ruler-tick / data-ruler-label / data-ruler-mark / data-ruler-color
 * 자세한 뜻은 ./types.ts 참고.
 */
export default function RulerScroll(props: RulerScrollProps) {
    const RulerScrollView = usePickTheme({ celestial: CelestialRulerScroll });

    return <RulerScrollView {...props} />;
}
