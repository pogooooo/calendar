"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";
import { Check } from "lucide-react";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";
import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useT } from "@/i18n/useT";
import { DynamicSticker } from "@/assets/celestial/ChallengeStickers";
import ProjectTimeline from "@/components/project/timeline/ProjectTimeline";

const twinkle = keyframes`
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.06; }
`;

const Decor = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;

    .corner {
        position: absolute;
        width: 16px;
        height: 16px;
    }
    .corner.tl {
        top: 0; left: 0;
        background: linear-gradient(315deg, transparent 48%, ${p => p.theme.colors.primary} 50%, transparent 52%);
    }
    .corner.br {
        bottom: 0; right: 0;
        background: linear-gradient(135deg, transparent 48%, ${p => p.theme.colors.primary} 50%, transparent 52%);
    }

    .mote {
        position: absolute;
        width: 3px;
        height: 3px;
        background-color: ${p => p.theme.colors.primary};
        clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
        animation: ${twinkle} 4s ease-in-out infinite;
    }
    .mote.a { left: 16%; top: 22%; animation-duration: 3.6s; }
    .mote.b { left: 74%; top: 40%; animation-duration: 4.8s; animation-delay: 1.3s; }
    .mote.c { left: 38%; top: 76%; animation-duration: 3.2s; animation-delay: 2.4s; }
`;

const Stage = styled.div`
    position: relative;
    height: 100%;
    min-height: 0;

    & > .content {
        position: relative;
        z-index: 1;
        height: 100%;
        min-height: 0;
    }
