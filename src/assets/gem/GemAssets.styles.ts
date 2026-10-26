import styled from 'styled-components';

export const Seal = styled.span`
    display: inline-flex; align-items: center; justify-content: center;
    color: ${({theme}) => theme.gemColor ?? theme.colors.primary};
    svg { flex-shrink: 0; }
`;
export const Sticker = styled(Seal)<{$filled:boolean}>`
    width: 100%; height: 100%;
    opacity: ${({$filled}) => $filled ? 1 : .2};
    filter: ${({$filled}) => $filled ? 'drop-shadow(0 2px 3px #00000020)' : 'grayscale(.5)'};
    transition: opacity .3s ease, filter .3s ease;
`;
export const Sidebar = styled.svg`
    position: absolute; right: 0; top: 12%; width: 28px; height: 220px;
    color: ${({theme}) => theme.colors.accent};
    transition: filter .3s ease;
    &[data-hover=true] { filter: drop-shadow(0 0 4px currentColor); }
`;
export const Empty = styled.div`
    width: 112px; height: 86px; margin: 0 auto 16px;
    color: ${({theme}) => theme.gemColor ?? theme.colors.primary};
    svg { width: 100%; height: 100%; }
    .gold { color: ${({theme}) => theme.colors.accent}; opacity: .75; }
`;
export const Widget = styled.div`
    position: absolute; inset: 6px; border: 1px solid ${({theme}) => theme.colors.accent}38;
    border-radius: 3px 18px 3px 18px; pointer-events: none; overflow: hidden;
    background: linear-gradient(130deg, ${({theme}) => theme.colors.primary}06, transparent 50%, ${({theme}) => theme.colors.accent}08);
    svg { position: absolute; right: -4px; bottom: -15px; opacity: .14; color: ${({theme}) => theme.gemColor ?? theme.colors.primary}; }
`;
export const Hero = styled.div`
    display: grid; place-items: center; width: 100%; min-height: 260px;
    color: ${({theme}) => theme.gemColor ?? theme.colors.primary};
    svg { width: min(100%, 370px); height: auto; filter: drop-shadow(0 20px 26px ${({theme}) => theme.colors.primary}25); }
    .gold { color: ${({theme}) => theme.colors.accent}; }
`;
