"use client";

import { useId } from "react";
import { useTheme } from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import { materialRamp } from "@/features/gem/materials/materialPalette";
import texture from "@/features/gem/materials/geode-neutral.webp";

/** Color only: the image already contains real crystal silhouettes, cavities and lighting. */
export default function GeodeMaterial() {
    const color = useSettingStore(state => state.gemColor);
    const dark = useTheme().mode === "dark";
    const id = `geode-tone-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const stops = materialRamp(color, dark ? "dark" : "light", "geode");
    const table = (channel: number) => stops.map(stop => (stop[channel] / 255).toFixed(4)).join(" ");

    return <svg viewBox={`0 0 ${texture.width} ${texture.height}`} preserveAspectRatio="xMidYMid slice"
        width="100%" height="100%" focusable="false" aria-hidden="true">
        <defs>
            <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feComponentTransfer>
                    <feFuncR type="table" tableValues={table(0)} />
                    <feFuncG type="table" tableValues={table(1)} />
                    <feFuncB type="table" tableValues={table(2)} />
                </feComponentTransfer>
            </filter>
        </defs>
        <image href={texture.src} width={texture.width} height={texture.height} filter={`url(#${id})`} />
    </svg>;
}