`;

export function Framed({ children }: { children: React.ReactNode }) {
    return (
        <Stage>
            <Decor aria-hidden="true">
                <span className="corner tl" />
                <span className="corner br" />
                <span className="mote a" />
                <span className="mote b" />
                <span className="mote c" />
            </Decor>
            <div className="content">{children}</div>
        </Stage>
    );
}

const dayKey = (v: string | number | Date) => {
    const d = new Date(v);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const spansDay = (t: { startAt?: string | number | Date | null; endAt?: string | number | Date | null }, key: string) => {
    if (!t.startAt || !t.endAt) return false;
    return dayKey(t.startAt) <= key && key <= dayKey(t.endAt);
};

const doneOn = (t: { completions?: { targetDate: string | Date }[] }, key: string) =>
    (t.completions ?? []).some(c => dayKey(c.targetDate) === key);

export function TodayPanel() {
    const { todos, toggleTodo } = useTodoStore();
    const { categories } = useCategoryStore();
    const authFetch = useAuthFetch();
    const tr = useT();

    const key = dayKey(new Date());
    const list = todos.filter(t => spansDay(t, key));

    if (list.length === 0) return <Empty>{tr.home.noTodayTodos}</Empty>;

    return (
        <Scroll>
            {list.map(t => {
                const done = doneOn(t, key);
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                    <Row key={t.id}>
                        <Box $done={done} onClick={() => toggleTodo(authFetch, t.id, new Date().toISOString())}>
                            {done && <Check size={9} strokeWidth={3} />}
                        </Box>
                        <Mark $c={cat?.color || "#D4AF37"} />
                        <Name $done={done}>{t.title}</Name>
                    </Row>
                );
            })}
        </Scroll>
    );
}

export function UpcomingPanel() {
    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();
    const tr = useT();

    const t0 = new Date().setHours(0, 0, 0, 0);
    const list = todos
        .filter(t => t.startAt && new Date(t.startAt).getTime() >= t0 + 86400000 && new Date(t.startAt).getTime() < t0 + 86400000 * 8)
        .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime());

    if (list.length === 0) return <Empty>{tr.home.noUpcoming}</Empty>;

    return (
        <Scroll>
            {list.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                const d = new Date(t.startAt!);
                return (
                    <Row key={t.id}>
                        <Mark $c={cat?.color || "#D4AF37"} />
                        <Name $done={false}>{t.title}</Name>
                        <Meta>{d.getMonth() + 1}/{d.getDate()}</Meta>
                    </Row>
                );
            })}
        </Scroll>
    );
}

export function StatsPanel() {
    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();
    const tr = useT();

    const t0 = new Date().setHours(0, 0, 0, 0);
    const base = new Date(t0);
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
            if (doneOn(t, k)) done += 1;
        });
    }
    const pct = total ? Math.round((done / total) * 100) : 0;

    const cats = categories
        .map(c => ({ ...c, count: todos.filter(t => t.categoryId === c.id).length }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    const max = cats.length ? cats[0].count : 1;

    return (
        <StatWrap>
            <Big>{pct}<span>%</span></Big>
            <Caption>{tr.home.doneRatio(done, total)}</Caption>
            <Bar><Fill $pct={pct} /></Bar>
            <Dashed />
            {cats.length === 0
                ? <Empty>{tr.home.noData}</Empty>
                : cats.map(c => (
                    <CatRow key={c.id}>
                        <Mark $c={c.color} />
                        <CatName>{c.name}</CatName>
                        <CatBar><CatFill $c={c.color} $pct={(c.count / max) * 100} /></CatBar>
                        <Meta>{c.count}</Meta>
                    </CatRow>
                ))}
        </StatWrap>
    );
}

const BOARD_COLUMNS = [
    { key: "todo", next: "in_progress" },
    { key: "in_progress", next: "done" },
    { key: "done", next: null },
] as const;

function useSelectedProject() {
    const { projects, fetchProjects } = useProjectStore();
    const authFetch = useAuthFetch();
    const [sel, setSel] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchProjects(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (projects.length > 0 && !projects.some(p => p.id === sel)) setSel(projects[0].id);
    }, [projects, sel]);

    return { projects, project: projects.find(p => p.id === sel) ?? null, sel, setSel };
}

export function ProjectBoardPanel() {
    const { updateProjectTaskStatus } = useProjectStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const { projects, project, sel, setSel } = useSelectedProject();

    if (!project) return <Empty>{tr.home.noProjects}</Empty>;

    const tasks = project.tasks ?? [];
    const columnLabel: Record<string, string> = {
        todo: tr.home.colTodo,
        in_progress: tr.home.colDoing,
        done: tr.home.colDone,
    };

    return (
        <Column>
            <Tabs>
                {projects.map(p => (
                    <Tab key={p.id} $active={p.id === sel} onClick={() => setSel(p.id)}>{p.title}</Tab>
                ))}
            </Tabs>
            <BoardGrid>
                {BOARD_COLUMNS.map(col => {
                    const list = tasks.filter(t => t.status === col.key);
                    return (
                        <BoardCol key={col.key}>
                            <ColHead>
                                <span>{columnLabel[col.key]}</span>
                                <ColCount>{list.length}</ColCount>
                            </ColHead>
                            <ColBody>
                                {list.map(t => (
                                    <Chip
                                        key={t.id}
                                        $done={col.key === "done"}
                                        $movable={col.next !== null}
                                        onClick={() => col.next && updateProjectTaskStatus(authFetch, project.id, t.id, col.next)}
                                    >
                                        <ChipMark $p={t.priority} />
                                        <ChipText>{t.title}</ChipText>
                                    </Chip>
                                ))}
                            </ColBody>
                        </BoardCol>
                    );
                })}
            </BoardGrid>
        </Column>
    );
}

export function ProjectTimelinePanel() {
    const { updateProjectTask } = useProjectStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const { projects, project, sel, setSel } = useSelectedProject();

    if (!project) return <Empty>{tr.home.noProjects}</Empty>;

    return (
        <Column>
            <Tabs>
                {projects.map(p => (
                    <Tab key={p.id} $active={p.id === sel} onClick={() => setSel(p.id)}>{p.title}</Tab>
                ))}
            </Tabs>
            <ProjectTimeline
                tasks={project.tasks ?? []}
                flex={1}
                onEditTask={() => {}}
                onUpdateTaskDates={(taskId, newStart, newEnd) =>
                    updateProjectTask(authFetch, project.id, taskId, { startAt: newStart, endAt: newEnd })}
            />
        </Column>
    );
}

export function ProjectDetailPanel() {
    const { updateProjectTaskStatus } = useProjectStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const { projects, project, sel, setSel } = useSelectedProject();

    if (!project) return <Empty>{tr.home.noProjects}</Empty>;

    const tasks = project.tasks ?? [];
    const done = tasks.filter(t => t.status === "done").length;
    const pct = tasks.length === 0 ? 0 : (done / tasks.length) * 100;
    const fmt = (v?: string | null) => v ? new Date(v).toLocaleDateString().slice(0, -1) : tr.home.noDate;
    const assignees = (project.assignees ?? []).map(a => a.name).join(", ");

    return (
        <Column>
            <Tabs>
                {projects.map(p => (
                    <Tab key={p.id} $active={p.id === sel} onClick={() => setSel(p.id)}>{p.title}</Tab>
                ))}
            </Tabs>
            <StatWrap>
                <DetailTitle>{project.title}</DetailTitle>
                <MetaLine>
                    <MetaKey>{tr.home.period}</MetaKey>
                    <span>{fmt(project.startAt)} — {fmt(project.endAt)}</span>
                </MetaLine>
                <MetaLine>
                    <MetaKey>{tr.home.assignee}</MetaKey>
                    <span>{assignees || tr.home.noAssignee}</span>
                </MetaLine>

                <Dashed />

                <Caption>{tr.home.doneRatio(done, tasks.length)}</Caption>
                <Bar><Fill $pct={pct} /></Bar>

                <Dashed />

                {tasks.length === 0 && <Empty>{tr.home.noTasks}</Empty>}
                {tasks.map(t => (
                    <Row key={t.id}>
                        <Box
                            $done={t.status === "done"}
                            onClick={() => updateProjectTaskStatus(authFetch, project.id, t.id, t.status === "done" ? "todo" : "done")}
                        >
                            {t.status === "done" && <Check size={9} strokeWidth={3} />}
                        </Box>
                        <Name $done={t.status === "done"}>{t.title}</Name>
                        <ChipMark $p={t.priority} />
                    </Row>
                ))}
            </StatWrap>
        </Column>
    );
}

export function ChallengePanel() {
    const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
    const authFetch = useAuthFetch();
    const tr = useT();

    React.useEffect(() => {
        fetchChallenges(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const today = new Date();
    const expired = (c: ChallengeType) => {
        const t = c.targetCount ?? null;
        if (t === null) return false;
        const s = new Date(c.startAt);
        s.setHours(0, 0, 0, 0);
        const last = new Date(s);
        last.setDate(s.getDate() + (t - 1) * c.interval);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now > last;
    };

    const active = challenges.filter(c => {
        const t = c.targetCount ?? null;
        if (t !== null && (c.completions?.length ?? 0) >= t) return false;
        return !expired(c);
    });

    if (active.length === 0) return <Empty>{tr.home.noChallenges}</Empty>;

    const key = dayKey(today);

    return (
        <Scroll>
            {active.map(c => {
                const done = (c.completions ?? []).some(cp => dayKey(cp.targetDate) === key);
                const count = c.completions?.length ?? 0;
                const target = c.targetCount ?? null;
                return (
                    <Row key={c.id}>
                        <Box
                            $done={done}
                            onClick={() => {
                                const d = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
                                toggleChallengeCompletion(authFetch, c.id, d.toISOString());
                            }}
                        >
                            {done && <Check size={9} strokeWidth={3} />}
                        </Box>
                        <Name $done={done}>{c.title}</Name>
                        <Meta>{target ? `${count}/${target}` : count}</Meta>
                    </Row>
                );
            })}
        </Scroll>
    );
}

export function MemoPanel() {
    const { memo, fetchDailyData, updateDailyMemo } = useDailyStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [draft, setDraft] = React.useState("");
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        fetchDailyData(authFetch, new Date()).then(() => setLoaded(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (loaded) setDraft(memo ?? "");
    }, [loaded, memo]);

    return (
        <MemoArea
            value={draft}
            placeholder={tr.calendar.memoPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => updateDailyMemo(authFetch, new Date(), draft)}
        />
    );
}

export function QuickTaskPanel() {
    const { tasks, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask } = useDailyStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [text, setText] = React.useState("");

    React.useEffect(() => {
        fetchDailyData(authFetch, new Date());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = () => {
        const v = text.trim();
        if (!v) return;
        addDailyTask(authFetch, new Date(), v);
        setText("");
    };

    return (
        <Column>
            <QuickInput
                value={text}
                placeholder={tr.calendar.addTask}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <Scroll>
                {tasks.length === 0
                    ? <Empty>{tr.home.noTodayTodos}</Empty>
                    : tasks.map(task => (
                        <Row key={task.id}>
                            <Box $done={task.isDone} onClick={() => toggleDailyTask(authFetch, task.id)}>
                                {task.isDone && <Check size={9} strokeWidth={3} />}
                            </Box>
                            <Name $done={task.isDone}>{task.text}</Name>
                            <DelBtn onClick={() => deleteDailyTask(authFetch, task.id)}>×</DelBtn>
                        </Row>
                    ))}
            </Scroll>
        </Column>
    );
}

export function StickerPanel() {
    const { challenges, fetchChallenges } = useChallengeStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [sel, setSel] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchChallenges(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (challenges.length > 0 && !sel) setSel(challenges[0].id);
    }, [challenges, sel]);

    const c = challenges.find(x => x.id === sel);
    if (!c) return <Empty>{tr.home.selectChallenge}</Empty>;

    const start = new Date(c.startAt);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const doneSet = new Set((c.completions ?? []).map(x => dayKey(x.targetDate)));
    const count = c.targetCount ?? Math.floor(Math.max(0, now.getTime() - start.getTime()) / (86400000 * (c.interval || 1))) + 1;

    return (
        <Column>
            <Tabs>
                {challenges.map(ch => (
                    <Tab key={ch.id} $active={ch.id === sel} onClick={() => setSel(ch.id)}>{ch.title}</Tab>
                ))}
            </Tabs>
            <StickerWrap>
                {Array.from({ length: count }, (_, i) => {
                    const d = new Date(start);
                    d.setDate(start.getDate() + i * (c.interval || 1));
                    return (
                        <StickerCell key={i}>
                            <DynamicSticker isFilled={doneSet.has(dayKey(d))} idx={i} />
                        </StickerCell>
                    );
                })}
            </StickerWrap>
        </Column>
    );
}

export function CategoryPanel() {
    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();
    const tr = useT();

    const key = dayKey(new Date());
    const rows = categories.map(c => {
        const mine = todos.filter(t => t.categoryId === c.id);
        const done = mine.filter(t => doneOn(t, key)).length;
        return { ...c, total: mine.length, done };
    }).filter(c => c.total > 0);

    if (rows.length === 0) return <Empty>{tr.home.noData}</Empty>;
    const max = Math.max(...rows.map(r => r.total));

    return (
        <StatWrap>
            {rows.map(r => (
                <CatRow key={r.id}>
                    <Mark $c={r.color} />
                    <CatName>{r.name}</CatName>
                    <CatBar><CatFill $c={r.color} $pct={(r.total / max) * 100} /></CatBar>
                    <Meta>{r.done}/{r.total}</Meta>
                </CatRow>
            ))}
        </StatWrap>
    );
}

const Column = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const MemoArea = styled.textarea`
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.7;
    color: ${p => p.theme.colors.text};
    background: transparent;
    &::placeholder { color: ${p => p.theme.colors.textSecondary}88; }
