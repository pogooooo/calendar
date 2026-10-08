import { persist } from "zustand/middleware";
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import { create } from "zustand/react";
import type { AuthFetch } from '@/types';
import type { Locale } from '@/i18n/types';
import { DEFAULT_TIMEZONE, detectTimeZone, isValidTimeZone } from '@/lib/timezone';

interface SettingState {
    theme: string;
    themeOptions: Record<string, string>;
    locale: Locale;
    timezone: string;
    autostart: boolean;
    font: string;
    fontSize: string;
    fontWeight: string;
    motion: 'full' | 'gentle' | 'off';
    setMotion: (motion: 'full' | 'gentle' | 'off') => void;
    isLoading: boolean;
    setTheme: (inputTheme: string) => void;
    setThemeOption: (themeId: string, option: string) => void;
    setLocale: (locale: Locale) => void;
    setTimezone: (tz: string) => void;
    setAutostart: (enabled: boolean) => void;
    setFont: (font: string) => void;
    setFontSize: (size: string) => void;
    setFontWeight: (weight: string) => void;
    updateTheme: (authFetch: AuthFetch, inputTheme: string) => Promise<void>;
    fetchSettings: (authFetch: AuthFetch) => Promise<void>;
}

/** 이 창에서 테마를 고른 횟수 — 고르기 전에 나간 읽기가 늦게 돌아와 옛 테마로 되돌리지 않게 */
let themeEdits = 0;

/** 지금 갈래를 바꾸면 하던 일이 날아가는가 — 창(대화상자)이 열려 있거나 글을 치는 중 */
const busy = () => {
    if (typeof document === "undefined") return false;
    if (document.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal="true"]')) return true;
    const a = document.activeElement as HTMLElement | null;
    return !!a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable);
};
let deferTimer: ReturnType<typeof setInterval> | undefined;

const useSettingStore = create<SettingState>()(
    persist(
        (set, get) => ({
            theme: 'celestial',
            themeOptions: {},
            locale: 'ko' as Locale,
            // 처음 켜는 기기는 그 기기의 시간대로 시작한다 (저장된 값이 있으면 그것이 이긴다).
            // 예전엔 늘 서울이라, 다른 시간대의 사람은 홈의 '오늘'이 하루 어긋났다 — 로스앤젤레스면 아침 8시부터 내일이 오늘로 떴다
            timezone: typeof window === "undefined" ? DEFAULT_TIMEZONE : detectTimeZone(),
            autostart: true,
            font: 'default',
            fontSize: 'md',
            fontWeight: 'normal',
            motion: 'full',
            setMotion: (motion) => set({ motion }),
            isLoading: false,

            setTheme: (inputTheme) => set({ theme: inputTheme }),
            setThemeOption: (themeId, option) =>
                set((s) => ({ themeOptions: { ...s.themeOptions, [themeId]: option } })),
            setLocale: (locale) => set({ locale }),
            setTimezone: (tz) => set({ timezone: isValidTimeZone(tz) ? tz : DEFAULT_TIMEZONE }),
            setAutostart: (enabled) => set({ autostart: enabled }),
            setFont: (font) => set({ font }),
            setFontSize: (fontSize) => set({ fontSize }),
            setFontWeight: (fontWeight) => set({ fontWeight }),

            fetchSettings: async (authFetch) => {
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce("setting", READ_TTL, async () => {
                    set({ isLoading: true });
                    const edits = themeEdits;
                    try {
                        const res = await authFetch('/api/setting');
                        if (res.ok) {
                            const data = await res.json();
                            // 읽는 사이에 테마를 골랐으면 그 값이 맞다 (서버에는 PATCH 가 따로 간다)
                            const next = edits === themeEdits && typeof data.theme === 'string' && data.theme ? data.theme as string : null;
                            clearInterval(deferTimer);
                            if (next && next !== get().theme && busy()) {
                                // 다른 기기에서 바꾼 테마 — 갈래가 바뀌면 화면이 통째로 다시 그려져, 열린 창에 치던 글·고른 날이 사라졌다.
                                // 손을 놓을 때(창을 닫고 칸을 떠날 때)까지 미룬다. 그사이 이 창에서 고르면 그쪽이 이긴다
                                deferTimer = setInterval(() => {
                                    if (edits !== themeEdits) { clearInterval(deferTimer); return; }
                                    if (busy()) return;
                                    clearInterval(deferTimer);
                                    set({ theme: next });
                                }, 1500);
                                set({ isLoading: false });
                            } else if (next) set({ theme: next, isLoading: false });
                            else set({ isLoading: false });
                        } else {
                            set({ isLoading: false });
                        }
                    } catch (err) {
                        console.error("[SETTINGS_FETCH_ERROR]", err);
                        set({ isLoading: false });
                    }
        });
            },

            updateTheme: async (authFetch, inputTheme) => {
                const prev = get().theme;
                themeEdits += 1;
                set({ theme: inputTheme });
                // 서버가 받지 않으면 다음 읽기가 옛 테마로 조용히 되돌린다 — 지금 되돌리고 알린다
                const undo = () => {
                    if (get().theme === inputTheme) set({ theme: prev });
                    reportSaveFailure("setting");
                };
                try {
                    const res = await authFetch('/api/setting', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ theme: inputTheme }),
                    });
                    if (!res.ok) undo();
                } catch (err) {
                    console.error("[SETTINGS_UPDATE_ERROR]", err);
                    undo();
                }
            }
        }),
        { name: "setting-store" }
    )
);

/**
 * 다른 창(위젯 창·다른 탭)이 설정을 바꾸면 이 창도 그걸 다시 읽는다 (persist 는 창끼리 맞춰 주지 않는다).
 * 예전에는 위젯 창이 언어만 골라 받으면서 setLocale 로 제 낡은 설정 전체를 저장소에 되써서,
 * 위젯이 떠 있으면 본 창에서 바꾼 밝기·글꼴·크기·시간대가 곧바로 저장소에서 지워져 다음에 켤 때 되돌아갔다.
 * 다시 읽기(rehydrate)는 저장소에 쓰지 않으므로 창끼리 되쓰기가 오가지 않는다.
 */
if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key === "setting-store" && e.newValue) void useSettingStore.persist.rehydrate();
    });
}

export default useSettingStore;
