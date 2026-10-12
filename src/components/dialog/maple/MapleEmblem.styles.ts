/**
 * MapleEmblem 의 모양 — 먹 마스크에 색을 입힌다. 위험의 밀랍 도장만 색 그림이다.
 */
import styled, { keyframes } from "styled-components";
import { inkMask } from "@/styles/maple/ink";
import type { DialogKind } from "../arcana";

const FILE: Record<DialogKind, string> = {
    info: "crest.webp",
    confirm: "acorn.webp",
    danger: "wax-seal.webp",
    ok: "check.webp",
};

const stamp = keyframes`
    from { opacity: 0; transform: scale(1.3) rotate(-6deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
`;

export const Mark = styled.span<{ $kind: DialogKind }>`
    display: block;
    ${(p) => inkMask(FILE[p.$kind])}
    background-color: ${(p) => (p.$kind === "ok" ? p.theme.colors.success : p.theme.colors.primary)};
    animation: ${stamp} 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) 0.1s both;

    :where(html[data-theme-motion="off"]) & { animation: none; }
`;

export const Seal = styled.img`
    display: block;
    object-fit: contain;
    animation: ${stamp} 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) 0.1s both;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));

    :where(html[data-theme-motion="off"]) & { animation: none; }
`;