`;

const QuickInput = styled.input`
    flex-shrink: 0;
    margin: 10px 12px;
    padding: 7px 9px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    background: transparent;
    outline: none;
    font-family: inherit;
    font-size: 0.8rem;
    color: ${p => p.theme.colors.text};
    &:focus { border-color: ${p => p.theme.colors.primary}; }
    &::placeholder { color: ${p => p.theme.colors.textSecondary}88; }
`;

const DelBtn = styled.button`
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    line-height: 1;
    color: ${p => p.theme.colors.textSecondary};
    &:hover { color: ${p => p.theme.colors.error}; }
`;

const Tabs = styled.div`
    flex-shrink: 0;
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
`;

const Tab = styled.button<{ $active: boolean }>`
    position: relative;
    flex-shrink: 0;
    padding: 7px 12px 8px 20px;
    border: none;
    border-right: 1px solid ${p => p.theme.colors.primary}33;
    background: transparent;
    cursor: pointer;
    white-space: nowrap;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 1px;
    color: ${p => p.$active ? p.theme.colors.text : p.theme.colors.textSecondary};
    opacity: ${p => p.$active ? 1 : 0.6};
    text-shadow: ${p => p.$active ? `0 0 7px ${p.theme.colors.primary}80` : "none"};
    transition: opacity 0.2s, color 0.2s;

    &::before {
        content: "";
        position: absolute;
        left: 8px;
        top: 50%;
        width: 7px;
        height: 7px;
        margin-top: -4px;
        background-color: ${p => p.theme.colors.primary};
        clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
        transform: scale(${p => p.$active ? 1 : 0});
        transition: transform 0.2s ease;
    }

    &::after {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 2px;
        height: 1px;
        background: ${p => p.theme.colors.primary};
        transform: scaleX(${p => p.$active ? 1 : 0});
        transform-origin: left;
        transition: transform 0.25s ease;
    }

    &:hover { opacity: 1; }
