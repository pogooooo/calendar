"use client";
import { usePickTheme } from '@/styles/themed';
import CelestialWidgetCharm from './celestial/CelestialWidgetCharm';
import MapleWidgetCharm from './maple/MapleWidgetCharm';
import OceanWidgetCharm from './ocean/OceanWidgetCharm';

const VIEWS = { celestial: CelestialWidgetCharm, maple: MapleWidgetCharm, ocean: OceanWidgetCharm };

/**
 * 위젯의 장식 — 갈래마다 다르다. Maple 만 손잡이 줄 가운데에 오늘의 단풍잎(3D 오브제, 멈춘 한 장, 잠그면 없음).
 * Celestial·Ocean 은 따로 두지 않는다 — 바탕 무늬(WidgetDecor)가 맡는다. Ocean 의 유리 물방울은 걷었다.
 */
export default function WidgetCharm({ locked = false }: { locked?: boolean }) {
    const View = usePickTheme(VIEWS);
    return <View locked={locked} />;
}
