/**
 * 바다의 오른쪽 단추 메뉴 — 실선 테두리의 가로 알약과 세로 실선 칸막이(Celestial), 종이 쪽지(Maple) 대신
 * **떠 있는 흰 판의 세로 목록**: 한 줄 32px, 올리면 8px 모서리로 옅게 칠해진다. 지우기 묶음 앞에만 머리카락 선 하나,
 * 지우기 글씨는 산호색. 폰에서는 줄을 손가락 높이(44px)로.
 */
import styled from "styled-components";
import * as C from "../celestial/TodoContextMenu.styles";
import { hairline, ink, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/TodoContextMenu.styles";

export const FloatingContextMenu = styled(C.FloatingContextMenu)`
    ${surface("float")}
    position: fixed;
    flex-direction: column;
    align-items: stretch;
    gap: 1px;
    min-width: 168px;
    padding: 4px;
    border-radius: 12px;

    button {
        min-height: 32px;
        padding: 0 10px;
        border-radius: 8px;
        text-align: left;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.8125rem;
        color: ${(p) => p.theme.colors.text};
        transition: background-color 0.12s ease;

        &:hover { background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)}; }
        &:focus-visible { outline: none; background-color: ${(p) => ink(p.theme, 0.06)}; }

        &.danger {
            color: ${(p) => p.theme.colors.error};
            &:hover { background-color: ${(p) => withAlpha(p.theme.colors.error, 0.08)}; }
        }
    }

    /* 칸막이는 지우기 묶음 앞에만 — 머리카락 선 하나 */
    .divider {
        display: none;
        width: auto;
        height: 1px;
        margin: 4px 6px;
        background-color: ${(p) => hairline(p.theme)};
    }
    .divider:has(+ .danger) { display: block; }
    .danger + .divider { display: none; }

    ${MOBILE} {
        min-width: 188px;
        padding: 4px;
        border-radius: 12px;
        button { min-height: 44px; padding: 0 12px; font-size: 0.875rem; border-radius: 8px; }
        .divider { margin: 4px 6px; }
    }
`;
