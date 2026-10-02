import { createGlobalStyle } from 'styled-components';
const OceanGround = createGlobalStyle`
    [data-app-shell] { background-image:${p=>p.theme.mode==='dark'?'none':`radial-gradient(ellipse at 90% 100%, ${p.theme.colors.accent}18, transparent 65%)`}; }
`;
export default OceanGround;
