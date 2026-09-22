/**
 * MapleAnniversaryIcon 의 모양 — 시트에서 잘라 둔 낱장 마스크(public/themes/maple/icons/anniv-*.webp).
 */
import styled from "styled-components";
import { inkMask } from "@/styles/maple/ink";

export const Ink = styled.i<{ $key: string; $size: number }>`
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    ${(p) => inkMask(`icons/anniv-${p.$key}.webp`)}
`;
