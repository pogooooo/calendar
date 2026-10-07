import styled from "styled-components";
import { withAlpha } from "@/styles/color";

/** 손잡이 — 평소엔 안 보이고, 올리면 판 옆에 짧은 선이 선다 */
export const Handle = styled.div<{ $hovered: boolean }>`
    position: absolute;
    top: 50%;
    left: 5px;
    width: 3px;
    height: 44px;
    margin-top: -22px;
    border-radius: 3px;
    pointer-events: none;
    background: ${(p) => withAlpha(p.theme.colors.primary, 0.5)};
    opacity: ${(p) => (p.$hovered ? 1 : 0)};
    transform: scaleY(${(p) => (p.$hovered ? 1 : 0.6)});
    transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
`;
