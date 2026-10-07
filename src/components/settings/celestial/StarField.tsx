"use client";
/**
 * 설정 화면의 Celestial 바탕 — 이제 비워 둔다.
 * 예전에는 화면 위에 반짝이는 점 마흔둘을 얹었는데, 바탕 하늘(CelestialAtmosphere 의 three.js 별·별자리)이 생긴 뒤로는
 * 별이 두 겹이 되어 글 위에서까지 반짝였다. 하늘 한 겹이면 된다(WebGL 이 없을 때도 하늘의 예전 그림이 별을 맡는다).
 */
import type { ReactElement } from "react";

export default function StarField(): ReactElement | null {
    return null;
}
