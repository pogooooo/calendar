"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

export const ScreenNavigationScope = createContext<((path: string) => void) | null>(null);

export function useScreenNavigation() {
    const navigate = useContext(ScreenNavigationScope);
    const router = useRouter();
    return navigate ?? router.push;
}
