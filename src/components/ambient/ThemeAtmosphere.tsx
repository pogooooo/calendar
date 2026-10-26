"use client";

import GemAtmosphere from './gem/GemAtmosphere';
import { usePathname } from 'next/navigation';
import { usePickTheme } from '@/styles/themed';
import CelestialAtmosphere from './celestial/CelestialAtmosphere';
import MapleAtmosphere from './maple/MapleAtmosphere';
import OceanAtmosphere from './ocean/OceanAtmosphere';

const VIEWS = { celestial: CelestialAtmosphere, maple: MapleAtmosphere, ocean: OceanAtmosphere , gem: GemAtmosphere };

/**
 * Decorative only: every theme controls its own shapes, density and movement.
 *
 * 데스크톱 위젯 창에는 그리지 않는다. 위젯은 투명 창이라, 화면 전체를 덮은 장식이 쉬지 않고 움직이면
 * 창 전체를 계속 다시 칠하게 되어 윈도우에서 위젯이 깜빡였다(1.2.0). 작은 위젯에 떨어지는 잎이 있을 자리도 없다.
 */
export default function ThemeAtmosphere() {
    const View = usePickTheme(VIEWS);
    const pathname = usePathname();
    if (pathname?.startsWith('/widget')) return null;
    return <View />;
}
