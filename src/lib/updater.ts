"use client";

/**
 * 데스크톱 앱의 업데이트 확인 — 한 곳에서.
 *
 * 예전에는 UpdateNotice 가 켜질 때 한 번 조용히 확인하고 끝이었다. 못 찾거나 실패하면
 * 아무 말도 없어서, 사용자는 "자동 업데이트가 안 되는 건 원래 그런가" 하고 넘겼다.
 * 이제 설정에서 손으로도 확인할 수 있고, 결과(최신이다·새 버전이 있다·실패했다)를 말로 돌려준다.
 * 새 버전을 찾으면 창 어디에 있든 UpdateNotice 가 받도록 이벤트로 알린다.
 */

export const UPDATE_FOUND_EVENT = "cronos:update-found";

export interface FoundUpdate {
    version: string;
    body?: string;
    /** 업데이트 자리의 응답 그대로 — notes_en(영어 패치 노트)이 여기 있다 */
    rawJson?: Record<string, unknown>;
    downloadAndInstall: (
        cb: (event: { event: string; data?: { contentLength?: number; chunkLength?: number } }) => void,
    ) => Promise<void>;
}

export type UpdateCheckResult =
    | { status: "available"; update: FoundUpdate }
    | { status: "latest" }
    | { status: "unsupported" }          // 브라우저·폰 — 업데이터가 없다
    | { status: "error"; message: string };

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function checkForUpdate(): Promise<UpdateCheckResult> {
    if (!isTauri()) return { status: "unsupported" };
    try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const found = await check();
        if (!found) return { status: "latest" };
        const update = found as unknown as FoundUpdate;
        window.dispatchEvent(new CustomEvent<FoundUpdate>(UPDATE_FOUND_EVENT, { detail: update }));
        return { status: "available", update };
    } catch (err) {
        // 폰(안드로이드)은 Tauri 지만 업데이터 플러그인이 없다. 그것도 "지원 안 함" 이다.
        const message = err instanceof Error ? err.message : String(err);
        if (/not (found|allowed)|plugin/i.test(message)) return { status: "unsupported" };
        return { status: "error", message };
    }
}
