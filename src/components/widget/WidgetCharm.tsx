"use client";
import { usePickTheme } from '@/styles/themed';
import CelestialWidgetCharm from './celestial/CelestialWidgetCharm';
import MapleWidgetCharm from './maple/MapleWidgetCharm';
import OceanWidgetCharm from './ocean/OceanWidgetCharm';

const VIEWS = { celestial: CelestialWidgetCharm, maple: MapleWidgetCharm, ocean: OceanWidgetCharm };

/**
 * 위젯의 장식 — 지금은 세 갈래 모두 따로 두지 않는다. 갈래의 느낌은 바탕 무늬(WidgetDecor)가 맡는다.
 * (Ocean 의 유리 물방울, Maple 의 3D 수채 잎은 걷었다.) 갈래가 다시 무언가를 얹고 싶을 때를 위해 자리만 남겨 둔다.
 */
export default function WidgetCharm({ locked = false }: { locked?: boolean }) {
    const View = usePickTheme(VIEWS);
    return <View locked={locked} />;
}
