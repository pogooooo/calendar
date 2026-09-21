/**
 * Maple 의 화살 — 먹으로 그은 선 끝에 작은 잎. Celestial 의 가는 금빛 화살(assets/celestial/Arrow) 자리.
 * 선은 완전한 직선이 아니라 손으로 그은 듯 아주 조금 휘었다.
 */
import { useTheme } from "styled-components";

interface ArrowProps { width: number; height: number; stroke?: string; isRight: boolean }

const LEAF = [[6, 0], [7.4, 3.2], [10.6, 1.8], [9.2, 5], [12, 6.4], [9, 7.6], [9.8, 10.6], [7, 9.2], [6, 12], [5, 9.2], [2.2, 10.6], [3, 7.6], [0, 6.4], [2.8, 5], [1.4, 1.8], [4.6, 3.2]];
const leaf = (x: number, y: number, s: number) =>
    "M " + LEAF.map(([px, py]) => `${(x + (px - 6) * s).toFixed(1)} ${(y + (py - 6) * s).toFixed(1)}`).join(" L ") + " Z";

const MapleArrow = ({ width, height, stroke, isRight }: ArrowProps) => {
    const theme = useTheme();
    const ink = stroke || theme.colors.text;
    return (
        <svg width={width} height={height} viewBox="0 0 75 16" fill="none" xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none" style={{ transform: isRight ? "scaleX(-1)" : "none" }} aria-hidden="true">
            <path d="M74 8.2 C 50 7.4, 30 8.6, 9 7.8" stroke={ink} strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
            <path d="M14 3.6 C 11 5.6, 9 7, 7 8 C 9 9, 11 10.4, 14 12.4" stroke={ink} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d={leaf(4.5, 8, 0.55)} fill={theme.colors.primary} />
        </svg>
    );
};

export default MapleArrow;
