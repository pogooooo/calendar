"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "styled-components";

const CelestialHome = dynamic(() => import("@/components/home/celestial/CelestialHome"), { ssr: false });

export default function HomePage() {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    return <CelestialHome />;
}
