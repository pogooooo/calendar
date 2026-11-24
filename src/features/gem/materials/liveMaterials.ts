import cut from "./generated/cut.webp";
import quartzLight from "./generated/quartz-light.webp";
import quartzDark from "./generated/quartz-dark.webp";
import pearlLight from "./generated/pearl-light.webp";
import pearlDark from "./generated/pearl-dark.webp";
import geodeLight from "./generated/geode-light.webp";
import geodeDark from "./generated/geode-dark.webp";
import gold from "./generated/gold.webp";
import silver from "./generated/silver.webp";
import rawCut from "./cut-neutral.webp";
import rawQuartz from "./quartz-neutral.webp";
import rawPearl from "./pearl-neutral.webp";
import rawGeode from "./geode-neutral.webp";
import cutGloss from "./cut-gloss.webp";
import quartzGloss from "./quartz-gloss.webp";
import pearlGloss from "./pearl-gloss.webp";
import type { MaterialMode, MaterialRole } from "./materialPalette";
import type { MaterialCropName } from "./materialCrops";
import { cropTextures } from "./cropTextures";

export const neutralMaterials = { cut: rawCut, quartz: rawQuartz, pearl: rawPearl, geode: rawGeode };
export type MaterialKey = MaterialRole | MaterialCropName;
export const materialBindings: Record<string, MaterialKey> = {
    "--gem-pearl-map": "record", "--gem-calendar-map": "heading", "--gem-quiet-facet-map": "ground",
    "--gem-gold-vein-map": "event", "--gem-geode-map": "geode", "--gem-quartz-map": "panel",
    "--gem-calendar-quartz-map": "calendar", "--gem-refraction-map": "control", "--gem-action-map": "action",
    "--gem-neutral-action-map": "action", "--gem-neutral-control-map": "field", "--gem-amethyst-cut-map": "event",
    "--gem-heading-map": "heading", "--gem-field-map": "field", "--gem-control-map": "control",
    "--gem-ground-map": "ground", "--gem-event-map": "event",
    "--gem-navigation-map": "navigation", "--gem-timeline-map": "timeline",
    "--gem-home-hero-map": "homeHero", "--gem-home-quartz-map": "homeQuartz", "--gem-home-pearl-map": "homePearl",
    "--gem-gold-map": "gold", "--gem-silver-map": "silver",
};
export const materialMasks = {
    "--gem-lustre-map": cutGloss.src, "--gem-cut-gloss": cutGloss.src,
    "--gem-quartz-gloss": quartzGloss.src, "--gem-pearl-gloss": pearlGloss.src,
};
export function defaultMaterialUrls(mode: MaterialMode): Record<MaterialKey, string> {
    const crops = Object.fromEntries(Object.entries(cropTextures).map(([name, variants]) => [name, variants[mode].src])) as Record<MaterialCropName, string>;
    return { cut: cut.src, quartz: (mode === "dark" ? quartzDark : quartzLight).src,
        pearl: (mode === "dark" ? pearlDark : pearlLight).src, geode: (mode === "dark" ? geodeDark : geodeLight).src,
        gold: gold.src, silver: silver.src, ...crops };
}
