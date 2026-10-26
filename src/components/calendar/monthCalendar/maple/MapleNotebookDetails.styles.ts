import styled from 'styled-components';
import { hair } from '@/styles/maple/ink';

export const Colophon = styled.div`
    position:absolute; bottom:7px; left:27px; right:13px; display:flex; align-items:center; justify-content:space-between;
    pointer-events:none; font-family:${p => p.theme.fonts.body}; font-size:.51rem; line-height:1; letter-spacing:.14em; color:${p => hair(p.theme,.65)};
    .folio { font-family:${p => p.theme.fonts.display}; font-size:.6rem; letter-spacing:.07em; color:${p => p.theme.colors.primary}; }
    [data-widget] & { display:none; }
`;
