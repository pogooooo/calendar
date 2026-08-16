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

export async function mirrorWidgetStateToFile(): Promise<void> {
    if (!isDesktop()) return;
    try {
        const state = JSON.stringify(collect());
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("save_widget_state", { state });
    } catch {}
}

export async function hydrateWidgetStateFromFile(): Promise<void> {
    if (!isDesktop()) return;
    try {
        const { invoke } = await import("@tauri-apps/api/core");
        const raw = await invoke<string>("load_widget_state");
        const state = JSON.parse(raw) as Record<string, string>;

        // 이미 있는 값이 우선이다. 없는 항목만 파일에서 메꾼다.
        // (전부 건너뛰면 좌표만 날아간 경우를 영영 복구하지 못한다)
        for (const [k, v] of Object.entries(state)) {
            if (typeof v !== "string") continue;
            if (!k.startsWith(OPEN_PREFIX) && !k.startsWith(BOUNDS_PREFIX)) continue;
            if (localStorage.getItem(k) !== null) continue;
            localStorage.setItem(k, v);
        }
    } catch {}
}
