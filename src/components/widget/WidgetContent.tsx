"use client";

import styled from "styled-components";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import WeekCalendar from "@/components/calendar/weekCalendar/WeekCalendar";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import { wallNow } from "@/lib/dateKey";
import type { WidgetKind } from "@/lib/widgetKinds";
import { usePickTheme } from "@/styles/themed";
import { useWidgetMeta } from "@/hooks/useWidgetMeta";
import { BookBody, BookHeading, WidgetBook } from "./maple/MapleWidgetPanels.styles";
import {
    AnniversaryPanel, ChallengePanel, DuePanel, MemoPanel, NowNextPanel,
    ProjectsPanel, QuickTaskPanel, StatsPanel, TodayPanel,
} from "./WidgetPanels";

const PANELS = {
    anniversary: AnniversaryPanel, challenge: ChallengePanel, due: DuePanel, memo: MemoPanel,
    nownext: NowNextPanel, projects: ProjectsPanel, quicktask: QuickTaskPanel, stats: StatsPanel,
    today: TodayPanel,
};

export function WidgetCalendar({ kind }: { kind: "monthly" | "weekly" }) {
    const todos = useTodoStore(state => state.todos);
    const categories = useCategoryStore(state => state.categories);

    return kind === "monthly"
        ? <MonthWrap><MonthCalendar todos={todos} categories={categories} selectedDate={wallNow()} /></MonthWrap>
        : <WeekWrap><WeekCalendar todos={todos} categories={categories} selectedDate={new Date()} /></WeekWrap>;
}

export default function WidgetContent({ kind }: { kind: WidgetKind }) {
    const book = usePickTheme({ celestial: false, maple: true, ocean: false, gem: false });
    const meta = useWidgetMeta();
    if (kind === "monthly" || kind === "weekly") return <WidgetCalendar kind={kind} />;
    const Panel = PANELS[kind];
    if (book) return <WidgetBook data-book-panel={kind}>
        <BookHeading>{meta[kind].label}</BookHeading>
        <BookBody><Panel /></BookBody>
    </WidgetBook>;
    return <PanelWrap><Panel /></PanelWrap>;
}

const PanelWrap = styled.div`height: 100%;`;
const MonthWrap = styled(PanelWrap)`
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    overflow: hidden;
`;
const WeekWrap = styled(PanelWrap)`
    min-height: 0;
    @supports not selector(::-webkit-scrollbar) {
        scrollbar-width: thin;
        scrollbar-color: ${p => p.theme.colors.primary}40 transparent;
    }
`;
