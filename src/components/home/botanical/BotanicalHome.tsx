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
import { BotanicalDynamicSticker } from "@/assets/botanical/BotanicalStickers";

const WeekCalendar = dynamic(
    () => import("@/components/calendar/weekCalendar/WeekCalendar"),
    { ssr: false, loading: () => <CalSkeleton>캘린더를 불러오는 중입니다...</CalSkeleton> }
);

const DAY_W = 40;
const ROW_H = 36;
const STATUS_COLOR: Record<string, string> = {
    todo: "#7A7A7A",
    in_progress: "#C9B59C",
    done: "#6B8F71",
};

const LeafAccentSvg = () => (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M6 1 C6 1 1 5 1 9 C1 13 6 15 6 15 C6 15 11 13 11 9 C11 5 6 1 6 1Z"
              stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7"/>
        <line x1="6" y1="1" x2="6" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
    </svg>
);

const BotanicalCorner = ({ flip = false }: { flip?: boolean }) => (
    <svg
        width="48" height="48" viewBox="0 0 48 48" fill="none"
        style={{
            position: 'absolute', top: 6, right: flip ? 'auto' : 6, left: flip ? 6 : 'auto',
            opacity: 0.25, pointerEvents: 'none', flexShrink: 0,
        }}
    >
        <path d="M40 8 C40 8 24 16 20 28 C16 40 24 44 24 44" stroke="#C9B59C" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M24 24 C20 20 14 18 10 20" stroke="#C9B59C" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M30 18 C28 14 26 10 28 6" stroke="#C9B59C" strokeWidth="0.8" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="2" stroke="#C9B59C" strokeWidth="0.7"/>
        <path d="M20 32 C18 36 16 40 14 42" stroke="#C9B59C" strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
    </svg>
);

const TwigDividerHoriz = () => (
    <svg width="100%" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" fill="none" style={{ flexShrink: 0 }}>
        <path d="M0 4 Q50 2 100 4 Q150 6 200 4" stroke="#C9B59C" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
        <circle cx="100" cy="4" r="1.5" fill="#C9B59C" opacity="0.5"/>
        <circle cx="60" cy="3.5" r="1" fill="#C9B59C" opacity="0.35"/>
        <circle cx="140" cy="4.5" r="1" fill="#C9B59C" opacity="0.35"/>
    </svg>
);

