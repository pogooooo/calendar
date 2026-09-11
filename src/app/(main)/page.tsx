"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePickTheme } from "@/styles/themed";

const CelestialHome = dynamic(() => import("@/components/home/celestial/CelestialHome"), { ssr: false });

export default function HomePage() {
    const HomeView = usePickTheme({ celestial: CelestialHome });

    return <HomeView />;
}
