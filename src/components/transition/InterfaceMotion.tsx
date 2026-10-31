"use client";

import { press as gem } from '@/styles/gem/interactions';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useThemeMotion from '@/hooks/useThemeMotion';
import { usePickTheme } from '@/styles/themed';
import { press as celestial } from '@/styles/celestial/interactions';
import { press as maple } from '@/styles/maple/interactions';
import { press as ocean } from '@/styles/ocean/interactions';
import { isWidgetWindow } from '@/hooks/useAuthFetch';

/** Event delegation covers navigation, date arrows, tabs, menus and dialog buttons without wrappers. */
export default function InterfaceMotion() {
    const level = useThemeMotion();
    const profile = usePickTheme({ celestial, maple, ocean , gem: gem });
    usePathname();
    const widget = isWidgetWindow();

    useEffect(() => {
        if (level === 'off' || widget) return;
        const running = new Map<Element, Animation>();
        const play = (target: EventTarget | null) => {
            if (!(target instanceof Element)) return;
            const control = target.closest('button, a[href], [role="tab"], [role="switch"]');
            if (!(control instanceof HTMLElement) || control.matches(':disabled, [aria-disabled="true"]') || control.closest('[data-widget], [inert], [data-month-bar]')) return;
            const rect = control.getBoundingClientRect();
            // Long draggable rows and the calendar grid keep their own gesture feedback.
            if (rect.width > 400 || rect.height > 100 || !rect.width || !rect.height) return;
            running.get(control)?.cancel();
            const animation = control.animate(level === 'gentle' ? [{ opacity: .75 }, { opacity: 1 }] : profile.frames, {
                duration: level === 'gentle' ? 140 : profile.duration,
                easing: profile.easing,
            });
            running.set(control, animation);
            const clear = () => { if (running.get(control) === animation) running.delete(control); };
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
            running.forEach(animation => animation.cancel());
        };
    }, [level, profile, widget]);
    return null;
}
