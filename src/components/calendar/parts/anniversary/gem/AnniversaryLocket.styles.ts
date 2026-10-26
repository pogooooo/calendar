/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/AnniversaryLocket.styles';
export * from '../celestial/AnniversaryLocket.styles';

export const Root = styled(Base.Root)`
    color:${({theme})=>theme.colors.accent};
    .ring { fill:${({theme})=>theme.colors.primary}12; stroke-width:1.2; }
    .ic { color:${({theme})=>theme.colors.primary}; }
    html[data-theme-motion='gentle'] &, html[data-theme-motion='off'] &, [data-widget] & {
        animation:none !important;
        .ring, .ic, .spark { animation:none !important; }
        &:hover .ic { transform:none; }
        .spark { opacity:0; }
    }
`;
