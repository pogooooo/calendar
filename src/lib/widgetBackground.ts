import type { CSSProperties } from 'react';

export type BgMode = 'theme' | 'glass' | 'custom';
export interface WidgetBgSettings {
    mode: BgMode;
    opacity: number;
    customColor: string;
    autoTextColor: boolean;
    gloss?: boolean;
    glassBlur?: number;
    liquid?: boolean;
}
const clamp = (value: unknown, fallback: number, max = 1) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : fallback;

/** Older glass settings used opacity as blur, with an entirely opaque wallpaper copy. */
export function normalizeWidgetBackground(value: WidgetBgSettings): WidgetBgSettings {
    const legacyGlass = value.mode === 'glass' && value.glassBlur === undefined;
    return {
        ...value,
        opacity: legacyGlass ? 1 : clamp(value.opacity, .92),
        glassBlur: clamp(value.glassBlur, legacyGlass ? clamp(value.opacity, .92) * 40 : 36.8, 40),
    };
}

/** Alpha belongs to this backdrop only, never to content or ornament layers. */
export function widgetBackgroundStyle(bg: WidgetBgSettings, surface: string): CSSProperties {
    return {
        background: bg.mode === 'glass' ? 'transparent' : bg.mode === 'custom' ? bg.customColor : surface,
        opacity: bg.opacity,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
    };
}
