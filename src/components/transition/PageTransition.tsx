"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { usePickTheme } from "@/styles/themed";
import CelestialPageTransition from "./celestial/CelestialPageTransition";
import MaplePageTransition from "./maple/MaplePageTransition";
import OceanPageTransition from './ocean/OceanPageTransition';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const TransitionView = usePickTheme({ celestial: CelestialPageTransition, maple: MaplePageTransition, ocean: OceanPageTransition });

    return <TransitionView key={pathname}>{children}</TransitionView>;
}
