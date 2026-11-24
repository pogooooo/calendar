"use client";

import { useEffect } from 'react';
import { useSvgInkMotion } from './useSvgInkMotion';
import { usePathname } from 'next/navigation';
import useThemeMotion from '@/hooks/useThemeMotion';
import { usePickTheme } from '@/styles/themed';
import { press as celestial } from '@/styles/celestial/interactions';
import { press as maple } from '@/styles/maple/interactions';
import { press as ocean } from '@/styles/ocean/interactions';
import { gemPress as gem, playGemPress, prepareGemMotion } from '@/features/gem/motion';
import { isWidgetWindow } from '@/hooks/useAuthFetch';

/** Event delegation covers navigation, date arrows, tabs, menus and dialog buttons without wrappers. */
export default function InterfaceMotion() {
    const level = useThemeMotion();
    useSvgInkMotion(level);
    const profile = usePickTheme({ celestial, maple, ocean, gem });
    const pathname = usePathname();
    const gemPath = profile === gem ? pathname : null;
    const widget = isWidgetWindow();

    useEffect(() => {
        if (level === 'off' || widget) return;
        if (profile === gem) void prepareGemMotion();
        const running = new Map<Element, () => void>();
        const play = (target: EventTarget | null) => {
            if (!(target instanceof Element)) return;
            const control = target.closest('button, a[href], [role="tab"], [role="switch"]');
            if (!(control instanceof HTMLElement) || control.matches(':disabled, [aria-disabled="true"]') || control.closest('[data-widget], [inert], [data-month-bar]')) return;
            if (control.querySelector('svg')) return; // The ink inside the icon supplies press feedback.
            if (profile === gem && control.closest('[data-calendar-navigation], [data-week-strip]')) return;
            const rect = control.getBoundingClientRect();
            // Long draggable rows and the calendar grid keep their own gesture feedback.
            const wideGemSubmit = profile === gem && control.matches('button[type="submit"]');
            if ((rect.width > 400 && !wideGemSubmit) || rect.height > 100 || !rect.width || !rect.height) return;
            running.get(control)?.();
            const stop = profile === gem ? playGemPress(control, level, () => running.delete(control)) : null;
            if (stop) { running.set(control, stop); return; }
            const frames = profile === gem ? [gem.frames[0], { boxShadow: getComputedStyle(control).boxShadow }]
                : level === 'gentle' ? [{ opacity: .75 }, { opacity: 1 }] : profile.frames;
            const animation = control.animate(frames, {
                duration: level === 'gentle' ? 140 : profile.duration,
                easing: profile.easing,
            });
            const cancel = () => animation.cancel();
            running.set(control, cancel);
            const clear = () => { if (running.get(control) === cancel) running.delete(control); };
            animation.onfinish = clear;
            animation.oncancel = clear;
        };
        const pointer = (event: PointerEvent) => { if (event.button === 0) play(event.target); };
        const keyboard = (event: KeyboardEvent) => {
            if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) play(event.target);
        };
        document.addEventListener('pointerdown', pointer, { passive: true, capture: true });
        document.addEventListener('keydown', keyboard, true);
        return () => {
            document.removeEventListener('pointerdown', pointer, true);
            document.removeEventListener('keydown', keyboard, true);
            running.forEach(cancel => cancel());
        };
    }, [level, profile, widget, gemPath]);
    return null;
}
