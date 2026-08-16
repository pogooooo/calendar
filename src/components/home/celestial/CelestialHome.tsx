"use client";

import * as React from "react";
import styled, { css } from "styled-components";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Check, List, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore, { ProjectTaskType } from "@/store/useProjectStore";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DynamicSticker } from "@/assets/celestial/ChallengeStickers";
import { celestial_star, celestial_hide_scrollbar } from "@/styles/celestial_theme";
import { useT } from "@/i18n/useT";

const WeekCalendar = dynamic(
    () => import("@/components/calendar/weekCalendar/WeekCalendar"),
    { ssr: false, loading: () => <CalSkeleton>캘린더를 불러오는 중입니다...</CalSkeleton> }
);

const DAY_W = 40;
const ROW_H = 36;
const STATUS_COLOR: Record<string, string> = {
    todo: "#7A7A7A",
    in_progress: "#D4AF37",
    done: "#4E8A6D",
};

const dayKey = (v: string | number | Date) => {
    const d = new Date(v);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function CelestialHome() {
    const { todos, toggleTodo } = useTodoStore();
    const { categories } = useCategoryStore();
    const { projects, fetchProjects, updateProjectTaskStatus } = useProjectStore();
    const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
    const authFetch = useAuthFetch();
    const router = useRouter();
    const tr = useT();

    const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
    const [projectDropOpen, setProjectDropOpen] = React.useState(false);
    const [challengeView, setChallengeView] = React.useState<"list" | "sticker">("list");
    const [selectedChallengeId, setSelectedChallengeId] = React.useState<string | null>(null);
    const timelineRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        fetchProjects(authFetch);
        fetchChallenges(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) setSelectedProjectId(projects[0].id);
    }, [projects, selectedProjectId]);

    const today = new Date();
    const todayTime = React.useMemo(() => new Date().setHours(0, 0, 0, 0), []);
    const timelineDays = React.useMemo(() => {
        const start = new Date(todayTime);
        start.setDate(start.getDate() - 20);
        return Array.from({ length: 90 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
    }, [todayTime]);
    const timelineStart = timelineDays[0].getTime();

    // 의존성 배열이 없으면 매 렌더마다 실행돼 사용자가 옮긴 가로 스크롤이 오늘로 되감긴다
    const timelineCentered = React.useRef(false);
    React.useEffect(() => {
        if (timelineCentered.current || !timelineRef.current) return;
        const todayIdx = timelineDays.findIndex(d => d.getTime() === todayTime);
        if (todayIdx >= 0) {
            timelineRef.current.scrollLeft = todayIdx * DAY_W - 80;
            timelineCentered.current = true;
        }
    }, [timelineDays, todayTime]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const tasks = selectedProject?.tasks ?? [];
    const activeProjects = projects.filter(p => p.status !== "done");

    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);
    const isChallengeExpired = (c: ChallengeType) => {
        const t = c.targetCount ?? null;
        if (t === null) return false;
        const start = new Date(c.startAt);
        start.setHours(0, 0, 0, 0);
        const lastSlot = new Date(start);
        lastSlot.setDate(start.getDate() + (t - 1) * c.interval);
        lastSlot.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now > lastSlot;
    };

    const activeChallenges = challenges.filter(c => {
        const t = c.targetCount ?? null;
        if (t !== null && (c.completions?.length ?? 0) >= t) return false;
        return !isChallengeExpired(c);
    });

    const activeChallengeIds = activeChallenges.map(c => c.id).join(",");

    const tabsRef = React.useRef<HTMLDivElement>(null);
    const [tabEdges, setTabEdges] = React.useState({ left: false, right: false });

    const syncTabEdges = React.useCallback(() => {
        const el = tabsRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setTabEdges({ left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 });
    }, []);

    const scrollTabs = React.useCallback((dir: number) => {
        tabsRef.current?.scrollBy({ left: dir * 130, behavior: "smooth" });
    }, []);

    React.useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;
        syncTabEdges();
        const ro = new ResizeObserver(syncTabEdges);
        ro.observe(el);
        return () => ro.disconnect();
    }, [syncTabEdges, activeChallengeIds, challengeView]);
    React.useEffect(() => {
        const ids = activeChallengeIds ? activeChallengeIds.split(",") : [];
        if (ids.length > 0 && (!selectedChallengeId || !ids.includes(selectedChallengeId))) {
            setSelectedChallengeId(ids[0]);
        }
    }, [activeChallengeIds, selectedChallengeId]);

    const isTodayDone = (c: ChallengeType) =>
        (c.completions ?? []).some(cp => {
            const d = new Date(cp.targetDate);
            return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
        });

    const handleToggleTask = async (task: ProjectTaskType) => {
        if (!selectedProjectId) return;
        const next = task.status === "done" ? "todo" : "done";
        await updateProjectTaskStatus(authFetch, selectedProjectId, task.id, next);
    };

    const handleToggleChallenge = async (challengeId: string, date?: Date) => {
        const d = date ?? today;
        const safeDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        await toggleChallengeCompletion(authFetch, challengeId, safeDate.toISOString());
    };

    const todayKey = dayKey(today);

    const spansDay = (t: { startAt?: string | number | Date | null; endAt?: string | number | Date | null }, key: string) => {
        if (!t.startAt || !t.endAt) return false;
        return dayKey(t.startAt) <= key && key <= dayKey(t.endAt);
    };

    const isTodoDoneOn = (t: { completions?: { targetDate: string | Date }[] }, key: string) =>
        (t.completions ?? []).some(c => dayKey(c.targetDate) === key);

    const todayTodos = React.useMemo(
        () => todos.filter(t => spansDay(t, todayKey)),
        [todos, todayKey]
    );

    const upcomingTodos = React.useMemo(() => {
        const start = new Date(todayTime + 86400000);
        const end = new Date(todayTime + 86400000 * 8);
        return todos
            .filter(t => t.startAt && new Date(t.startAt) >= start && new Date(t.startAt) < end)
            .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())
            .slice(0, 6);
    }, [todos, todayTime]);

    const weekStats = React.useMemo(() => {
        const base = new Date(todayTime);
        base.setDate(base.getDate() - base.getDay());
        let total = 0;
        let done = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            const k = dayKey(d);
            todos.forEach(t => {
                if (!spansDay(t, k)) return;
                total += 1;
                if (isTodoDoneOn(t, k)) done += 1;
            });
        }
        return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    }, [todos, todayTime]);

    const categoryStats = React.useMemo(() => {
        return categories
            .map(c => ({ ...c, count: todos.filter(t => t.categoryId === c.id).length }))
            .filter(c => c.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
    }, [categories, todos]);

    const maxCatCount = categoryStats.length ? categoryStats[0].count : 1;

    const stickerChallenge = challenges.find(c => c.id === selectedChallengeId);
    const stickerSlots = React.useMemo(() => {
        if (!stickerChallenge) return [];

        const start = new Date(stickerChallenge.startAt);
        start.setHours(0, 0, 0, 0);
        const interval = stickerChallenge.interval || 1;
        const target = stickerChallenge.targetCount ?? null;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const completedSet = new Set(
            (stickerChallenge.completions ?? []).map(cp => {
                const d = new Date(cp.targetDate);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            })
        );

        const count = target !== null
            ? target
            : Math.floor(Math.max(0, (now.getTime() - start.getTime()) / 86400000) / interval) + 1;

        return Array.from({ length: count }, (_, i) => {
            const slotDate = new Date(start);
            slotDate.setDate(start.getDate() + i * interval);
            const key = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}`;
            return { idx: i, filled: completedSet.has(key), date: slotDate };
        });
    }, [stickerChallenge]);

    return (
        <PageWrapper>
            <CalSection>
                <WeekCalendar todos={todos} categories={categories} />
            </CalSection>

            <BottomGrid>

                <Panel>
                    <PanelHeader>
                        <PanelTitle>{tr.home.project}</PanelTitle>
                        <HeaderRight>
                            <ProjectSelector onClick={() => setProjectDropOpen(v => !v)}>
                                <span>{selectedProject?.title ?? tr.home.select}</span>
                                <ChevronDown size={13} />
                                {projectDropOpen && (
                                    <DropMenu>
                                        {activeProjects.map(p => (
                                            <DropItem
                                                key={p.id}
                                                $active={p.id === selectedProjectId}
                                                onClick={(e) => { e.stopPropagation(); setSelectedProjectId(p.id); setProjectDropOpen(false); }}
                                            >
                                                <StatusDot $c={STATUS_COLOR[p.status]} />
                                                {p.title}
                                            </DropItem>
                                        ))}
                                    </DropMenu>
                                )}
                            </ProjectSelector>
                            <ViewAllBtn onClick={() => router.push("/project")}>{tr.home.viewAll}</ViewAllBtn>
                        </HeaderRight>
                    </PanelHeader>

                    <PanelBody>
                        <TaskListArea>
                            <SubHeader>{tr.home.tasks}</SubHeader>
                            <TaskScroll>
                                {tasks.length === 0
                                    ? <Empty>{tr.home.noTasks}</Empty>
                                    : tasks.map(task => (
                                        <TaskRow key={task.id} $done={task.status === "done"}>
                                            <CheckBtn
                                                $done={task.status === "done"}
                                                onClick={() => handleToggleTask(task)}
                                            >
                                                {task.status === "done" && <Check size={9} strokeWidth={3} />}
                                            </CheckBtn>
                                            <TaskName $done={task.status === "done"}>{task.title}</TaskName>
                                            <TaskStatus $c={STATUS_COLOR[task.status] ?? "#7A7A7A"}>
                                                {task.status === "todo" ? "Todo" : task.status === "in_progress" ? "In Progress" : "Done"}
                                            </TaskStatus>
                                        </TaskRow>
                                    ))
                                }
                            </TaskScroll>
                        </TaskListArea>

                        <TimelineArea>
                            <SubHeader>{tr.home.timeline}</SubHeader>
                            <TimelineScroll ref={timelineRef}>
                                <TimelineContent $rows={tasks.length}>
                                    <DateRow>
                                        {timelineDays.map((d, i) => (
                                            <DateCell key={i} $isToday={d.getTime() === todayTime}>
                                                <DateNum $isToday={d.getTime() === todayTime}>{d.getDate()}</DateNum>
                                            </DateCell>
                                        ))}
                                    </DateRow>

                                    <GraphArea $rows={tasks.length}>
                                        {timelineDays.map((d, i) => (
                                            <BgCol key={i} $isToday={d.getTime() === todayTime} />
                                        ))}

                                        {tasks.map((task, idx) => {
                                            const startTs = task.startAt ? new Date(task.startAt).setHours(0, 0, 0, 0) : todayTime;
                                            const endTs = task.endAt ? new Date(task.endAt).setHours(0, 0, 0, 0) : startTs;
                                            const left = Math.floor((startTs - timelineStart) / 86400000) * DAY_W;
                                            const width = Math.max(1, Math.floor((endTs - startTs) / 86400000) + 1) * DAY_W;
                                            return (
                                                <TaskBar
                                                    key={task.id}
                                                    $left={left}
                                                    $top={idx * ROW_H}
                                                    $width={width}
                                                    $done={task.status === "done"}
                                                    title={task.title}
                                                    onClick={() => router.push("/project")}
                                                >
                                                    <span>{task.title}</span>
                                                </TaskBar>
                                            );
                                        })}
                                    </GraphArea>
                                </TimelineContent>
                            </TimelineScroll>
                        </TimelineArea>
                    </PanelBody>
                </Panel>

                <Panel>
                    <PanelHeader>
                        <PanelTitle>{tr.home.challenge}</PanelTitle>
                        <HeaderRight>
                            <ViewToggle>
                                <ToggleBtn $active={challengeView === "list"} onClick={() => setChallengeView("list")}>
                                    <List size={14} />
                                </ToggleBtn>
                                <ToggleBtn $active={challengeView === "sticker"} onClick={() => setChallengeView("sticker")}>
                                    <Sparkles size={14} />
                                </ToggleBtn>
                            </ViewToggle>
                            <ViewAllBtn onClick={() => router.push("/challenge")}>{tr.home.viewAll}</ViewAllBtn>
                        </HeaderRight>
                    </PanelHeader>

                    {challengeView === "list" ? (
                        <ChallengeScroll>
                            {activeChallenges.length === 0
                                ? <Empty style={{ padding: "14px 12px" }}>{tr.home.noChallenges}</Empty>
                                : activeChallenges.map(c => {
                                    const done = isTodayDone(c);
                                    const count = c.completions?.length ?? 0;
                                    const target = c.targetCount ?? null;
                                    const progress = target ? Math.min(100, (count / target) * 100) : null;
                                    return (
                                        <ChallengeRow key={c.id}>
                                            <ChallengeLeft>
                                                <TodayToggle
                                                    $done={done}
                                                    onClick={() => handleToggleChallenge(c.id)}
                                                >
                                                    {done && <Check size={9} strokeWidth={3} />}
                                                </TodayToggle>
                                                <ChallengeInfo>
                                                    <ChallengeName $done={done}>{c.title}</ChallengeName>
                                                    {progress !== null && (
                                                        <ProgressBar>
                                                            <ProgressFill $pct={progress} />
                                                        </ProgressBar>
                                                    )}
                                                </ChallengeInfo>
                                            </ChallengeLeft>
                                            <ChallengeCount>
                                                {target ? `${count}/${target}` : `${count}회`}
                                            </ChallengeCount>
                                        </ChallengeRow>
                                    );
                                })
                            }
                        </ChallengeScroll>
                    ) : (
                        <StickerViewWrapper>
                            <TabsShell>
                                <ChallengeTabs
                                    ref={tabsRef}
                                    onScroll={syncTabEdges}
                                    $fadeLeft={tabEdges.left}
                                    $fadeRight={tabEdges.right}
                                >
                                    {activeChallenges.map(c => (
                                        <ChallengeTab
                                            key={c.id}
                                            $active={c.id === selectedChallengeId}
                                            onClick={() => setSelectedChallengeId(c.id)}
                                        >
                                            {c.title}
                                        </ChallengeTab>
                                    ))}
                                </ChallengeTabs>

                                {tabEdges.left && (
                                    <TabArrow $side="left" onClick={() => scrollTabs(-1)}>
                                        <ChevronLeft size={13} />
                                    </TabArrow>
                                )}
                                {tabEdges.right && (
                                    <TabArrow $side="right" onClick={() => scrollTabs(1)}>
                                        <ChevronRight size={13} />
                                    </TabArrow>
                                )}
                            </TabsShell>

                            {!stickerChallenge ? (
                                <StickerContent>
                                    <Empty>{tr.home.selectChallenge}</Empty>
                                </StickerContent>
                            ) : (
                                <>
                                    <BoardMeta>
                                        <BoardCount>
                                            {tr.home.doneRatio(stickerSlots.filter(s => s.filled).length, stickerSlots.length)}
                                        </BoardCount>
                                        <BoardRail>
                                            <BoardFill
                                                $pct={stickerSlots.length === 0 ? 0 : (stickerSlots.filter(s => s.filled).length / stickerSlots.length) * 100}
                                            />
                                        </BoardRail>
                                    </BoardMeta>

                                    <StickerContent>
                                        <StickerGrid>
                                            {stickerSlots.map(s => {
                                                const slotDay = new Date(s.date); slotDay.setHours(0, 0, 0, 0);
                                                const nowDay = new Date(); nowDay.setHours(0, 0, 0, 0);
                                                return (
                                                    <StickerSlot
                                                        key={s.idx}
                                                        $filled={s.filled}
                                                        $today={slotDay.getTime() === nowDay.getTime()}
                                                        $future={slotDay.getTime() > nowDay.getTime()}
                                                        onClick={() => {
                                                            // 아직 오지 않은 날을 달성 처리할 수는 없다
                                                            if (slotDay.getTime() > nowDay.getTime()) return;
                                                            handleToggleChallenge(stickerChallenge.id, s.date);
                                                        }}
                                                        title={s.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                                    >
                                                        <SlotDay>{s.date.getDate()}</SlotDay>
                                                        <SlotArt>
                                                            <DynamicSticker isFilled={s.filled} idx={s.idx} />
                                                        </SlotArt>
                                                    </StickerSlot>
                                                );
                                            })}
                                        </StickerGrid>
                                    </StickerContent>
                                </>
                            )}
                        </StickerViewWrapper>
                    )}
                </Panel>

            </BottomGrid>

            <WidgetGrid>
                <Panel>
                    <PanelHeader>
                        <PanelTitle>{tr.home.today}</PanelTitle>
                        <ViewAllBtn onClick={() => router.push("/calendar")}>{tr.home.viewAll}</ViewAllBtn>
                    </PanelHeader>
                    <WidgetScroll>
                        {todayTodos.length === 0
                            ? <Empty>{tr.home.noTodayTodos}</Empty>
                            : todayTodos.map(t => {
                                const done = isTodoDoneOn(t, todayKey);
                                const cat = categories.find(c => c.id === t.categoryId);
                                return (
                                    <WidgetRow key={t.id}>
                                        <CheckBtn $done={done} onClick={() => toggleTodo(authFetch, t.id, new Date().toISOString())}>
                                            {done && <Check size={9} strokeWidth={3} />}
                                        </CheckBtn>
                                        <RowMark $c={cat?.color || "#D4AF37"} />
                                        <TaskName $done={done}>{t.title}</TaskName>
                                    </WidgetRow>
                                );
                            })
                        }
                    </WidgetScroll>
                </Panel>

                <Panel>
                    <PanelHeader>
                        <PanelTitle>{tr.home.upcoming}</PanelTitle>
                    </PanelHeader>
                    <WidgetScroll>
                        {upcomingTodos.length === 0
                            ? <Empty>{tr.home.noUpcoming}</Empty>
                            : upcomingTodos.map(t => {
                                const cat = categories.find(c => c.id === t.categoryId);
                                const d = new Date(t.startAt!);
                                return (
                                    <WidgetRow key={t.id}>
                                        <RowMark $c={cat?.color || "#D4AF37"} />
                                        <TaskName $done={false}>{t.title}</TaskName>
                                        <RowMeta>{d.getMonth() + 1}/{d.getDate()}</RowMeta>
                                    </WidgetRow>
                                );
                            })
                        }
                    </WidgetScroll>
                </Panel>

                <Panel>
                    <PanelHeader>
                        <PanelTitle>{tr.home.thisWeek}</PanelTitle>
                    </PanelHeader>
                    <StatBody>
                        <StatBig>{weekStats.pct}<span>%</span></StatBig>
                        <StatCaption>{tr.home.doneRatio(weekStats.done, weekStats.total)}</StatCaption>
                        <StatBar><StatFill $pct={weekStats.pct} /></StatBar>

                        <StatDivider />

                        <CatList>
                            {categoryStats.length === 0
                                ? <Empty style={{ padding: "6px 0" }}>{tr.home.noData}</Empty>
                                : categoryStats.map(c => (
                                    <CatRow key={c.id}>
                                        <RowMark $c={c.color} />
                                        <CatName>{c.name}</CatName>
                                        <CatBar><CatFill $c={c.color} $pct={(c.count / maxCatCount) * 100} /></CatBar>
                                        <CatCount>{c.count}</CatCount>
                                    </CatRow>
                                ))
                            }
                        </CatList>
                    </StatBody>
                </Panel>
            </WidgetGrid>
        </PageWrapper>
    );
}

const PageWrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: ${p => p.theme.colors.text};
    gap: 10px;
    padding: 10px 0;
`;

const WidgetGrid = styled.div`
    flex: 1.25 1 0;
    min-height: 0;
    width: min(68vw, 100%);
    min-width: min(700px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
`;

const WidgetScroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 0;
`;

const WidgetRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px 9px;
    background-color: transparent;
    background-image: linear-gradient(${p => p.theme.colors.primary}, ${p => p.theme.colors.primary});
    background-repeat: no-repeat;
    background-position: 12px calc(100% - 2px);
    background-size: 0 1px;
    transition: background-size 0.3s ease;

    &:hover { background-size: calc(100% - 24px) 1px; }
`;

const RowMark = styled.div<{ $c: string }>`
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    transform: rotate(45deg);
    background-color: ${p => p.$c};
`;

const RowMeta = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    flex-shrink: 0;
`;

const StatBody = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 12px 14px 14px;
    display: flex;
    flex-direction: column;
`;

const StatBig = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 2px;
    flex-shrink: 0;
    color: ${p => p.theme.colors.primary};

    span {
        font-size: 0.8rem;
        margin-left: 3px;
    }
`;

const StatCaption = styled.div`
    font-size: 0.7rem;
    flex-shrink: 0;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 3px;
`;

const StatBar = styled.div`
    height: 1px;
    margin-top: 7px;
    flex-shrink: 0;
    background: ${p => p.theme.colors.primary}33;
`;

/* 남는 높이만큼만 보여주고 절대 스크롤하지 않는다 */
const CatList = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

const StatFill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    transition: width 0.4s ease;
`;

const StatDivider = styled.div`
    border-top: 1px dashed ${p => p.theme.colors.primary}40;
    margin: 8px 0 6px;
    flex-shrink: 0;
`;

const CatRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
`;

const CatName = styled.span`
    font-size: 0.74rem;
    color: ${p => p.theme.colors.text};
    width: 58px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CatBar = styled.div`
    flex: 1;
    height: 1px;
    background: ${p => p.theme.colors.primary}22;
`;

const CatFill = styled.div<{ $c: string; $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.$c};
`;

const CatCount = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.68rem;
    color: ${p => p.theme.colors.textSecondary};
    flex-shrink: 0;
`;

const CalSection = styled.div`
    flex: 0 0 auto;
    width: min(68vw, 100%);
    min-width: min(700px, 100%);
    margin: 0 auto;
`;

const CalSkeleton = styled.div`
    height: 260px;
    width: 100%;
    background: ${p => p.theme.colors.surface};
    border: 1px solid ${p => p.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${p => p.theme.fonts.celestial};
    letter-spacing: 2px;
    font-size: 0.9rem;
    color: ${p => p.theme.colors.textSecondary};
`;

const BottomGrid = styled.div`
    flex: 1.1 1 0;
    min-height: 0;
    width: min(68vw, 100%);
    min-width: min(700px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 12px;
`;

const Panel = styled.div`
    border: 1px solid ${p => p.theme.colors.primary};
    background: transparent;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
`;

const PanelHeader = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid ${p => p.theme.colors.primary};
    background: transparent;
`;

const PanelTitle = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.95rem;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.textSecondary};
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ViewAllBtn = styled.button`
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 1px;
    padding: 2px 8px;
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const Empty = styled.div`
    font-size: 0.82rem;
    color: ${p => p.theme.colors.textSecondary};
    font-family: ${p => p.theme.fonts.celestial};
    letter-spacing: 1px;
    margin: auto;
    padding: 20px;
    text-align: center;
`;

const SubHeader = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    color: ${p => p.theme.colors.textSecondary};
    letter-spacing: 1px;
    padding: 6px 10px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
    flex-shrink: 0;
`;

const PanelBody = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
`;

const TaskListArea = styled.div`
    width: 220px;
    flex-shrink: 0;
    border-right: 1px solid ${p => p.theme.colors.primary}55;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const TaskScroll = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const TaskRow = styled.div<{ $done: boolean }>`
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}22;
    transition: background 0.1s;
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const CheckBtn = styled.button<{ $done: boolean }>`
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    border: 1px solid ${p => p.theme.colors.primary};
    background: ${p => p.$done ? p.theme.colors.primary : "transparent"};
    color: ${p => p.theme.colors.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
`;

const TaskName = styled.span<{ $done: boolean }>`
    flex: 1;
    font-size: 0.8rem;
    color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.text};
    text-decoration: ${p => p.$done ? "line-through" : "none"};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const StatusDot = styled.div<{ $c: string }>`
    width: 7px; height: 7px;
    border-radius: 50%;
    background: ${p => p.$c};
    flex-shrink: 0;
`;

const TaskStatus = styled.span<{ $c: string }>`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.65rem;
    color: ${p => p.$c};
    letter-spacing: 0.5px;
    flex-shrink: 0;
`;

const ProjectSelector = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    border: 1px solid ${p => p.theme.colors.primary}55;
    padding: 2px 8px;
    cursor: pointer;
    user-select: none;

    & > span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
    }

    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const DropMenu = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 160px;
    max-height: 240px;
    overflow-y: auto;
    background: ${p => p.theme.colors.background};
    border: 1px solid ${p => p.theme.colors.primary};
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);

`;

const DropItem = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 12px;
    font-size: 0.82rem;
    cursor: pointer;
    background: ${p => p.$active ? p.theme.colors.primary + "1A" : "transparent"};
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const TimelineArea = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const TimelineScroll = styled.div`
    flex: 1;
    overflow: auto;
`;

const TimelineContent = styled.div<{ $rows: number }>`
    min-width: max-content;
    min-height: ${p => p.$rows * ROW_H + 36}px;
`;

const DateRow = styled.div`
    display: flex;
    height: 36px;
    position: sticky;
    top: 0;
    background: ${p => p.theme.colors.surface};
    z-index: 5;
    border-bottom: 1px solid ${p => p.theme.colors.primary}33;
`;

const DateCell = styled.div<{ $isToday: boolean }>`
    width: ${DAY_W}px;
    min-width: ${DAY_W}px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed ${p => p.theme.colors.primary}22;
    background: ${p => p.$isToday ? p.theme.colors.primary + "11" : "transparent"};
`;

const DateNum = styled.span<{ $isToday: boolean }>`
    font-size: 0.7rem;
    font-family: ${p => p.theme.fonts.celestial};
    color: ${p => p.$isToday ? p.theme.colors.primary : p.theme.colors.textSecondary};
    font-weight: ${p => p.$isToday ? "bold" : "normal"};
    ${p => p.$isToday && `filter: drop-shadow(0 0 4px ${p.theme.colors.primary}80);`}
`;

const GraphArea = styled.div<{ $rows: number }>`
    position: relative;
    height: ${p => Math.max(p.$rows, 1) * ROW_H}px;
    display: flex;
`;

const BgCol = styled.div<{ $isToday: boolean }>`
    width: ${DAY_W}px;
    min-width: ${DAY_W}px;
    height: 100%;
    border-right: 1px dashed ${p => p.theme.colors.primary}22;
    background: ${p => p.$isToday ? p.theme.colors.primary + "11" : "transparent"};
    flex-shrink: 0;
`;

const TaskBar = styled.div<{ $left: number; $top: number; $width: number; $done: boolean }>`
    position: absolute;
    left: ${p => p.$left}px;
    top: ${p => p.$top + 4}px;
    width: ${p => p.$width}px;
    height: ${ROW_H - 8}px;
    background: ${p => p.$done ? p.theme.colors.primary + "33" : p.theme.colors.primary + "99"};
    border: 1px solid ${p => p.$done ? p.theme.colors.primary + "66" : p.theme.colors.primary};
    border-radius: 3px;
    display: flex;
    align-items: center;
    padding: 0 6px;
    cursor: pointer;
    z-index: 3;
    transition: background 0.2s;
    &:hover { background: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.surface}; }

    span {
        font-size: 0.68rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.background};
        text-decoration: ${p => p.$done ? "line-through" : "none"};
        user-select: none;
    }
`;

const ChallengeScroll = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const ChallengeRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}33;
    transition: background 0.1s;
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const ChallengeLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 1;
    min-width: 0;
`;

const TodayToggle = styled.button<{ $done: boolean }>`
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 1px solid ${p => p.theme.colors.primary};
    background: ${p => p.$done ? p.theme.colors.primary : "transparent"};
    color: ${p => p.theme.colors.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
`;

const ChallengeInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ChallengeName = styled.div<{ $done: boolean }>`
    font-size: 0.85rem;
    color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.text};
    text-decoration: ${p => p.$done ? "line-through" : "none"};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ProgressBar = styled.div`
    height: 3px;
    background: ${p => p.theme.colors.primary}33;
    margin-top: 4px;
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    transition: width 0.3s;
`;

const ChallengeCount = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    color: ${p => p.theme.colors.primary};
    letter-spacing: 1px;
    flex-shrink: 0;
    margin-left: 10px;
`;

const ViewToggle = styled.div`
    display: flex;
    border: 1px solid ${p => p.theme.colors.primary}55;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 8px;
    background: ${p => p.$active ? p.theme.colors.primary + "22" : "transparent"};
    border: none;
    color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
    cursor: pointer;
    transition: all 0.15s;
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const StickerViewWrapper = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const TabsShell = styled.div`
    position: relative;
    flex-shrink: 0;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
`;

const ChallengeTabs = styled.div<{ $fadeLeft: boolean; $fadeRight: boolean }>`
    display: flex;
    overflow-x: auto;
    ${celestial_hide_scrollbar}

    ${p => (p.$fadeLeft || p.$fadeRight) && css`
        --fade-l: ${p.$fadeLeft ? "26px" : "0px"};
        --fade-r: ${p.$fadeRight ? "26px" : "0px"};
        -webkit-mask-image: linear-gradient(
            90deg,
            transparent 0,
            #000 var(--fade-l),
            #000 calc(100% - var(--fade-r)),
            transparent 100%
        );
        mask-image: linear-gradient(
            90deg,
            transparent 0,
            #000 var(--fade-l),
            #000 calc(100% - var(--fade-r)),
            transparent 100%
        );
    `}
`;

const TabArrow = styled.button<{ $side: "left" | "right" }>`
    position: absolute;
    top: 0;
    bottom: 0;
    ${p => p.$side}: 0;
    width: 20px;
    padding: 0;
    border: none;
    background: transparent;
    color: ${p => p.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.15s, filter 0.15s;

    &:hover {
        opacity: 1;
        filter: drop-shadow(0 0 5px ${p => p.theme.colors.primary}CC);
    }
`;

const ChallengeTab = styled.button<{ $active: boolean }>`
    position: relative;
    flex-shrink: 0;
    padding: 6px 14px 8px 24px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 1px;
    border: none;
    border-right: 1px solid ${p => p.theme.colors.primary}33;
    background: transparent;
    color: ${p => p.theme.colors.text};
    opacity: ${p => p.$active ? 1 : 0.55};
    cursor: pointer;
    transition: opacity 0.15s;
    white-space: nowrap;

    &::before {
        content: "";
        position: absolute;
        left: 10px;
        top: 50%;
        margin-top: -4px;
        ${celestial_star}
        transform: scale(${p => p.$active ? 1 : 0});
        transition: transform 0.2s ease;
    }

    &::after {
        content: "";
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 3px;
        height: 1px;
        background: ${p => p.theme.colors.primary};
        transform: scaleX(${p => p.$active ? 1 : 0});
        transform-origin: left;
        transition: transform 0.25s ease;
    }

    &:hover { opacity: 1; }
`;

const BoardMeta = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border-bottom: 1px dashed ${p => p.theme.colors.primary}33;
`;

const BoardCount = styled.span`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
`;

const BoardRail = styled.div`
    flex: 1;
    height: 1px;
    background: ${p => p.theme.colors.primary}33;
`;

const BoardFill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    box-shadow: 0 0 5px ${p => p.theme.colors.primary}80;
`;

const StickerContent = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 14px 14px;
`;

const StickerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    gap: 8px;
    align-content: flex-start;
`;

const SlotDay = styled.span`
    position: absolute;
    top: 2px;
    left: 4px;
    font-size: 0.55rem;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.textSecondary};
    pointer-events: none;
`;

const SlotArt = styled.span`
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 5px;

    & svg { width: 100%; height: 100%; }
`;

const StickerSlot = styled.div<{ $filled: boolean; $today: boolean; $future: boolean }>`
    position: relative;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-sizing: border-box;
    border: 1px ${p => p.$filled ? "solid" : "dashed"} ${p => p.theme.colors.primary}${p => p.$filled ? "99" : "44"};
    opacity: ${p => p.$future ? 0.35 : p.$filled ? 1 : 0.7};
    transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;

    ${p => p.$today && css`
        border: 1px solid ${p.theme.colors.primary};

        &::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 9px;
            height: 9px;
            background: linear-gradient(225deg, transparent 48%, ${p.theme.colors.primary} 50%, transparent 52%);
        }
    `}

    &:hover {
        opacity: 1;
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 7px ${p => p.theme.colors.primary}40;
    }
`;
