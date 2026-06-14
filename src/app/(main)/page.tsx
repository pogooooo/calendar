"use client";

import * as React from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Check, List, Sparkles, ChevronDown } from "lucide-react";

import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore, { ProjectTaskType } from "@/store/useProjectStore";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DynamicSticker } from "@/assets/celestial/ChallengeStickers";

const WeekCalendar = dynamic(
    () => import("@/components/calendar/weekCalendar/WeekCalendar"),
    { ssr: false, loading: () => <CalSkeleton>캘린더를 불러오는 중입니다...</CalSkeleton> }
);

/* ─── constants ─── */
const DAY_W = 40;
const ROW_H = 36;
const STATUS_COLOR: Record<string, string> = {
    todo: "#7A7A7A",
    in_progress: "#D4AF37",
    done: "#4E8A6D",
};

export default function Home() {
    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();
    const { projects, fetchProjects, updateProjectTaskStatus } = useProjectStore();
    const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
    const authFetch = useAuthFetch();
    const router = useRouter();

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

    React.useEffect(() => {
        if (challenges.length > 0 && !selectedChallengeId) setSelectedChallengeId(challenges[0].id);
    }, [challenges, selectedChallengeId]);

    // scroll timeline to today
    React.useEffect(() => {
        if (!timelineRef.current) return;
        const todayIdx = timelineDays.findIndex(d => d.getTime() === new Date().setHours(0, 0, 0, 0));
        if (todayIdx >= 0) timelineRef.current.scrollLeft = todayIdx * DAY_W - 80;
    });

    const today = new Date();
    const todayTime = React.useMemo(() => new Date().setHours(0, 0, 0, 0), []);
    const timelineDays = React.useMemo(() => {
        const start = new Date(todayTime);
        start.setDate(start.getDate() - 20);
        return Array.from({ length: 90 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
    }, [todayTime]);
    const timelineStart = timelineDays[0].getTime();

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const tasks = selectedProject?.tasks ?? [];
    const activeProjects = projects.filter(p => p.status !== "done");

    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);
    const activeChallenges = challenges.filter(c => {
        const t = c.targetCount ?? null;
        return t === null || (c.completions?.length ?? 0) < t;
    });

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
        // 정오(12:00) 로컬 시간으로 변환해 UTC 날짜 경계 오류 방지
        const safeDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        await toggleChallengeCompletion(authFetch, challengeId, safeDate.toISOString());
    };

    // sticker board: date-based slots matching the real CelestialChallenge logic
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
            {/* ── 주간 캘린더 ── */}
            <CalSection>
                <WeekCalendar todos={todos} categories={categories} />
            </CalSection>

            {/* ── 하단 패널 ── */}
            <BottomGrid>

                {/* ══ 프로젝트 패널 ══ */}
                <Panel>
                    <PanelHeader>
                        <PanelTitle>Project</PanelTitle>
                        <HeaderRight>
                            {/* project selector */}
                            <ProjectSelector onClick={() => setProjectDropOpen(v => !v)}>
                                <span>{selectedProject?.title ?? "선택"}</span>
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
                            <ViewAllBtn onClick={() => router.push("/project")}>View All</ViewAllBtn>
                        </HeaderRight>
                    </PanelHeader>

                    <PanelBody>
                        {/* 태스크 목록 */}
                        <TaskListArea>
                            <SubHeader>Tasks</SubHeader>
                            <TaskScroll>
                                {tasks.length === 0
                                    ? <Empty>태스크가 없습니다.</Empty>
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

                        {/* 타임라인 */}
                        <TimelineArea>
                            <SubHeader>Timeline</SubHeader>
                            <TimelineScroll ref={timelineRef}>
                                <TimelineContent $rows={tasks.length}>
                                    {/* 날짜 헤더 */}
                                    <DateRow>
                                        {timelineDays.map((d, i) => (
                                            <DateCell key={i} $isToday={d.getTime() === todayTime}>
                                                <DateNum $isToday={d.getTime() === todayTime}>{d.getDate()}</DateNum>
                                            </DateCell>
                                        ))}
                                    </DateRow>

                                    {/* 배경 격자 */}
                                    <GraphArea $rows={tasks.length}>
                                        {timelineDays.map((d, i) => (
                                            <BgCol key={i} $isToday={d.getTime() === todayTime} />
                                        ))}

                                        {/* 태스크 바 */}
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

                {/* ══ 챌린지 패널 ══ */}
                <Panel>
                    <PanelHeader>
                        <PanelTitle>Challenge</PanelTitle>
                        <HeaderRight>
                            <ViewToggle>
                                <ToggleBtn $active={challengeView === "list"} onClick={() => setChallengeView("list")}>
                                    <List size={14} />
                                </ToggleBtn>
                                <ToggleBtn $active={challengeView === "sticker"} onClick={() => setChallengeView("sticker")}>
                                    <Sparkles size={14} />
                                </ToggleBtn>
                            </ViewToggle>
                            <ViewAllBtn onClick={() => router.push("/challenge")}>View All</ViewAllBtn>
                        </HeaderRight>
                    </PanelHeader>

                    {challengeView === "list" ? (
                        /* 목록 뷰 */
                        <ChallengeScroll>
                            {activeChallenges.length === 0
                                ? <Empty style={{ padding: "14px 12px" }}>진행 중인 챌린지가 없습니다.</Empty>
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
                        /* 스티커 뷰 */
                        <StickerViewWrapper>
                            {/* 챌린지 선택 탭 */}
                            <ChallengeTabs>
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

                            {/* 스티커 보드 */}
                            <StickerContent>
                                {!stickerChallenge ? (
                                    <Empty>챌린지를 선택하세요.</Empty>
                                ) : (
                                    <>
                                        <StickerMeta>
                                            <TodayToggle
                                                $done={isTodayDone(stickerChallenge)}
                                                onClick={() => handleToggleChallenge(stickerChallenge.id)}
                                                style={{ width: 20, height: 20 }}
                                            >
                                                {isTodayDone(stickerChallenge) && <Check size={11} strokeWidth={3} />}
                                            </TodayToggle>
                                            <span>오늘 완료</span>
                                            <StickerCountText>
                                                {stickerChallenge.completions?.length ?? 0}
                                                {stickerChallenge.targetCount ? ` / ${stickerChallenge.targetCount}` : "회"}
                                            </StickerCountText>
                                        </StickerMeta>
                                        <StickerGrid>
                                            {stickerSlots.map(s => (
                                                <StickerSlot
                                                    key={s.idx}
                                                    onClick={() => stickerChallenge && handleToggleChallenge(stickerChallenge.id, s.date)}
                                                    title={s.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                                >
                                                    <DynamicSticker isFilled={s.filled} idx={s.idx} />
                                                </StickerSlot>
                                            ))}
                                        </StickerGrid>
                                    </>
                                )}
                            </StickerContent>
                        </StickerViewWrapper>
                    )}
                </Panel>

            </BottomGrid>
        </PageWrapper>
    );
}

/* ─── layout ─── */

const PageWrapper = styled.div`
    height: calc(100vh - 4rem);
    display: flex;
    flex-direction: column;
    overflow-y: clip;
    color: ${p => p.theme.colors.text};
`;

const CalSection = styled.div`
    flex-shrink: 0;
    width: 62vw;
    min-width: 700px;
    margin: 0 auto;
    padding-bottom: 15px;
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
    flex: 1;
    min-height: 0;
    width: 62vw;
    min-width: 700px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 12px;
`;

/* ─── shared panel ─── */

const Panel = styled.div`
    border: 1px solid ${p => p.theme.colors.primary};
    background: ${p => p.theme.colors.surface};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const PanelHeader = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid ${p => p.theme.colors.primary};
    background: ${p => p.theme.colors.primary}0D;
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

/* ─── project panel ─── */

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
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: ${p => p.theme.colors.primary}80; }
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

/* project selector */
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
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const DropMenu = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 160px;
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

/* timeline */
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
    &::-webkit-scrollbar { width: 4px; height: 4px; }
    &::-webkit-scrollbar-thumb { background: ${p => p.theme.colors.primary}80; }
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

/* ─── challenge panel ─── */

const ChallengeScroll = styled.div`
    flex: 1;
    overflow-y: auto;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: ${p => p.theme.colors.primary}80; }
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

/* view toggle */
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

/* sticker view */
const StickerViewWrapper = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ChallengeTabs = styled.div`
    flex-shrink: 0;
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
    &::-webkit-scrollbar { height: 3px; }
    &::-webkit-scrollbar-thumb { background: ${p => p.theme.colors.primary}80; }
`;

const ChallengeTab = styled.button<{ $active: boolean }>`
    flex-shrink: 0;
    padding: 6px 14px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 1px;
    border: none;
    border-right: 1px solid ${p => p.theme.colors.primary}33;
    background: ${p => p.$active ? p.theme.colors.primary + "1A" : "transparent"};
    color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const StickerContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: ${p => p.theme.colors.primary}80; }
`;

const StickerMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    font-family: ${p => p.theme.fonts.celestial};
    letter-spacing: 1px;
`;

const StickerCountText = styled.span`
    margin-left: auto;
    font-size: 0.78rem;
    color: ${p => p.theme.colors.primary};
`;

const StickerGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-content: flex-start;
`;

const StickerSlot = styled.div`
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s;
    &:hover { transform: scale(1.15); }
`;
