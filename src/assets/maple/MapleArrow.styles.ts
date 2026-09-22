/**
 * MapleArrow 의 모양 — 왼쪽·오른쪽 화살 마스크(public/themes/maple/ink-arrow-*.webp)를 stroke 색으로 칠한다.
 */
import styled from "styled-components";
import { inkMask } from "@/styles/maple/ink";

export const Ink = styled.span<{ $w: number; $h: number; $ink?: string; $right: boolean }>`
    display: inline-block;
    width: ${(p) => p.$w}px;
    height: ${(p) => p.$h}px;
    ${(p) => inkMask(p.$right ? "ink-arrow-right.webp" : "ink-arrow-left.webp")}
    background-color: ${(p) => p.$ink ?? p.theme.colors.text};
`;
