import type { MaterialRole, MaterialFinish } from "./materialPalette";

export type MaterialCrop = {
    source: "cut" | "quartz" | "pearl" | "geode";
    role: MaterialRole;
    finish: MaterialFinish;
    left: number;
    top: number;
    width: number;
    height: number;
};

/** Native source regions, composed at different scales. Never upscale a moodboard thumbnail. */
export const materialCrops = {
    action: { source: "cut", role: "cut", finish: "ornament", left: 440, top: 110, width: 700, height: 280 },
    control: { source: "pearl", role: "pearl", finish: "reading", left: 620, top: 310, width: 360, height: 360 },
    event: { source: "cut", role: "cut", finish: "reading", left: 100, top: 330, width: 1000, height: 280 },
    calendar: { source: "quartz", role: "quartz", finish: "reading", left: 210, top: 170, width: 920, height: 710 },
    heading: { source: "cut", role: "quartz", finish: "reading", left: 50, top: 70, width: 1220, height: 400 },
    panel: { source: "cut", role: "quartz", finish: "reading", left: 0, top: 180, width: 700, height: 600 },
    field: { source: "pearl", role: "pearl", finish: "reading", left: 680, top: 360, width: 680, height: 230 },
    record: { source: "pearl", role: "pearl", finish: "reading", left: 610, top: 270, width: 690, height: 540 },
    ground: { source: "pearl", role: "quartz", finish: "reading", left: 0, top: 110, width: 1536, height: 820 },
    inlay: { source: "geode", role: "geode", finish: "ornament", left: 80, top: 1030, width: 900, height: 290 },
    navigation: { source: "cut", role: "quartz", finish: "reading", left: 20, top: 130, width: 460, height: 250 },
    timeline: { source: "pearl", role: "pearl", finish: "reading", left: 400, top: 300, width: 900, height: 560 },
    homeHero: { source: "cut", role: "quartz", finish: "relief", left: 80, top: 303, width: 1420, height: 500 },
    homeQuartz: { source: "quartz", role: "quartz", finish: "relief", left: 270, top: 250, width: 660, height: 535 },
    homePearl: { source: "pearl", role: "pearl", finish: "relief", left: 0, top: 510, width: 1090, height: 510 },
} as const satisfies Record<string, MaterialCrop>;

export type MaterialCropName = keyof typeof materialCrops;
