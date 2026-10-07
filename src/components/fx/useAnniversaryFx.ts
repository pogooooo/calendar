"use client";
/**
 * 오늘이 기념일이면 갈래가 하루에 한 번 축하한다 — 홈·기념일 화면이 그 기념일을 보여 줄 때.
 * 두 화면을 오가도, 다시 열어도 그날은 한 번만(이 기기에서). 오늘 기념일을 새로 넣으면 그것으로 한 번 더.
 * 화면이 자리 잡은 뒤, 그 기념일 줄([data-fx-anchor="anniversary-today"])이 보이면 그 자리에서 터진다.
 */
import { useEffect } from "react";
import { fx, rectOf } from "@/lib/fx";
import { localDateKey } from "@/lib/dateKey";

const KEY = "cronos-fx-anniversary";

export default function useAnniversaryFx(todayIds: string[]) {
    const sig = todayIds.join(",");
    useEffect(() => {
        if (!sig) return;
        const mark = `${localDateKey(new Date())}:${sig}`;
        try { if (localStorage.getItem(KEY) === mark) return; } catch { return; }
        // 화면 옮김의 들어오는 움직임이 끝난 뒤에
        const timer = setTimeout(() => {
            if (document.hidden) return;
            try { localStorage.setItem(KEY, mark); } catch { /* 못 적으면 다음에 또 축하할 뿐 */ }
            const rect = rectOf(document.querySelector('[data-fx-anchor="anniversary-today"]'));
            fx.emit("anniversary", rect ? { rect, x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 } : {});
        }, 900);
        return () => clearTimeout(timer);
    }, [sig]);
}
