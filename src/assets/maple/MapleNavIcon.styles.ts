/**
 * MapleNavIcon 의 모양 — 시트에서 잘라 둔 낱장 마스크(public/themes/maple/icons/nav-*.webp)를 글자색으로 칠한다.
 */
import styled from "styled-components";
import { inkMask } from "@/styles/maple/ink";
import type { NavIconName } from "./MapleNavIcon";

export const Ink = styled.i<{ $name: NavIconName; $size: number }>`
    display: inline-block;
    flex-shrink: 0;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    ${(p) => inkMask(`icons/nav-${p.$name}.webp`)}
`;
