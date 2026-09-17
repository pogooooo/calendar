/**
 * MapleEmptyArt 의 모양 — 먹 선화(E4a~d)를 마스크로 씌워 먹 색으로 옅게.
 */
import styled from "styled-components";
import { inkMask } from "@/styles/maple/ink";

export const Art = styled.span<{ $file: string }>`
    display: block;
    width: 128px;
    height: 128px;
    margin: 0 auto 10px;
    color: ${(p) => p.theme.colors.text};
    opacity: 0.55;
    ${(p) => inkMask(p.$file)}
`;
