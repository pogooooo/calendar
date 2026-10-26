import type { DefaultTheme } from 'styled-components';

export const DEFAULT_GEM_COLOR = '#9268C4';

export interface GemRgb { r: number; g: number; b: number }

/** A single, opaque sRGB value is shared by the stone, lighting and local preference. */
export function normalizeGemColor(value: unknown): string {
    return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value.trim())
        ? value.trim().toUpperCase()
        : DEFAULT_GEM_COLOR;
}

export function clampColorChannel(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.min(255, Math.round(value))) : 0;
}

export function hexToRgb(color: string): GemRgb {
    const normalized = normalizeGemColor(color);
    return {
        r: parseInt(normalized.slice(1, 3), 16),
        g: parseInt(normalized.slice(3, 5), 16),
        b: parseInt(normalized.slice(5, 7), 16),
    };
}

export function rgbToHex({ r, g, b }: GemRgb): string {
    return `#${[r, g, b].map(channel => clampColorChannel(channel).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function mix(a: string, b: string, amount: number): string {
    const from = hexToRgb(a), to = hexToRgb(b);
    return rgbToHex({
        r: from.r + (to.r - from.r) * amount,
        g: from.g + (to.g - from.g) * amount,
        b: from.b + (to.b - from.b) * amount,
    });
}

function luminance(color: string): number {
    const { r, g, b } = hexToRgb(color);
    const linear = [r, g, b].map(value => {
        const channel = value / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}

export function gemContrastRatio(a: string, b: string): number {
    return contrastAtLuminance(luminance(a), luminance(b));
}

function contrastAtLuminance(first: number, second: number): number {
    return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
}

/** Preserve the chosen hue while making interactive text readable on both surfaces. */
function readableColor(color: string, backgrounds: (string | number)[], dark: boolean, pole = dark ? '#FFFFFF' : '#17111E', targetContrast = 4.5): string {
    const backgroundLuminances = backgrounds.map(background => typeof background === 'number' ? background : luminance(background));
    for (let step = 0; step <= 100; step += 1) {
        const candidate = mix(color, pole, step / 100);
        if (backgroundLuminances.every(background => contrastAtLuminance(luminance(candidate), background) >= targetContrast)) return candidate;
    }
    return pole;
}

/** Match widget controls to their actual backdrop without changing the user's gemstone RGB. */
export function gemWidgetColors(theme: DefaultTheme, background: string, sampledLuminance?: number | null): DefaultTheme['colors'] {
    if (theme.family !== 'gem') return theme.colors;
    const effectiveLuminance = typeof sampledLuminance === 'number' && Number.isFinite(sampledLuminance)
        ? Math.max(0, Math.min(1, sampledLuminance))
        : luminance(background);
    const dark = effectiveLuminance <= .179;
    // Pure black is needed around middle gray, where a tinted dark pole is insufficient.
    const pole = dark ? '#FFFFFF' : '#000000';
    const readable = (color: string, targetContrast = 5.5) => readableColor(color, [effectiveLuminance], dark, pole, targetContrast);
    return {
        ...theme.colors,
        primary: readable(theme.gemColor ?? theme.colors.primary),
        accent: readable(theme.colors.accent),
        // Begin on the correct side of the backdrop, rather than turning the app's
        // opposite-mode ink into a muddy middle gray at the minimum contrast boundary.
        text: readable(dark ? '#F5F0EA' : '#241B2D'),
        textSecondary: readable(dark ? '#D9D2DF' : '#5F566A', 4.5),
        success: readable(theme.colors.success),
        error: readable(theme.colors.error),
        weekend: readable(theme.colors.weekend),
    };
}

/** Pure and deterministic: safe for the server and the first hydration render. */
export function applyGemColor(baseTheme: DefaultTheme, color: string): DefaultTheme {
    if (baseTheme.family !== 'gem') return baseTheme;
    const gemColor = normalizeGemColor(color);
    const dark = baseTheme.mode === 'dark';
    const background = mix(dark ? '#100D16' : '#F0EBE7', gemColor, dark ? .09 : .065);
    const surface = mix(dark ? '#211B29' : '#F5F0EA', gemColor, dark ? .12 : .045);
    const primary = readableColor(gemColor, [background, surface], dark);
    const accent = dark ? '#DCC197' : '#95713E';
    const colors = {
        ...baseTheme.colors,
        background,
        surface,
        primary,
        accent,
        text: mix(dark ? '#F6F0EB' : '#241B2D', gemColor, .04),
        textSecondary: readableColor(dark ? '#BCAFC8' : '#75677C', [background, surface], dark),
        success: readableColor(baseTheme.colors.success, [background, surface], dark),
        error: readableColor(baseTheme.colors.error, [background, surface], dark),
        weekend: readableColor(baseTheme.colors.weekend, [background, surface], dark),
        border: mix(dark ? '#66526E' : '#C5B9CA', gemColor, .12),
    };
    return {
        ...baseTheme,
        gemColor,
        colors,
        line: accent,
        preview: {
            cell: mix(surface, gemColor, .065),
            event: mix(surface, gemColor, .3),
            today: primary,
            bg: `radial-gradient(ellipse at 86% 0%, ${gemColor}35, transparent 64%), linear-gradient(135deg, ${background}, ${surface})`,
            rail: surface,
        },
    };
}
