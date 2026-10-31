"use client";

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { isMobileShell, isDesktopShell } from '@/lib/platform';

export type Presentation = 'web' | 'desktop-app' | 'mobile-app' | 'desktop-widget';
const subscribe = (changed: () => void) => {
    window.addEventListener('cronos-presentation', changed);
    return () => window.removeEventListener('cronos-presentation', changed);
};
const snapshot = (): Presentation => {
    // The development studio exercises the real presentation policy without impersonating Tauri.
    if (process.env.NODE_ENV === 'development' && location.pathname.startsWith('/dev/design')) {
        const value = new URLSearchParams(location.search).get('platform');
        if (value === 'mobile-app' || value === 'desktop-app' || value === 'desktop-widget') return value;
    }
    if (location.pathname.startsWith('/widget')) return 'desktop-widget';
    return isMobileShell() ? 'mobile-app' : isDesktopShell() ? 'desktop-app' : 'web';
};

/** Platform is independent of viewport size: a narrow website is still a rich website. */
export default function usePresentation(): Presentation {
    usePathname(); // Re-evaluate the snapshot after client navigation.
    return useSyncExternalStore(subscribe, snapshot, () => 'web');
}
