/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialSideBar.styles';
import { gemHeading, gemPanel, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialSideBar.styles';

export const Logo = styled(Base.Logo)`
    ${gemHeading}
    font-size: clamp(1.3rem, 13cqw, 2rem); letter-spacing: .06em;
`;

export const SideBarWrapper = styled(Base.SideBarWrapper)`
    background: linear-gradient(90deg, ${({theme})=>theme.colors.primary}06, transparent 90%);
    padding: 0 20px; margin-right: 14px;
    border-right: 1px solid ${({theme})=>theme.colors.accent}35;
`;
export const SidebarContour = styled(Base.SidebarContour)`
    right: -14px; width: 28px; top: 0; height: 100%;
    &::before { inset: 0; width: 28px; }
    svg { pointer-events: none; }
`;
export const ProfileWrapper = styled(Base.ProfileWrapper)`margin-bottom: 42px;`;
export const LogoRow = styled(Base.LogoRow)`
    margin-top: 32px;
    & > hr { border-color: ${({theme})=>theme.colors.accent}80; }
`;
export const UserClickable = styled(Base.UserClickable)`
    padding: 10px 8px; border-radius: 3px 12px;
    background: ${({theme})=>theme.colors.surface}50;
    border-color: ${({theme,$open})=>$open ? theme.colors.primary : theme.colors.accent+'30'};
`;
export const MenuWrapper = styled(Base.MenuWrapper)`& > * { margin-top: 8px; }`;
export const Divider = styled(Base.Divider)`
    background: linear-gradient(90deg,transparent,${({theme})=>theme.colors.accent}70,transparent);
    i { width: 7px; height: 9px; transform: translate(-50%,-50%); border: 0;
        clip-path: polygon(25% 0,75% 0,100% 30%,50% 100%,0 30%);
        background: conic-gradient(from 45deg,${({theme})=>theme.colors.accent},${({theme})=>theme.colors.surface},${({theme})=>theme.colors.accent}); }
`;

export const ProfilePopup = styled(Base.ProfilePopup)`
    ${gemPanel}
`;

export const PopupItem = styled(Base.PopupItem)`
    ${gemControl}
`;
