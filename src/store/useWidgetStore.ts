import { create } from "zustand";
import { persist } from "zustand/middleware";
import {normalizeWidgetAppearance,type WidgetAppearance} from '@/lib/widgetAppearance';

import { normalizeWidgetBackground, type WidgetBgSettings } from '@/lib/widgetBackground';
export type { BgMode, WidgetBgSettings } from '@/lib/widgetBackground';
export type WidgetPriority = "top" | "normal" | "bottom";

export interface WidgetSettings {
    bg: WidgetBgSettings;
    priority: WidgetPriority;
    appearance?: WidgetAppearance;
}

const defaultBg: WidgetBgSettings = { mode: "theme", opacity: 0.92, glassBlur: 36.8, customColor: "#1a160e", autoTextColor: true };

// 목록은 lib/widgetKinds.ts 한 곳에서만 정한다.
export type { WidgetKind } from "@/lib/widgetKinds";
import type { WidgetKind } from "@/lib/widgetKinds";

type WidgetStore = Record<WidgetKind, WidgetSettings> & {
    update: (kind: WidgetKind, patch: Partial<WidgetSettings>) => void;
    updateBg: (kind: WidgetKind, patch: Partial<WidgetBgSettings>) => void;
    updatePriority: (kind: WidgetKind, priority: WidgetPriority) => void;
    updateAppearance: (kind: WidgetKind, patch: Partial<WidgetAppearance>) => void;
};

const useWidgetStore = create<WidgetStore>()(
    persist(
        (set) => ({
            weekly:       { bg: { ...defaultBg }, priority: "top" },
            monthly:      { bg: { ...defaultBg }, priority: "top" },
            today:        { bg: { ...defaultBg }, priority: "top" },
            nownext:      { bg: { ...defaultBg }, priority: "top" },
            due:          { bg: { ...defaultBg }, priority: "top" },
            stats:        { bg: { ...defaultBg }, priority: "top" },
            challenge:    { bg: { ...defaultBg }, priority: "top" },
            projects:     { bg: { ...defaultBg }, priority: "top" },
            anniversary:  { bg: { ...defaultBg }, priority: "top" },
            memo:         { bg: { ...defaultBg }, priority: "top" },
            quicktask:    { bg: { ...defaultBg }, priority: "top" },

            update: (kind, patch) =>
                set((s) => ({ [kind]: { ...s[kind], ...patch } })),

            updateBg: (kind, patch) =>
                set((s) => ({
                    [kind]: {
                        ...s[kind],
                        bg: normalizeWidgetBackground({ ...normalizeWidgetBackground(s[kind].bg), ...patch }),
                    },
                })),

            updatePriority: (kind, priority) =>
                set((s) => ({ [kind]: { ...s[kind], priority } })),
            updateAppearance: (kind,patch) => set(s=>({[kind]:{...s[kind],appearance:normalizeWidgetAppearance({...normalizeWidgetAppearance(s[kind].appearance),...patch})}})),
        }),
        { name: "cronos-widget-settings" }
    )
);

/**
 * 위젯 창마다 이 스토어를 따로 들고, 저장할 때는 모든 위젯의 설정을 통째로 쓴다.
 * 다른 창이 쓴 것을 다시 읽지 않으면 — 오늘 위젯을 유리로 바꾼 뒤 메모 위젯의 투명도를 만지면
 * 메모 창의 낡은 사본(오늘=테마)이 그 위를 덮어써, 다음에 켤 때 오늘 위젯이 테마 바탕으로 돌아갔다.
 */
if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key === "cronos-widget-settings" && e.newValue) void useWidgetStore.persist.rehydrate();
    });
}

export default useWidgetStore;
