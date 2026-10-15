"use client";

import * as React from "react";
import type { MonthArchProps } from "../parts/MonthArch";
import { labelKey, localDateKey } from "@/lib/dateKey";
import { useSwapMotion } from "@/hooks/useMotion";
import { useT } from "@/i18n/useT";
import useSettingStore from "@/store/useSettingStore";
import * as S from "./MapleMonthArch.styles";

/** 막대가 이보다 길어지지 않는다 — 하루 일정이 여섯을 넘으면 다 같은 "꽉 찬 날" */
const MAX_LOAD = 6;

/**
 * Maple 의 달 — 노트 첫머리에 적은 날짜와 그달의 막대 띠.
 * 위: 작은 꼬리표(오늘·요일)와 명조로 크게 쓴 "10월 15일".
 * 아래: 날마다 둥근 막대 하나 — 그날 일정이 많을수록 길고 짙게 물든다(노랑 → 호박빛 → 주황). 지난날은 옅게,
 *   보는 날은 단풍 붉음에 수채 잎 한 장을 얹는다. 기념일은 분홍빛 막대, 마감이 있는 날은 막대 밑에 점.
 * 요약 한 줄(10월 · 남은 n · 끝낸 n)은 HomeView 의 ArchFoot 이 띠 아래에 붙는다. 셋은 MapleHomeLayout 머리의 격자에 바로 선다
 *   (이 칸과 ArchWrap 은 display: contents).
 * 2026-10-15 다시 그리며 놋쇠 해시계 그림(gauge-dial.webp)과 바늘을 걷었다 — 그림 한 장이 화면 위쪽을 다 차지하고 날짜를 읽을 수 없었다.
 */
export default function MapleMonthArch({ daysInMonth, focusIdx, monthLoad, marks, focus }: MonthArchProps) {
    const t = useT();
    const locale = useSettingStore((s) => s.locale) === "en" ? "en" : "ko";
    const fmt = React.useMemo(() => ({
        date: new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }),
        weekday: new Intl.DateTimeFormat(locale, { weekday: "long" }),
    }), [locale]);
    // focus 는 칸 Date(고른 시간대의 날) — 오늘도 고른 시간대로 견준다
    const isToday = !!focus && labelKey(focus) === localDateKey(new Date());
    // 날을 옮기면 큰 날짜가 오는 쪽에서 들어온다 (다음 날이면 오른쪽에서)
    const titleRef = React.useRef<HTMLDivElement>(null);
    useSwapMotion(focus ? labelKey(focus) : null, titleRef, { size: "line" });

    const anniversary = new Set(marks.filter((m) => m.kind === "anv").map((m) => m.day - 1));
    const due = new Set(marks.filter((m) => m.kind === "due").map((m) => m.day - 1));
    // 일정이 많을수록 짙게 물든다 — 노란 잎(1~2)·호박빛(3~4)·주황(5~)
    const tone = (n: number) => (n >= 5 ? "l3" : n >= 3 ? "l2" : n > 0 ? "l1" : "");
    const bar = (i: number) => [
        i < focusIdx ? "past" : i === focusIdx ? "now" : "",
        anniversary.has(i) ? "anv" : tone(monthLoad[i] ?? 0),
        due.has(i) ? "due" : "",
    ].filter(Boolean).join(" ");

    return (
        <S.Head>
            {focus && (
                <S.Title ref={titleRef} aria-hidden="true">
                    <span className="eyebrow">{isToday ? `${t.home.today} · ` : ""}{fmt.weekday.format(focus)}</span>
                    <span className="date">{fmt.date.format(focus)}</span>
                </S.Title>
            )}
            <S.Ribbon aria-hidden="true">
                {Array.from({ length: daysInMonth }, (_, i) => (
                    <i key={i} className={bar(i)} style={{ "--load": Math.min(monthLoad[i] ?? 0, MAX_LOAD) } as React.CSSProperties} />
                ))}
            </S.Ribbon>
        </S.Head>
    );
}
