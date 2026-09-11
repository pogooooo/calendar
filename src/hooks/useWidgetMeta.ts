"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import type { WidgetKind } from "@/lib/widgetKinds";

export interface WidgetMeta {
    /** 설정 목록과 위젯 제목줄에 함께 쓰는 이름 */
    label: string;
    desc: string;
    group: string;
}

/**
 * 위젯 이름·설명·묶음의 유일한 출처.
 *
 * 예전에는 설정 목록에만 이름이 있고 위젯 창 제목은 페이지마다 한국어가 박혀 있었다.
 * 언어를 영어로 바꾸면 목록만 번역되고 창 제목은 한국어로 남았다.
 *
 * Record<WidgetKind, …> 라 위젯 종류를 늘리면 여기서 컴파일이 멈춘다.
 */
export function useWidgetMeta(): Record<WidgetKind, WidgetMeta> {
    const t = useT();
    return React.useMemo(() => ({
        today:       { label: t.widget.todayW,       desc: t.widget.todayWDesc,       group: t.widget.groupTodo },
        quicktask:   { label: t.widget.quicktaskW,   desc: t.widget.quicktaskWDesc,   group: t.widget.groupTodo },
        due:         { label: t.widget.dueW,         desc: t.widget.dueWDesc,         group: t.widget.groupTodo },
        nownext:     { label: t.widget.nowNextW,     desc: t.widget.nowNextWDesc,     group: t.widget.groupCalendar },
        weekly:      { label: t.widget.weekly,       desc: t.widget.weeklyDesc,       group: t.widget.groupCalendar },
        monthly:     { label: t.widget.monthly,      desc: t.widget.monthlyDesc,      group: t.widget.groupCalendar },
        anniversary: { label: t.widget.anniversaryW, desc: t.widget.anniversaryWDesc, group: t.widget.groupCalendar },
        projects:    { label: t.widget.projectsW,    desc: t.widget.projectsWDesc,    group: t.widget.groupRecord },
        challenge:   { label: t.widget.challengeW,   desc: t.widget.challengeWDesc,   group: t.widget.groupRecord },
        stats:       { label: t.widget.statsW,       desc: t.widget.statsWDesc,       group: t.widget.groupRecord },
        memo:        { label: t.widget.memoW,        desc: t.widget.memoWDesc,        group: t.widget.groupRecord },
    }), [t]);
}

/** 위젯 창 제목줄 — 어느 앱의 창인지 밝히고 이름을 붙인다 */
export function useWidgetTitle(kind: WidgetKind): string {
    return `CRONOS  ·  ${useWidgetMeta()[kind].label}`;
}
