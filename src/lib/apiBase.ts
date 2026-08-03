export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export const isDesktopApp = () =>
    typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const api = (path: string) =>
    path.startsWith("http") ? path : `${API_BASE}${path}`;

export const clientHeaders = (): Record<string, string> =>
    isDesktopApp() ? { "X-Client": "desktop" } : {};
