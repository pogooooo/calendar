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

interface WidgetStore {
    daily:   WidgetSettings;
    weekly:  WidgetSettings;
    monthly: WidgetSettings;
    update: (kind: "daily" | "weekly" | "monthly", patch: Partial<WidgetSettings>) => void;
    updateBg: (kind: "daily" | "weekly" | "monthly", patch: Partial<WidgetBgSettings>) => void;
    updatePriority: (kind: "daily" | "weekly" | "monthly", priority: WidgetPriority) => void;
}

const useWidgetStore = create<WidgetStore>()(
    persist(
        (set) => ({
            daily:   { bg: { ...defaultBg }, priority: "top" },
            weekly:  { bg: { ...defaultBg }, priority: "top" },
            monthly: { bg: { ...defaultBg }, priority: "top" },

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
