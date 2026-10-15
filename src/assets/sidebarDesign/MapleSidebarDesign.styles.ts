/**
 * MapleSidebarDesign 의 모양 — 사이드바와 본문 사이의 옅은 세로선 하나(위아래 끝은 흐리게 사라진다).
 * 폭 조절 손잡이에 올리면 선이 단풍 붉음으로 짙어져 잡을 수 있는 자리임을 알린다.
 */
import styled from "styled-components";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";

export const Wrap = styled.div<{ $hovered?: boolean }>`
    position: relative;
    width: 160px;
    height: 100%;

    .rule {
        position: absolute;
        left: 102px;
        top: 0;
        width: 1px;
        height: 100%;
        background-color: ${(p) => (p.$hovered
            ? withAlpha(p.theme.colors.primary, 0.75)
            : hair(p.theme, p.theme.mode === "dark" ? 0.14 : 0.12))};
        mask-image: linear-gradient(to bottom, transparent 0, #000 56px, #000 calc(100% - 56px), transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 56px, #000 calc(100% - 56px), transparent 100%);
        transition: background-color 0.25s ease;
    }
`;
