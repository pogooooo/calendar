"use client";

import { memo, useId, type ReactNode } from "react";
import type { NavIconName } from "../maple/MapleNavIcon";
import { resolveIconKey, type AnniversaryIconKey } from "../celestial/AnniversaryIcons";
import { Icon, Sticker } from "./GemIcons.styles";
import vein from "@/features/gem/materials/cut-neutral.webp";
import useSettingStore from "@/store/useSettingStore";
import { materialRamp } from "@/features/gem/materials/materialPalette";

// Bevelled silhouettes and inset facets keep each familiar action recognisable at 20px.
const nav: Record<NavIconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8v9H3Z"/><path d="M3 11h18M9 20v-7h6v7M8 7l4 4 4-4"/><path className="facet" d="m3 11 5-4 4 4Z"/></>,
    calendar: <><path d="M5 5h14l2 2v12l-2 2H5l-2-2V7Z"/><path d="M3 10h18M8 3v4m8-4v4M7 14h3m4 0h3m-10 4h3"/><path className="facet" d="m15 16 2 2-2 2-2-2Z"/></>,
    project: <><path d="M4 3h12l4 4v14H4Z"/><path d="M16 3v5h4M8 7h4M8 12h8M8 16h5"/><path className="facet" d="M4 3h3v18H4Z"/></>,
    challenge: <><path d="m7 3-4 6 9 12 9-12-4-6Z"/><path d="m7 3 2 6 3 12 3-12 2-6M3 9h18M9 9l3-6 3 6"/><path className="facet" d="m3 9 6 0 3 12Z"/></>,
    anniversary: <><path d="M4 9h16v12H4ZM3 6h18v4H3ZM12 6v15M12 6 7 2 4 3l1 3m7 0 5-4 3 1-1 3"/><path className="facet" d="M14 10h6v3h-6Z"/></>,
    category: <><path d="m3 5 9-2 9 9-9 9-9-9Z"/><path d="m5 7 7 0 7 5-7 6-7-6Z"/><circle cx="8" cy="9" r="1"/><path className="facet" d="m12 3 9 9-2 0-7-5Z"/></>,
    settings: <><path d="m8 3 8 0 5 5v8l-5 5H8l-5-5V8Z"/><path d="m9 8 6 0 2 4-2 4H9l-2-4Z"/><path className="facet" d="m8 3 1 5-6 0Z"/></>,
    download: <><path d="M8 3h8v8h4l-8 8-8-8h4Z"/><path d="M3 18v3h18v-3M12 3v16"/><path className="facet" d="M12 3h4v8h4l-8 8Z"/></>,
    plus: <><path d="M12 4v16M4 12h16"/><path className="facet" d="m12 8 4 4-4 4-4-4Z"/></>,
    check: <path d="m4 12 5 5L20 6M4 12l5 8L20 6"/>,
    watch: <><path d="m8 3 8 0 5 5v8l-5 5H8l-5-5V8Z"/><path d="M12 6v6l4 3"/><path className="facet" d="m8 3-5 5 3 0Z"/></>,
    more: <>{[5,12,19].map(x=><path key={x} d={`m${x} 10 2 2-2 2-2-2Z`}/>)}</>,
};

const anniversary: Record<AnniversaryIconKey, ReactNode> = {
    star: <><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m9 9 6 6m-6 0 6-6"/><path className="facet" d="m12 2 0 10 3-3Z"/></>,
    moon: <><path d="M15 3 8 4 3 10l1 7 6 4 7-1 4-5-7 1-5-5 1-5Z"/><path d="m8 4 1 7-5 6m5-6 1 10m4-5 3 4"/></>,
    cake: <><path d="M4 11h16v10H4ZM3 16h18M8 11V7m8 4V7"/><path className="facet" d="m8 2 2 3-2 2-2-2Zm8 0 2 3-2 2-2-2Z"/></>,
    ring: <><path d="m8 3 8 0 3 4-7 6-7-6ZM5 12a8 8 0 1 0 14 0"/><path d="M5 7h14M8 3l4 10 4-10"/><path className="facet" d="m5 7 7 6-4-10Z"/></>,
    heart: <><path d="m12 6 4-3 5 3 1 6-10 9L2 12l1-6 5-3Z"/><path d="m3 6 9 15 9-15M2 12h20M8 3l4 9 4-9"/><path className="facet" d="m2 12 10 9-5-9Z"/></>,
    flower: <><path d="m12 2 4 4-1 3 5-1 2 5-5 4-3-2-2 7-5-4 1-4-6-3 3-5 5 2Z"/><path d="m12 8 4 4-4 4-4-4Z"/><path className="facet" d="m12 2 0 6 4-2Z"/></>,
    candle: <><path d="M8 11h8v10H8ZM6 21h12M12 2l3 5-3 4-3-4Z"/><path d="M12 2v9m0 3v7"/><path className="facet" d="M8 11h4v10H8Z"/></>,
    gift: nav.anniversary,
};

