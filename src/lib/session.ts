/**
 * "로그인 유지" — 로그인 화면의 체크 하나가 세션을 어디에, 얼마나 두는지 정한다.
 *
 * 켜짐(기본): 지금까지와 같다. 토큰은 localStorage 에, 서버의 리프레시 토큰은 30일.
 * 꺼짐: 창(앱)을 닫으면 로그아웃돼 있어야 한다.
 *   - 웹: 토큰을 sessionStorage 에 둔다 → 브라우저를 닫으면 사라진다. 리프레시 쿠키도 세션 쿠키다.
 *     새 탭은 sessionStorage 를 못 보지만 쿠키는 살아 있으므로, 켤 때 한 번 쿠키로 갱신을 시도한다.
 *   - 데스크톱·안드로이드: 위젯 창들이 localStorage 를 나눠 쓰므로 sessionStorage 로는 안 된다.
 *     대신 프로세스가 새로 켜졌는지(Rust 의 launch_id) 보고, 새로 켜졌으면 세션을 버린다.
 *
 * 선택은 localStorage 에 남겨 다음 로그인 화면의 기본값이 된다.
 */
import type { StateStorage } from "zustand/middleware";
import { isDesktopApp } from "@/lib/apiBase";

const REMEMBER_KEY = "cronos-remember";
const LAUNCH_KEY = "cronos-launch-id";

export function getRemember(): boolean {
    try { return localStorage.getItem(REMEMBER_KEY) !== "0"; } catch { return true; }
}

export function setRemember(remember: boolean) {
    try { localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0"); } catch {}
}

/** 브라우저에서 "유지 안 함" 이면 sessionStorage, 그 밖에는 localStorage. */
function pickStorage(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
        return !isDesktopApp() && !getRemember() ? window.sessionStorage : window.localStorage;
    } catch { return null; }
}

/**
 * zustand persist 에 주는 저장소. 어느 쪽에 쓸지는 부를 때마다 정한다 —
 * 로그인 화면에서 체크를 바꾸면 그 다음 쓰기부터 자리가 바뀌어야 하니까.
 * 읽을 때는 둘 다 본다: 유지를 끄고 로그인한 탭은 sessionStorage 에만 있고, 켜고 로그인한 건 localStorage 에만 있다.
 */
export const authStorage: StateStorage = {
    getItem: (name) => {
        if (typeof window === "undefined") return null;
        try { return window.sessionStorage.getItem(name) ?? window.localStorage.getItem(name); } catch { return null; }
    },
    setItem: (name, value) => {
        const target = pickStorage();
        if (!target) return;
        try {
            target.setItem(name, value);
            // 다른 쪽에 남은 옛 복사본이 다음 읽기에서 먼저 잡히지 않게 지운다
            const other = target === window.localStorage ? window.sessionStorage : window.localStorage;
            other.removeItem(name);
        } catch {}
    },
    removeItem: (name) => {
        try { window.sessionStorage.removeItem(name); window.localStorage.removeItem(name); } catch {}
    },
};

/**
 * 데스크톱·안드로이드: 이 창이 새로 켜진 프로세스의 첫 창인지.
 * 첫 창이면 launch_id 를 적어 두고 true. 같은 프로세스의 다음 창(위젯)은 false.
 */
export async function isFreshLaunch(): Promise<boolean> {
    if (!isDesktopApp()) return false;
    try {
        const { invoke } = await import("@tauri-apps/api/core");
        const id = await invoke<string>("launch_id");
        const seen = localStorage.getItem(LAUNCH_KEY);
        if (seen === id) return false;
        localStorage.setItem(LAUNCH_KEY, id);
        return true;
    } catch {
        return false;
    }
}
