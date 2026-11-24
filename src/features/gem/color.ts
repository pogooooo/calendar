import type { DefaultTheme } from "styled-components";

export const DEFAULT_STONE = "#4C224E";

export function parseGemHex(value: string): string | null {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
    if (!match) return null;
    const hex = match[1];
    return "#" + (hex.length === 3 ? Array.from(hex, digit => digit + digit).join("") : hex).toUpperCase();
}

export function normalizeGemColor(value: unknown): string {
    return (typeof value === "string" && parseGemHex(value)) || DEFAULT_STONE;
}

export function gemRgb(hex: string): [number, number, number] {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
}

export const gemHex = (rgb: number[]) =>
    "#" + rgb.map(channel => channel.toString(16).padStart(2, "0")).join("").toUpperCase();

function mix(stone: string, base: string, weight: number) {
    const channels = gemRgb(base);
    return gemHex(gemRgb(stone).map((channel, i) => Math.round(channels[i] * (1 - weight) + channel * weight)));
}

function luminance(hex: string) {
    const [r, g, b] = gemRgb(hex).map(channel => {
        const value = channel / 255;
        return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b;
}

function contrast(a: number, b: number) {
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

export function gemThemeWithColor(theme: DefaultTheme, color: string): DefaultTheme {
    if (theme.family !== "gem") return theme;
    const stone = normalizeGemColor(color);
    if (stone === DEFAULT_STONE) return theme;
    const dark = theme.mode === "dark";
    const background = mix(stone, dark ? "#18141B" : "#F7F1EF", dark ? .21 : .15);
    const surface = mix(stone, dark ? "#241D27" : "#FFF9F6", dark ? .17 : .10);
    const border = mix(stone, dark ? "#A599A8" : "#B4A8AE", dark ? .25 : .23);
    const anchor = dark ? "#FFF5FC" : "#261B2A";
    const readingSurfaces = [luminance(background), luminance(surface)];
    let primary = anchor;
    // Keep the most saturated candidate that still reads on both solid surfaces.
    for (let share = 68; share > 0; share -= 5) {
        const candidate = mix(stone, anchor, share / 100);
        const light = luminance(candidate);
        if (readingSurfaces.every(base => contrast(light, base) >= 4.5)) {
            primary = candidate;
            break;
        }
    }

    const cell = mix(stone, dark ? "#312733" : "#F7EEF0", dark ? .3 : .26);
    return {
        ...theme,
        colors: { ...theme.colors, background, surface, border, primary },
        preview: {
            ...theme.preview,
            cell,
            event: mix(stone, "#211922", .35),
            bg: `linear-gradient(116deg, ${cell}ed, ${cell}a8), var(--gem-calendar-map) center / cover no-repeat, ${cell}`,
        },
    };
}
