import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BgMode = "theme" | "glass" | "custom";
export type WidgetPriority = "top" | "normal" | "bottom";

export interface WidgetBgSettings {
    mode: BgMode;
    opacity: number;       // 0–1
    customColor: string;   // hex, mode=custom일 때
    autoTextColor: boolean; // 배경 밝기에 따라 글자색 자동 조정
    gloss?: boolean;
    liquid?: boolean;
}

export interface WidgetSettings {
    bg: WidgetBgSettings;
    priority: WidgetPriority;
}

const defaultBg: WidgetBgSettings = { mode: "theme", opacity: 0.92, customColor: "#1a160e", autoTextColor: true };

export type WidgetKind =
    | "daily" | "weekly" | "monthly"
    | "today" | "upcoming" | "stats" | "challenge"
    | "projectboard" | "projectdetail" | "projecttimeline"
    | "memo" | "quicktask" | "sticker" | "category";

type WidgetStore = Record<WidgetKind, WidgetSettings> & {
    update: (kind: WidgetKind, patch: Partial<WidgetSettings>) => void;
    updateBg: (kind: WidgetKind, patch: Partial<WidgetBgSettings>) => void;
    updatePriority: (kind: WidgetKind, priority: WidgetPriority) => void;
};

const useWidgetStore = create<WidgetStore>()(
    persist(
        (set) => ({
            daily:   { bg: { ...defaultBg }, priority: "top" },
            weekly:  { bg: { ...defaultBg }, priority: "top" },
            monthly: { bg: { ...defaultBg }, priority: "top" },
            today:     { bg: { ...defaultBg }, priority: "top" },
            upcoming:  { bg: { ...defaultBg }, priority: "top" },
            stats:     { bg: { ...defaultBg }, priority: "top" },
            challenge: { bg: { ...defaultBg }, priority: "top" },
            projectboard:  { bg: { ...defaultBg }, priority: "top" },
            projectdetail: { bg: { ...defaultBg }, priority: "top" },
            projecttimeline: { bg: { ...defaultBg }, priority: "top" },
            memo:      { bg: { ...defaultBg }, priority: "top" },
            quicktask: { bg: { ...defaultBg }, priority: "top" },
            sticker:   { bg: { ...defaultBg }, priority: "top" },
            category:  { bg: { ...defaultBg }, priority: "top" },

            update: (kind, patch) =>
                set((s) => ({ [kind]: { ...s[kind], ...patch } })),

            updateBg: (kind, patch) =>
                set((s) => ({
                    [kind]: {
                        ...s[kind],
                        bg: { ...s[kind].bg, ...patch },
                    },
                })),

            updatePriority: (kind, priority) =>
                set((s) => ({ [kind]: { ...s[kind], priority } })),
        }),
        { name: "cronos-widget-settings" }
    )
);

export default useWidgetStore;
