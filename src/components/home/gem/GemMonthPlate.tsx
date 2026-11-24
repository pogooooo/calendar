"use client";

import { useRef, type CSSProperties } from "react";
import { labelKey } from "@/lib/dateKey";
import { useSwapMotion } from "@/hooks/useMotion";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { useT } from "@/i18n/useT";
import useSettingStore from "@/store/useSettingStore";
import type { MonthArchProps } from "../parts/MonthArch";
import { DateTitle, MonthRibbon, RibbonTrack } from "./GemHomeLayout.styles";

export default function GemMonthPlate({ daysInMonth, focusIdx, focus, monthLoad, marks }: MonthArchProps) {
    const t = useT();
    const locale = useSettingStore(s => s.locale) === "en" ? "en" : "ko";
    const dateKey = focus ? labelKey(focus) : "";
    const monthKey = dateKey.slice(0, 7);
    const todayKey = useCurrentDayKey();
    const today = dateKey === todayKey;
    const todayIndex = todayKey.startsWith(monthKey) ? Number(todayKey.slice(8)) - 1 : -1;
    const ribbon = useRef<HTMLDivElement>(null);
    useSwapMotion(monthKey, ribbon, { contentKeys: [JSON.stringify([dateKey, todayKey, daysInMonth, monthLoad, marks])] });
    const markedDays = new Set(marks.map(mark => mark.day));
    return <>
        {focus && <DateTitle aria-hidden="true">
            <small>{today ? `${t.home.today} · ` : ""}{focus.toLocaleDateString(locale, { weekday: "long" })}</small>
            <strong>{focus.toLocaleDateString(locale, { month: "long", day: "numeric" })}</strong>
        </DateTitle>}
        <MonthRibbon aria-hidden="true">
            <RibbonTrack ref={ribbon}>
                {Array.from({ length: daysInMonth }, (_, day) => <i key={day}
                    data-active={day === focusIdx ? "" : undefined}
                    data-today={day === todayIndex ? "" : undefined}
                    data-marked={markedDays.has(day + 1) ? "" : undefined}
                    style={{ "--load": Math.min(monthLoad[day] ?? 0, 6) } as CSSProperties} />)}
            </RibbonTrack>
        </MonthRibbon>
    </>;
}
