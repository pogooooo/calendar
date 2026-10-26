/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialWidgetPanels.styles';
import { gemControl, gemHeading, gemField } from '@/styles/gem/material';
export * from '../celestial/CelestialWidgetPanels.styles';

export const NavBtn = styled(Base.NavBtn)`
    ${gemControl}
`;

export const NowTitle = styled(Base.NowTitle)`
    ${gemHeading}
    /* Task titles follow the widget's automatic contrast, including custom backgrounds. */
    color: ${({theme}) => theme.colors.text};
`;

export const MemoArea = styled(Base.MemoArea)`
    ${gemField}
    /* The widget owns its backdrop; app fields must not paint over it. */
    background: transparent;
    &::placeholder { color: ${({theme}) => theme.colors.textSecondary}; opacity: .8; }
`;

export const QuickInput = styled(Base.QuickInput)`
    ${gemField}
    background: transparent;
    &::placeholder { color: ${({theme}) => theme.colors.textSecondary}; opacity: .8; }
`;

export const AddBtn = styled(Base.AddBtn)`
    ${gemControl}
`;

export const DelBtn = styled(Base.DelBtn)`
    ${gemControl}
`;

export const Dot = styled(Base.Dot)`
    /* Widget pages clear background-color; completed days still need a visible fill. */
    background-image: ${({$on, theme}) => $on
        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary})`
        : 'none'};
    transition: box-shadow .2s ease, border-color .2s ease;
    &:focus-visible { outline: 2px solid ${({theme}) => theme.colors.text}; outline-offset: 3px; }
`;

export const CatFill = styled(Base.CatFill)`
    /* Keep category values visible inside the transparent widget wrapper. */
    background-image: ${({$c}) => `linear-gradient(${$c}, ${$c})`};
    transition: width .26s cubic-bezier(.22, 1, .36, 1);
`;
