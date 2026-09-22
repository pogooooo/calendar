/**
 * Maple 의 화살 — 손으로 그은 먹 화살(J8), 꼬리에 깃. Celestial 의 가는 금빛 화살(assets/celestial/Arrow) 자리.
 * 2차 그림 전에는 코드로 그린 SVG(휜 선 끝의 잎)였다.
 */
import * as S from "./MapleArrow.styles";

interface ArrowProps { width: number; height: number; stroke?: string; isRight: boolean }

const MapleArrow = ({ width, height, stroke, isRight }: ArrowProps) => (
    <S.Ink $w={width} $h={height} $ink={stroke} $right={isRight} aria-hidden="true" />
);

export default MapleArrow;