`;

const BoardGrid = styled.div`
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
`;

const BoardCol = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid ${p => p.theme.colors.primary}33;
    &:last-child { border-right: none; }
`;

const ColHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    padding: 7px 9px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
`;

const ColCount = styled.span`
    font-size: 0.62rem;
    padding: 0 4px;
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.primary};
`;

const ColBody = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 7px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Chip = styled.div<{ $done: boolean; $movable: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 7px;
    border: 1px solid ${p => p.theme.colors.primary}44;
    cursor: ${p => p.$movable ? "pointer" : "default"};
    opacity: ${p => p.$done ? 0.65 : 1};
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: ${p => p.$movable ? `0 0 6px ${p.theme.colors.primary}40` : "none"};
    }
`;

const ChipMark = styled.span<{ $p?: string }>`
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    background-color: ${p =>
        p.$p === "high" ? p.theme.colors.error
            : p.$p === "low" ? p.theme.colors.textSecondary
                : p.theme.colors.primary};
`;

const ChipText = styled.span`
    flex: 1;
    min-width: 0;
    font-size: 0.72rem;
    line-height: 1.3;
    color: ${p => p.theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DetailTitle = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1rem;
    letter-spacing: 1.5px;
    color: ${p => p.theme.colors.text};
    margin-bottom: 10px;
`;

