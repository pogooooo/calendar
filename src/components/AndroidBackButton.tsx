"use client";

import * as React from "react";
import { isMobileShell } from "@/lib/platform";

/**
 * 안드로이드의 뒤로 단추 — 창(아래에서 올라오는 시트·확인 대화상자)이 떠 있으면 그것부터 닫는다.
 *
 * 듣는 이가 없으면 Tauri 는 웹뷰 기록을 한 칸 뒤로 가거나(없으면 앱을 내린다). 그래서 할 일 추가 시트를 연 채
 * 뒤로를 누르면 시트는 닫히지 않고 앞 화면으로 넘어가거나 앱이 내려가, 쓰던 것이 함께 사라졌다.
 *
 * 창이 떠 있는 동안에만 듣는다. 늘 들으면 Tauri 의 기본 동작이 꺼져, 맨 앞 화면에서 뒤로를 눌러도 앱을 내릴 길이 없다.
 * 닫기는 Escape 로 한다 — BaseModal·Dialog 가 그것으로 맨 위 창 하나만 닫는다.
 * 창은 둘 다 body 바로 아래에 붙으므로(createPortal) body 의 자식만 지켜본다.
 */
export default function AndroidBackButton() {
    React.useEffect(() => {
        if (!isMobileShell()) return;
        let listener: { unregister: () => Promise<void> } | null = null;
        let busy = false;
        let disposed = false;

        const sync = async () => {
            if (busy) return;
            const open = !disposed && !!document.querySelector('[aria-modal="true"]');
            if (open && !listener) {
                busy = true;
                try {
                    const { onBackButtonPress } = await import("@tauri-apps/api/app");
                    listener = await onBackButtonPress(() => {
                        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }));
                    });
                } catch {
                    // 이 Tauri 가 뒤로 단추를 넘겨주지 못하면 예전 동작 그대로
                } finally {
                    busy = false;
                }
                void sync(); // 붙이는 사이에 창이 닫혔으면 곧바로 놓는다
            } else if (!open && listener) {
                const l = listener;
                listener = null;
                busy = true;
                try { await l.unregister(); } catch { /* 이미 없다 */ } finally { busy = false; }
                void sync();
            }
        };

        const mo = new MutationObserver(() => { void sync(); });
        mo.observe(document.body, { childList: true });
        void sync();
        return () => {
            disposed = true;
            mo.disconnect();
            void sync();
        };
    }, []);

    return null;
}
