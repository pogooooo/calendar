"use client";

import { useEffect, useState } from "react";
import { localDateKey } from "@/lib/dateKey";
import useSettingStore from "@/store/useSettingStore";

/**
 * 자정을 넘기면 갱신되는 '오늘' 날짜 키.
 * 마운트 시점 날짜에 고정하면 자정 이후 어제 내용을 오늘 날짜로 저장하게 된다.
 */
export function useCurrentDayKey(): string {
    const timezone = useSettingStore(s => s.timezone);
    const [key, setKey] = useState(() => localDateKey(new Date()));

    useEffect(() => {
        const tick = () => {
            const next = localDateKey(new Date());
            setKey(prev => (prev === next ? prev : next));
        };
        const id = window.setInterval(tick, 30000);
        tick();
        window.addEventListener("focus", tick);
        document.addEventListener("visibilitychange", tick);
        return () => {
            window.clearInterval(id);
            window.removeEventListener("focus", tick);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [timezone]);

    return key;
}
