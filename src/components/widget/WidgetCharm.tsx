"use client";
import { usePickTheme } from '@/styles/themed';
import * as Celestial from './celestial/WidgetCharm.styles';
import * as Maple from './maple/WidgetCharm.styles';
import * as Ocean from './ocean/WidgetCharm.styles';

const STYLES = { celestial:Celestial,maple:Maple,ocean:Ocean };
export default function WidgetCharm() {
    const S = usePickTheme(STYLES);
    return <S.Charm aria-hidden="true" data-ambient="widget-charm"><svg viewBox="0 0 60 60" fill="none"><S.Shape /></svg></S.Charm>;
}
