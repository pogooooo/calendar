"use client";
/**
 * 사이드바 옆 손잡이 — 바다는 그림 없이 가는 선 하나. 마우스를 올리면 판 가장자리 옆에 선이 서서 "끌 수 있다"를 알린다.
 * (Celestial: 별 박힌 옆선, Maple: 먹선에 걸린 단풍 가지)
 */
import * as S from "./OceanSidebarDesign.styles";

export default function OceanSidebarDesign({ isHovered = false }: { isHovered?: boolean }) {
    return <S.Handle $hovered={isHovered} aria-hidden="true" data-ambient="ocean-handle" />;
}