function Frame({ size, children, strokeWidth = 1.4 }: { size: number; children: ReactNode; strokeWidth?: number }) {
    return <Icon width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-gem-icon>
        {children}
    </Icon>;
}

export function GemNavIcon({ name, size }: { name: NavIconName; size: number }) {
    return <Frame size={size}>{nav[name]}</Frame>;
}

export function GemArrow({ width, height, stroke, isRight }: { width: number; height: number; stroke?: string; isRight: boolean }) {
    return <Icon width={width} height={Math.max(16, height)} viewBox="0 0 24 24" fill="none" stroke={stroke ?? "currentColor"}
        strokeWidth="1.35" strokeLinejoin="round" aria-hidden="true" focusable="false" data-gem-icon>
        <g transform={isRight ? undefined : "translate(24 0) scale(-1 1)"}>
            <path d="m8 5 8 7-8 7 3-7Z"/><path className="facet" d="m8 5 8 7h-5Z"/>
        </g>
    </Icon>;
}

export function GemAnniversaryIcon({ name, size = 16, strokeWidth }: { name?: string | null; size?: number; strokeWidth?: number }) {
    return <Frame size={size} strokeWidth={strokeWidth}>{anniversary[resolveIconKey(name) as AnniversaryIconKey]}</Frame>;
}

const cuts = ["M17 5H35L47 17V35L35 47H17L5 35V17Z", "M16 5H36L48 21 26 48 4 21Z", "M26 3 46 17V35L26 49 6 35V17Z"];
const facets = [
    "M17 15H35L39 26 35 37H17L13 26ZM17 15 17 5m18 10V5m4 21 8-9m-8 9 8 9m-12 2v10m-18-10v10m-4-21-8 9m8-9-8-9",
    "M4 21H48M16 5l-2 16 12 27 12-27-2-16M14 21 26 5l12 16",
    "M26 3 16 20v12l10 17 10-17V20ZM6 17l10 3h20l10-3M6 35l10-3h20l10 3",
];

export const GemChallengeSticker = memo(function GemChallengeSticker({ isFilled, idx }: { isFilled: boolean; idx: number }) {
    const id = useId();
    const color = useSettingStore(state => state.gemColor);
    const toneId = `${id}-tone`;
    const ramp = materialRamp(color, "light", "cut");
    const table = (channel: number) => ramp.map(stop => (stop[channel] / 255).toFixed(5)).join(" ");
    const cut = cuts[idx % cuts.length];
    return <Sticker viewBox="0 0 52 52" width="100%" height="100%" aria-hidden="true" focusable="false"
        data-filled={isFilled ? "true" : "false"} data-gem-sticker>
        <defs>
            <clipPath id={id}><path d={cut}/></clipPath>
            {isFilled && <filter id={toneId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feComponentTransfer>
                    <feFuncR type="table" tableValues={table(0)} />
                    <feFuncG type="table" tableValues={table(1)} />
                    <feFuncB type="table" tableValues={table(2)} />
                </feComponentTransfer>
            </filter>}
        </defs>
        <path d={cut} className="setting"/>
        {isFilled && <image href={vein.src} x="0" y="0" width="80" height="52" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} filter={`url(#${toneId})`}/>}
        <path d={cut} className="rim"/>
        <path d={facets[idx % facets.length]} className="facets" clipPath={`url(#${id})`}/>
        {isFilled && <path d="m18 26 6 6 11-13" className="complete"/>}
    </Sticker>;
});
