"use client";
import { usePickTheme } from '@/styles/themed';
import CelestialWidgetCharm from './celestial/CelestialWidgetCharm';
import MapleWidgetCharm from './maple/MapleWidgetCharm';
import OceanWidgetCharm from './ocean/OceanWidgetCharm';

const VIEWS = { celestial: CelestialWidgetCharm, maple: MapleWidgetCharm, ocean: OceanWidgetCharm };

/**
 * 위젯의 장식 — 갈래마다 다르다. Maple·Ocean 은 손잡이 줄 가운데의 작은 3D 오브제 하나(멈춘 한 장, 잠그면 없음):
 * Celestial 은 모서리의 옅은 나침 문양 · Maple 오늘의 단풍잎(모서리의 옅은 선화 잎은 그대로) · Ocean 유리 물방울.
 */
export default function WidgetCharm({ locked = false }: { locked?: boolean }) {
    const View = usePickTheme(VIEWS);
    return <View locked={locked} />;
}
