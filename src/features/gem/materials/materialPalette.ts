export type MaterialRole = "cut" | "quartz" | "pearl" | "geode" | "gold" | "silver";
export type MaterialMode = "light" | "dark";
export type MaterialFinish = "reading" | "ornament" | "relief";
export const DEFAULT_MATERIAL_COLOR = "#4C224E";

const mix = (a: number[], b: number[], weight: number) => a.map((v, i) => v + (b[i] - v) * weight);
const white = [255, 250, 253];

/** Bright green/yellow choices must not wash out the white text on active controls. */
function readingRamp(stops: number[][], maximumLuminance: number) {
    return stops.map(rgb => {
        const linear = rgb.map(c => c / 255 <= .04045 ? c / 3294.6 : ((c / 255 + .055) / 1.055) ** 2.4);
        const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
        if (luminance <= maximumLuminance) return rgb;
        return linear.map(c => {
            const dimmed = c * maximumLuminance / luminance;
            return (dimmed <= .0031308 ? 12.92 * dimmed : 1.055 * dimmed ** (1 / 2.4) - .055) * 255;
        });
    });
}

function stoneTone(color: string, lightness: number) {
    const hex = /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_MATERIAL_COLOR;
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(...rgb), min = Math.min(...rgb), delta = max - min;
    const sourceLightness = (max + min) / 2;
    const saturation = delta ? Math.min(.58, delta / (1 - Math.abs(2 * sourceLightness - 1))) : 0;
    const span = (1 - Math.abs(2 * lightness - 1)) * saturation;
    return rgb.map(c => (lightness - span / 2 + (delta ? (c - min) / delta * span : 0)) * 255);
}

/** The geometry and reflections come from the image. Only its tonal palette changes. */
export function materialRamp(color: string, mode: MaterialMode, role: MaterialRole, finish: MaterialFinish = "ornament"): number[][] {
    const dark = mode === "dark";
    const stone = stoneTone(color, dark ? .27 : .37);
    if (role === "gold") return [[131, 91, 48], [150, 108, 59], [177, 136, 80], [201, 163, 107], [222, 188, 141]];
    if (role === "silver") return [[112, 101, 124], [138, 125, 149], [164, 152, 176], [190, 179, 201], [215, 207, 225]];
    if (role === "cut") {
        const core = stoneTone(color, .24);
        // Label surfaces retain contrast even at the texture's brightest reflection.
        return readingRamp([mix(core, [7, 4, 10], .88), mix(core, [10, 6, 12], .55), core, mix(core, white, .17), mix(core, white, .40)], .15);
    }
    if (finish === "relief") return dark
        ? readingRamp([mix(stone, [9, 7, 14], .9), mix(stone, [14, 10, 20], .74), mix(stone, [20, 14, 27], .46), mix(stone, white, .06), mix(stone, white, .35)], .09)
        : [.51, .58, .69, .81, .99].map(weight => mix(stone, white, weight));
    // Reading finishes preserve the original edges, without a blur or white overlay.
    // Their restricted tonal range is separate from the high-contrast geode setting.
    if (finish === "reading") return dark
        ? readingRamp([mix(stone, [11, 9, 16], .72), mix(stone, [16, 12, 22], .56), mix(stone, [21, 16, 27], .35), stone, mix(stone, white, .13)], .075)
        : (role === "pearl" ? [.76, .81, .87, .93, .99] : [.63, .67, .73, .82, .99])
            .map(weight => mix(stone, white, weight));
    if (role === "geode") return dark
        ? [mix(stone, [5, 4, 7], .84), mix(stone, [8, 6, 10], .46), stone, mix(stone, white, .35), mix(stone, white, .88)]
        : [mix(stone, white, .06), mix(stone, white, .24), mix(stone, white, .47), mix(stone, white, .76), white];
    if (role === "pearl") return dark
        ? readingRamp([mix(stone, [13, 11, 17], .63), mix(stone, [20, 16, 25], .38), mix(stone, white, .02), mix(stone, white, .10), mix(stone, white, .20)], .13)
        : [.62, .73, .83, .91, .98].map(weight => mix(stone, white, weight));
    return dark
        ? readingRamp([mix(stone, [6, 4, 9], .94), mix(stone, [10, 6, 14], .82), mix(stone, [14, 9, 20], .64), mix(stone, [20, 15, 26], .20), mix(stone, white, .32)], .13)
        : [.43, .47, .56, .74, .99].map(weight => mix(stone, white, weight));
}

export function materialSvg(dataUrl: string, width: number, height: number, ramp: number[][],
    crop?: { left: number; top: number; width: number; height: number }) {
    const channel = (i: number) => ramp.map(c => (c[i] / 255).toFixed(5)).join(" ");
    const region = crop ?? { left: 0, top: 0, width, height };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${region.width}" height="${region.height}" viewBox="${region.left} ${region.top} ${region.width} ${region.height}"><defs><filter id="tone" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="table" tableValues="${channel(0)}"/><feFuncG type="table" tableValues="${channel(1)}"/><feFuncB type="table" tableValues="${channel(2)}"/></feComponentTransfer></filter></defs><image width="${width}" height="${height}" href="${dataUrl}" filter="url(#tone)"/></svg>`;
}