export default function BotanicalHome() {
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
                    <BotanicalCorner />
                    <PanelHeader>
                        <PanelTitle>
                            <LeafAccentSvg />
                            Project
                        </PanelTitle>
                        <HeaderRight>
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
                        <TaskListArea>
                            <SubHeader>Tasks</SubHeader>
                            <TwigDividerHoriz />
                            <TaskScroll>
                                {tasks.length === 0
                                    ? <Empty>태스크가 없습니다.</Empty>
                                    : tasks.map(task => (
                                        <TaskRow key={task.id} $done={task.status === "done"}>
                                            <CheckBtnWrap>
                                                <CheckBtn
                                                    $done={task.status === "done"}
                                                    onClick={() => handleToggleTask(task)}
                                                >
                                                    <CheckInner>
                                                        {task.status === "done" && <Check size={8} strokeWidth={3} />}
                                                    </CheckInner>
                                                </CheckBtn>
                                            </CheckBtnWrap>
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
                            <SubHeader>Timeline</SubHeader>
                            <TwigDividerHoriz />
                            <TimelineScroll ref={timelineRef}>
                                <TimelineContent $rows={tasks.length}>
                                    <DateRow>
                                        {timelineDays.map((d, i) => (
                                            <DateCell key={i} $isToday={d.getTime() === todayTime}>
                                                <DateNumWrap $isToday={d.getTime() === todayTime}>
                                                    <DateNum $isToday={d.getTime() === todayTime}>{d.getDate()}</DateNum>
                                                </DateNumWrap>
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
                    <BotanicalCorner flip />
                    <PanelHeader>
                        <PanelTitle>
                            <LeafAccentSvg />
                            Challenge
                        </PanelTitle>
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
                                                <TodayToggleWrap>
                                                    <TodayToggle
                                                        $done={done}
                                                        onClick={() => handleToggleChallenge(c.id)}
                                                    >
                                                        <TodayToggleInner>
                                                            {done && <Check size={8} strokeWidth={3} />}
                                                        </TodayToggleInner>
                                                    </TodayToggle>
                                                </TodayToggleWrap>
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

                            <StickerContent>
                                {!stickerChallenge ? (
                                    <Empty>챌린지를 선택하세요.</Empty>
                                ) : (
                                    <>
                                        <StickerMeta>
                                            <TodayToggleWrap>
                                                <TodayToggle
                                                    $done={isTodayDone(stickerChallenge)}
                                                    onClick={() => handleToggleChallenge(stickerChallenge.id)}
                                                    style={{ width: 20, height: 20 }}
                                                >
                                                    <TodayToggleInner>
                                                        {isTodayDone(stickerChallenge) && <Check size={10} strokeWidth={3} />}
                                                    </TodayToggleInner>
                                                </TodayToggle>
                                            </TodayToggleWrap>
                                            <span>오늘 완료</span>
                                            <StickerCountText>
                                                {stickerChallenge.completions?.length ?? 0}
                                                {stickerChallenge.targetCount ? ` / ${stickerChallenge.targetCount}` : "회"}
                                            </StickerCountText>
                                        </StickerMeta>
                                        <StickerGrid>
                                            <StickerWatermark>🌿</StickerWatermark>
                                            {stickerSlots.map(s => (
                                                <StickerSlot
                                                    key={s.idx}
                                                    onClick={() => stickerChallenge && handleToggleChallenge(stickerChallenge.id, s.date)}
                                                    title={s.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                                >
                                                    <BotanicalDynamicSticker isFilled={s.filled} idx={s.idx} />
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

const PageWrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: ${p => p.theme.colors.text};
    gap: 12px;
    padding: 12px 0 12px;
`;

const CalSection = styled.div`
    flex: 0 0 auto;
    max-height: 42%;
    overflow: hidden;
    width: 68vw;
    min-width: 700px;
    margin: 0 auto;
`;

const CalSkeleton = styled.div`
    height: 260px;
    width: 100%;
    background: ${p => p.theme.colors.surface};
    border-left: 3px solid ${p => p.theme.colors.primary};
    border-radius: 0 8px 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.9rem;
    color: ${p => p.theme.colors.textSecondary};
`;

const BottomGrid = styled.div`
    flex: 1;
    min-height: 0;
    width: 68vw;
    min-width: 700px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 14px;
`;

const Panel = styled.div`
    position: relative;
    border: none;
    border-left: 3px solid ${p => p.theme.colors.primary};
    border-radius: 0 12px 12px 0;
    background: transparent;
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
    border-bottom: 1px dashed ${p => p.theme.colors.border};
    background: transparent;
`;

const PanelTitle = styled.span`
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.9rem;
    letter-spacing: 0;
    font-weight: 600;
    color: ${p => p.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${p => p.theme.colors.primary};
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ViewAllBtn = styled.button`
    background: transparent;
    border: 1px solid ${p => p.theme.colors.border};
    color: ${p => p.theme.colors.primary};
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.72rem;
    padding: 2px 8px;
    border-radius: 8px 8px 8px 0;
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: ${p => p.theme.colors.primary}1A; }
`;

const Empty = styled.div`
    font-size: 0.82rem;
    color: ${p => p.theme.colors.textSecondary};
    font-family: ${p => p.theme.fonts.body};
    margin: auto;
    padding: 20px;
    text-align: center;
`;

const SubHeader = styled.div`
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.78rem;
    color: ${p => p.theme.colors.primary};
    padding: 6px 10px;
    border-bottom: 1px solid ${p => p.theme.colors.border}40;
    flex-shrink: 0;
`;

const PanelBody = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
`;

const TaskListArea = styled.div`
    width: 200px;
    flex-shrink: 0;
    border-right: 1px dashed ${p => p.theme.colors.border};
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
    border-bottom: 1px dashed ${p => p.theme.colors.border}33;
    transition: background 0.1s;
    &:hover { background: ${p => p.theme.colors.primary}0D; }
`;

const CheckBtnWrap = styled.div`
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CheckBtn = styled.button<{ $done: boolean }>`
    width: 16px;
    height: 16px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
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

const CheckInner = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(45deg);
`;

const TaskName = styled.span<{ $done: boolean }>`
    flex: 1;
    font-size: 0.8rem;
    font-family: ${p => p.theme.fonts.body};
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
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.65rem;
    color: ${p => p.$c};
    flex-shrink: 0;
`;

const ProjectSelector = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.78rem;
    color: ${p => p.theme.colors.text};
    border: 1px solid ${p => p.theme.colors.border};
    border-radius: 6px;
    padding: 2px 8px;
    cursor: pointer;
    user-select: none;
    &:hover { background: ${p => p.theme.colors.primary}0D; }
`;

const DropMenu = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 160px;
    background: ${p => p.theme.colors.background};
    border: 1px solid ${p => p.theme.colors.border};
    border-radius: 0 8px 8px 8px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    overflow: hidden;
`;

const DropItem = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 12px;
    font-size: 0.82rem;
    font-family: ${p => p.theme.fonts.body};
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
    border-bottom: 1px dashed ${p => p.theme.colors.border};
`;

const DateCell = styled.div<{ $isToday: boolean }>`
    width: ${DAY_W}px;
    min-width: ${DAY_W}px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed ${p => p.theme.colors.border}44;
    background: ${p => p.$isToday ? p.theme.colors.primary + "11" : "transparent"};
`;

const DateNumWrap = styled.div<{ $isToday: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: ${p => p.$isToday ? "50% 50% 50% 0" : "0"};
    transform: ${p => p.$isToday ? "rotate(-45deg)" : "none"};
    background: ${p => p.$isToday ? p.theme.colors.primary : "transparent"};
    transition: all 0.2s;
`;

const DateNum = styled.span<{ $isToday: boolean }>`
    font-size: 0.7rem;
    font-family: ${p => p.theme.fonts.body};
    color: ${p => p.$isToday ? p.theme.colors.surface : p.theme.colors.textSecondary};
    font-weight: ${p => p.$isToday ? "600" : "normal"};
    transform: ${p => p.$isToday ? "rotate(45deg)" : "none"};
    display: block;
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
    border-right: 1px dashed ${p => p.theme.colors.border}44;
    background: ${p => p.$isToday ? p.theme.colors.primary + "0A" : "transparent"};
    flex-shrink: 0;
`;

const TaskBar = styled.div<{ $left: number; $top: number; $width: number; $done: boolean }>`
    position: absolute;
    left: ${p => p.$left}px;
    top: ${p => p.$top + 4}px;
    width: ${p => p.$width}px;
    height: ${ROW_H - 8}px;
    background: ${p => p.$done ? p.theme.colors.primary + "25" : p.theme.colors.primary + "25"};
    border: none;
    border-left: 3px solid ${p => p.$done ? p.theme.colors.primary + "66" : p.theme.colors.primary};
    border-radius: 0 6px 6px 0;
    display: flex;
    align-items: center;
    padding: 0 6px;
    cursor: pointer;
    z-index: 3;
    transition: background 0.2s;
    &:hover { background: ${p => p.theme.colors.primary}40; }

    span {
        font-size: 0.68rem;
        font-family: ${p => p.theme.fonts.body};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.text};
        text-decoration: ${p => p.$done ? "line-through" : "none"};
        user-select: none;
    }
`;

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
    border-bottom: 1px dashed ${p => p.theme.colors.border}33;
    transition: background 0.1s;
    &:hover { background: ${p => p.theme.colors.primary}0D; }
`;

const ChallengeLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 1;
    min-width: 0;
`;

const TodayToggleWrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const TodayToggle = styled.button<{ $done: boolean }>`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
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

const TodayToggleInner = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(45deg);
`;

const ChallengeInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ChallengeName = styled.div<{ $done: boolean }>`
    font-size: 0.85rem;
    font-family: ${p => p.theme.fonts.body};
    color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.text};
    text-decoration: ${p => p.$done ? "line-through" : "none"};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ProgressBar = styled.div`
    height: 3px;
    background: ${p => p.theme.colors.border};
    margin-top: 4px;
    overflow: hidden;
    border-radius: 0 4px 4px 0;
`;

const ProgressFill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    border-radius: 0 4px 4px 0;
    transition: width 0.3s;
`;

const ChallengeCount = styled.span`
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.72rem;
    color: ${p => p.theme.colors.primary};
    flex-shrink: 0;
    margin-left: 10px;
`;

const ViewToggle = styled.div`
    display: flex;
    border: 1px solid ${p => p.theme.colors.border};
    border-radius: 6px;
    overflow: hidden;
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

const ChallengeTabs = styled.div`
    flex-shrink: 0;
    display: flex;
    overflow-x: auto;
    border-bottom: 1px dashed ${p => p.theme.colors.border};
    &::-webkit-scrollbar { height: 3px; }
    &::-webkit-scrollbar-thumb { background: ${p => p.theme.colors.primary}80; }
`;

const ChallengeTab = styled.button<{ $active: boolean }>`
    flex-shrink: 0;
    padding: 6px 14px;
    font-family: ${p => p.theme.fonts.body};
    font-size: 0.78rem;
    border: none;
    border-bottom: 2px solid ${p => p.$active ? p.theme.colors.primary : "transparent"};
    background: transparent;
    color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    &:hover { color: ${p => p.theme.colors.primary}; }
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
    font-family: ${p => p.theme.fonts.body};
    color: ${p => p.theme.colors.textSecondary};
`;

const StickerCountText = styled.span`
    margin-left: auto;
    font-size: 0.78rem;
    font-family: ${p => p.theme.fonts.body};
    color: ${p => p.theme.colors.primary};
`;

const StickerGrid = styled.div`
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
    background: transparent;
    border-radius: 0 8px 8px 0;
    align-content: flex-start;
    overflow: auto;
    flex: 1;
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

const StickerWatermark = styled.div`
    position: absolute;
    bottom: 8px;
    right: 8px;
    opacity: 0.06;
    pointer-events: none;
    font-size: 80px;
    line-height: 1;
    color: ${p => p.theme.colors.primary};
`;
