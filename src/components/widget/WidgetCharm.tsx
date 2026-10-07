"use client";
import { usePickTheme } from '@/styles/themed';
import CelestialWidgetCharm from './celestial/CelestialWidgetCharm';
import * as Maple from './maple/WidgetCharm.styles';
import * as Ocean from './ocean/WidgetCharm.styles';

/** Maple — 모서리의 옅은 잎 한 장(움직이지 않는다) */
function MapleCharm() {
    return <Maple.Charm aria-hidden="true" data-ambient="widget-charm"><svg viewBox="0 0 60 60" fill="none"><Maple.Shape /></svg></Maple.Charm>;
}
/** Ocean — 자리만 남기고 보이지 않는다 */
function OceanCharm() {
    return <Ocean.Charm aria-hidden="true" data-ambient="widget-charm"><svg viewBox="0 0 60 60" fill="none"><Ocean.Shape /></svg></Ocean.Charm>;
}

const VIEWS = { celestial: CelestialWidgetCharm, maple: MapleCharm, ocean: OceanCharm };

/** 위젯의 장식 한 점 — 갈래마다 다르다. Celestial 은 손잡이 줄 가운데의 작은 금 혼천의(멈춘 한 장, 잠그면 없음) */
export default function WidgetCharm({ locked = false }: { locked?: boolean }) {
    const View = usePickTheme(VIEWS);
    return <View locked={locked} />;
}
