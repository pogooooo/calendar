"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "styled-components";

const CelestialHome = dynamic(() => import("@/components/home/celestial/CelestialHome"), { ssr: false });
const BotanicalHome = dynamic(() => import("@/components/home/botanical/BotanicalHome"), { ssr: false });

export default function HomePage() {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName.startsWith('celestial')) return <CelestialHome />;
    if (themeName === 'botanical') return <BotanicalHome />;
    return <CelestialHome />;
}
