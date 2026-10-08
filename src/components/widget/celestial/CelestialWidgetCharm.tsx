"use client";
/**
 * Celestial 위젯의 장식 — 모서리의 옅은 나침 문양(움직이지 않는다).
 * 손잡이 줄의 3D 혼천의는 선화 테마와 따로 놀아 걷고 예전 문양으로 돌렸다.
 */
import * as S from "./WidgetCharm.styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CelestialWidgetCharm(_props: { locked?: boolean }) {
    return <S.Charm aria-hidden="true" data-ambient="widget-charm"><svg viewBox="0 0 60 60" fill="none"><S.Shape /></svg></S.Charm>;
}
