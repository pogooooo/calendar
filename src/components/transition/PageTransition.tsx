"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { usePathname } from "next/navigation";
import CelestialPageTransition from "./celestial/CelestialPageTransition";

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const pathname = usePathname();
    const themeName = (theme?.name ?? "celestial").replace(/-dark$/, "");

    switch (themeName) {
        case "celestial":
        default:
            return <CelestialPageTransition key={pathname}>{children}</CelestialPageTransition>;
    }
}
