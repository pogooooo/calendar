import styled from "styled-components";

export const Region = styled.div`position:relative; height:100%; min-width:0;`;
export const Sheet = styled.div`position:relative; height:100%; min-width:0;`;
export const Overlay = styled.div`
    display:none;
    position:absolute;
    inset:0;
    z-index:8;
    overflow:clip;
    pointer-events:none;
    backface-visibility:hidden;
    &[data-turning] { display:block; }
    html[data-theme-motion="off"] &[data-turning] { display:none; }
    &[data-turning="full"] {
        background:p => p.theme.colors.background;
        box-shadow:5px 3px 20px #24110f66;
    }
    &::after {
        content:"";
        position:absolute;
        inset:0;
        background:linear-gradient(90deg,transparent 65%,#361b1230 82%,#c0865366 98%,#eac49e94);
        pointer-events:none;
    }
    &[data-turn-direction="backward"]::after {
        background:linear-gradient(-90deg,transparent 65%,#361b1230 82%,#c0865366 98%,#eac49e94);
    }
`;
