/**
 * 바다 알림 창의 표식 — 그림(조개) 대신 무채색 동그라미(40px) 안의 작은 아이콘 하나.
 * 색은 위험(산호)일 때만 든다. 움직이지 않는다.
 */
import styled from "styled-components";
import type { DialogKind } from "../arcana";
import { ink } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export const Mark = styled.span<{ $kind: DialogKind }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: ${(p) => (p.$kind === "danger" ? p.theme.colors.error : p.theme.colors.textSecondary)};
    background-color: ${(p) => (p.$kind === "danger" ? withAlpha(p.theme.colors.error, 0.1) : ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05))};

    svg { width: 18px; height: 18px; stroke-width: 1.75; }
`;
