import styled from "styled-components";
import * as M from "../maple/MapleBaseModal.styles";
import { gemPanel } from "@/features/gem/GemLive.styles";
import { MOBILE } from "@/styles/breakpoints";

export * from "../maple/MapleBaseModal.styles";

export const Overlay = styled(M.Overlay)`
    html[data-presentation="mobile-app"] & {
        backdrop-filter: none;
        background: #140b1caa;
    }
`;

export const Container = styled(M.Container)`
    ${gemPanel}
    border-color: var(--gem-gold);
    box-shadow: 0 14px 52px #24102e57;
    ${MOBILE} {
        border-radius: 20px 20px 0 0;
        border-inline: 0;
        border-block-end: 0;
    }
`;
