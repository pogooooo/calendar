const OPEN_PREFIX = "cronos-widget-open:";
const BOUNDS_PREFIX = "cronos-widget-bounds:";

function isDesktop() {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function collect(): Record<string, string> {
    const state: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) ?? "";
        if (key.startsWith(OPEN_PREFIX) || key.startsWith(BOUNDS_PREFIX)) {
            state[key] = localStorage.getItem(key) ?? "";
        }
    }
    return state;
}

export function mirrorWidgetStateToFile() {
    if (!isDesktop()) return;
    try {
        const state = JSON.stringify(collect());
        import("@tauri-apps/api/core").then(({ invoke }) => {
            invoke("save_widget_state", { state }).catch(() => {});
        });
    } catch {}
}

export async function hydrateWidgetStateFromFile(): Promise<void> {
    if (!isDesktop()) return;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            if ((localStorage.key(i) ?? "").startsWith(OPEN_PREFIX)) return;
        }
        const { invoke } = await import("@tauri-apps/api/core");
        const raw = await invoke<string>("load_widget_state");
        const state = JSON.parse(raw) as Record<string, string>;
        for (const [k, v] of Object.entries(state)) {
            if (typeof v !== "string") continue;
            if (k.startsWith(OPEN_PREFIX) || k.startsWith(BOUNDS_PREFIX)) {
                localStorage.setItem(k, v);
            }
        }
    } catch {}
}