const MetaLine = styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 0.74rem;
    color: ${p => p.theme.colors.text};
    padding: 2px 0;
`;

const MetaKey = styled.span`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
`;

const StickerWrap = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px;
    padding: 12px;
`;

const StickerCell = styled.div`
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Scroll = styled.div`
    height: 100%;
    overflow-y: auto;
    padding: 6px 0;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px 9px;
    background-image: linear-gradient(${p => p.theme.colors.primary}, ${p => p.theme.colors.primary});
    background-repeat: no-repeat;
    background-position: 12px calc(100% - 2px);
    background-size: 0 1px;
    transition: background-size 0.3s ease;
    &:hover { background-size: calc(100% - 24px) 1px; }
`;

const Box = styled.button<{ $done: boolean }>`
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid ${p => p.theme.colors.primary};
    background: ${p => p.$done ? p.theme.colors.primary : "transparent"};
    color: ${p => p.theme.colors.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const Mark = styled.div<{ $c: string }>`
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    transform: rotate(45deg);
    background-color: ${p => p.$c};
`;

const Name = styled.span<{ $done: boolean }>`
    flex: 1;
    min-width: 0;
    font-size: 0.8rem;
    color: ${p => p.$done ? p.theme.colors.textSecondary : p.theme.colors.text};
    text-decoration: ${p => p.$done ? "line-through" : "none"};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Meta = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    flex-shrink: 0;
`;

const Empty = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
`;

const StatWrap = styled.div`
    height: 100%;
    overflow-y: auto;
    padding: 14px 14px 16px;
`;

const Big = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 2rem;
    line-height: 1;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.primary};
    span { font-size: 0.9rem; margin-left: 3px; }
`;

const Caption = styled.div`
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 5px;
`;

const Bar = styled.div`
    height: 1px;
    margin-top: 10px;
    background: ${p => p.theme.colors.primary}33;
`;

const Fill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
`;

const Dashed = styled.div`
    border-top: 1px dashed ${p => p.theme.colors.primary}40;
    margin: 12px 0 10px;
`;

const CatRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
`;

const CatName = styled.span`
    font-size: 0.74rem;
    color: ${p => p.theme.colors.text};
    width: 60px;
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
