"use client";

import { usePickTheme } from '@/styles/themed';
import CelestialAtmosphere from './celestial/CelestialAtmosphere';
import MapleAtmosphere from './maple/MapleAtmosphere';
import OceanAtmosphere from './ocean/OceanAtmosphere';

const VIEWS = { celestial: CelestialAtmosphere, maple: MapleAtmosphere, ocean: OceanAtmosphere };

/** Decorative only: every theme controls its own shapes, density and movement. */
export default function ThemeAtmosphere() {
    const View = usePickTheme(VIEWS);
    return <View />;
}
