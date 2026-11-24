import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { gemPanel } from "@/features/gem/GemLive.styles";
import * as Base from "../celestial/TodoContextMenu.styles";

export const FloatingContextMenu = styled(Base.FloatingContextMenu)`
    ${gemPanel}
    border-radius: var(--gem-radius);
    button { border-radius: var(--gem-radius); }
    button.danger:hover { background: color-mix(in srgb, ${p => p.theme.colors.error} 14%, transparent); }
    ${MOBILE} { border-radius: 14px; }
`;
