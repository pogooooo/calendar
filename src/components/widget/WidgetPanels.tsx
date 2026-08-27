"use client";

import * as React from "react";
import styled from "styled-components";
import { Check } from "lucide-react";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore, { ChallengeType } from "@/store/useChallengeStore";
import useDailyStore from "@/store/useDailyStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useT } from "@/i18n/useT";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { dayKeyToIso } from "@/lib/dateKey";

const ROW_PX = 32;
const NARROW_PX = 300;

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

function useFrame(rowPx = ROW_PX, reserved = 0) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [box, setBox] = React.useState({ rows: 4, width: 200, height: 200 });

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const calc = () => {
            const h = el.clientHeight - reserved;
            setBox({
                rows: Math.max(1, Math.floor(h / rowPx)),
                width: el.clientWidth,
                height: el.clientHeight,
            });
        };

        calc();
        const ro = new ResizeObserver(calc);
        ro.observe(el);
        return () => ro.disconnect();
    }, [rowPx, reserved]);

    return [ref, box] as const;
}

function useMinuteTick(ms = 30000) {
    const [, force] = React.useReducer((n: number) => n + 1, 0);
    React.useEffect(() => {
        const id = window.setInterval(force, ms);
        return () => window.clearInterval(id);
    }, [ms]);
}

export function TodayPanel() {
    const { todos, toggleTodo, addTodo } = useTodoStore();
    const { categories } = useCategoryStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [ref, box] = useFrame(ROW_PX, 26 + 38);
    const [draft, setDraft] = React.useState("");

    const key = dayKey(new Date());
    const t0 = new Date().setHours(0, 0, 0, 0);

    const today = todos.filter(t => spansDay(t, key));
    const next = todos
        .filter(t => t.startAt && new Date(t.startAt).getTime() >= t0 + 86400000 && new Date(t.startAt).getTime() < t0 + 86400000 * 8)
        .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime());

    const hasNext = next.length > 0;
    const budget = Math.max(1, box.rows - (hasNext ? 1 : 0));
    const todayCap = hasNext ? Math.max(1, Math.round(budget * 0.6)) : budget;
    const nextCap = Math.max(0, budget - todayCap);

    const color = (id: string) => categories.find(c => c.id === id)?.color || "#D4AF37";

    const submit = () => {
        const v = draft.trim();
        if (!v) return;

        const cat = categories[0];
        if (!cat) return;

        const start = new Date();
        const end = new Date(start.getTime() + 3600000);

        addTodo(authFetch, {
            title: v,
            categoryId: cat.id,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
        });
        setDraft("");
    };

    return (
        <Pad ref={ref}>
            <QuickInput
                value={draft}
                placeholder={tr.calendar.addTask}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <SectionHead>{tr.home.today}</SectionHead>
            {today.length === 0
                ? <Thin>{tr.home.noTodayTodos}</Thin>
                : today.slice(0, todayCap).map(t => {
                    const done = doneOn(t, key);
                    return (
                        <Row key={t.id}>
                            <Box $done={done} onClick={() => toggleTodo(authFetch, t.id, key)}>
                                {done && <Check size={9} strokeWidth={3} />}
                            </Box>
                            <Mark $c={color(t.categoryId)} />
                            <Name $done={done}>{t.title}</Name>
                        </Row>
                    );
                })}
            {today.length > todayCap && <More>{`+${today.length - todayCap}`}</More>}

            {hasNext && nextCap > 0 && (
                <>
                    <SectionHead className="mt">{tr.home.upcoming}</SectionHead>
                    {next.slice(0, nextCap).map(t => {
                        const k = dayKey(t.startAt!);
                        const done = doneOn(t, k);
                        const d = new Date(t.startAt!);
                        return (
                            <Row key={t.id}>
                                <Box $done={done} onClick={() => toggleTodo(authFetch, t.id, k)}>
                                    {done && <Check size={9} strokeWidth={3} />}
                                </Box>
                                <Mark $c={color(t.categoryId)} />
                                <Name $done={done}>{t.title}</Name>
                                <Meta>{`${d.getMonth() + 1}/${d.getDate()}`}</Meta>
                            </Row>
                        );
                    })}
                    {next.length > nextCap && <More>{`+${next.length - nextCap}`}</More>}
                </>
            )}
        </Pad>
    );
}

export function NowNextPanel() {
    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();
    const tr = useT();
    useMinuteTick();

    const now = Date.now();
    const timed = todos.filter(t => t.startAt && t.endAt && !t.isAllDay);

    const current = timed
        .filter(t => new Date(t.startAt!).getTime() <= now && now < new Date(t.endAt!).getTime())
        .sort((a, b) => new Date(a.endAt!).getTime() - new Date(b.endAt!).getTime())[0];

    const upcoming = timed
        .filter(t => new Date(t.startAt!).getTime() > now)
        .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())[0];

    const color = (id: string) => categories.find(c => c.id === id)?.color || "#D4AF37";

    const untilText = (ms: number) => {
        const m = Math.max(0, Math.round(ms / 60000));
        if (m < 60) return tr.widget.inMinutes(m);
        return tr.widget.inHours(Math.floor(m / 60), m % 60);
    };

    const hhmm = (v: string | number | Date) => {
        const d = new Date(v);
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    const pct = current
        ? Math.round(((now - new Date(current.startAt!).getTime()) /
            Math.max(1, new Date(current.endAt!).getTime() - new Date(current.startAt!).getTime())) * 100)
        : 0;

    return (
        <Pad>
            <BigRow>
                <SectionHead>{tr.widget.now}</SectionHead>
                {current ? (
                    <>
                        <NowTitle><Mark $c={color(current.categoryId)} />{current.title}</NowTitle>
                        <NowMeta>{`${hhmm(current.startAt!)} – ${hhmm(current.endAt!)} · ${untilText(new Date(current.endAt!).getTime() - now)}`}</NowMeta>
                        <Bar><Fill $pct={pct} /></Bar>
                    </>
                ) : (
                    <NowMeta>{tr.widget.nothingNow}</NowMeta>
                )}
            </BigRow>

            <Dashed />

            <BigRow>
                <SectionHead>{tr.widget.next}</SectionHead>
                {upcoming ? (
                    <>
                        <NowTitle><Mark $c={color(upcoming.categoryId)} />{upcoming.title}</NowTitle>
                        <NowMeta>{`${hhmm(upcoming.startAt!)} · ${untilText(new Date(upcoming.startAt!).getTime() - now)}`}</NowMeta>
                    </>
                ) : (
                    <NowMeta>{tr.widget.nothingNext}</NowMeta>
                )}
            </BigRow>
        </Pad>
    );
}

export function DuePanel() {
    const { todos, toggleTodo } = useTodoStore();
    const { categories } = useCategoryStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [ref, box] = useFrame(ROW_PX, 26);
    useMinuteTick(60000);

    const now = Date.now();
    const list = todos
        .filter(t => {
            if (!t.endAt) return false;
            const end = new Date(t.endAt).getTime();
            if (end < now || end > now + 86400000 * 2) return false;
            return !doneOn(t, dayKey(t.endAt));
        })
        .sort((a, b) => new Date(a.endAt!).getTime() - new Date(b.endAt!).getTime());

    const cap = Math.max(1, box.rows);
    const color = (id: string) => categories.find(c => c.id === id)?.color || "#D4AF37";

    const left = (v: string | number | Date) => {
        const h = Math.round((new Date(v).getTime() - now) / 3600000);
        return h >= 24 ? `D-${Math.floor(h / 24)}` : tr.widget.hoursLeft(Math.max(0, h));
    };

    return (
        <Pad ref={ref}>
            <SectionHead>{tr.widget.dueSoon}</SectionHead>
            {list.length === 0
                ? <Thin>{tr.widget.noDue}</Thin>
                : list.slice(0, cap).map(t => {
                    const k = dayKey(t.endAt!);
                    return (
                        <Row key={t.id}>
                            <Box $done={false} onClick={() => toggleTodo(authFetch, t.id, k)} />
                            <Mark $c={color(t.categoryId)} />
                            <Name $done={false}>{t.title}</Name>
                            <Meta>{left(t.endAt!)}</Meta>
                        </Row>
                    );
                })}
            {list.length > cap && <More>{`+${list.length - cap}`}</More>}
        </Pad>
    );
}

export function AnniversaryPanel() {
    const { anniversaries, fetchAnniversaries } = useAnniversaryStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [ref, box] = useFrame(ROW_PX, 26);

    React.useEffect(() => {
        fetchAnniversaries(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const t0 = new Date().setHours(0, 0, 0, 0);
    const year = new Date(t0).getFullYear();

    const list = anniversaries
        .map(a => {
            let d = new Date(year, a.month - 1, a.day).getTime();
            if (d < t0) d = new Date(year + 1, a.month - 1, a.day).getTime();
            return { ...a, dday: Math.round((d - t0) / 86400000) };
        })
        .sort((a, b) => a.dday - b.dday);

    const cap = Math.max(1, box.rows);

    return (
        <Pad ref={ref}>
            <SectionHead>{tr.sidebar.anniversary}</SectionHead>
            {list.length === 0
                ? <Thin>{tr.home.noAnniversaries}</Thin>
                : list.slice(0, cap).map(a => (
                    <Row key={a.id}>
                        <Star>✦</Star>
                        <Name $done={false}>{a.title}</Name>
                        <Meta className={a.dday === 0 ? "hot" : ""}>{a.dday === 0 ? "D-DAY" : `D-${a.dday}`}</Meta>
                    </Row>
                ))}
        </Pad>
    );
}

export function ProjectsPanel() {
    const { projects, fetchProjects } = useProjectStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [ref, box] = useFrame(38, 26);

    React.useEffect(() => {
        fetchProjects(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const list = projects
        .filter(p => p.status !== "done")
        .sort((a, b) => {
            const ea = a.endAt ? new Date(a.endAt).getTime() : Infinity;
            const eb = b.endAt ? new Date(b.endAt).getTime() : Infinity;
            return ea - eb;
        });

    const cap = Math.max(1, box.rows);

    return (
        <Pad ref={ref}>
            <SectionHead>{tr.home.project}</SectionHead>
            {list.length === 0
                ? <Thin>{tr.home.noProjects}</Thin>
                : list.slice(0, cap).map(p => {
                    const tasks = p.tasks ?? [];
                    const done = tasks.filter(t => t.status === "done").length;
                    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
                    return (
                        <ProjRow key={p.id}>
                            <ProjTop>
                                <Name $done={false}>{p.title}</Name>
                                <Meta>{`${done}/${tasks.length}`}</Meta>
                            </ProjTop>
                            <Bar><Fill $pct={pct} /></Bar>
                        </ProjRow>
                    );
                })}
            {list.length > cap && <More>{`+${list.length - cap}`}</More>}
        </Pad>
    );
}

export function StatsPanel() {
    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();
    const tr = useT();
    const [ref, box] = useFrame(22, 96);

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

    const key = dayKey(new Date());
    const cats = categories
        .map(c => {
            const mine = todos.filter(t => t.categoryId === c.id);
            return { ...c, total: mine.length, done: mine.filter(t => doneOn(t, key)).length };
        })
        .filter(c => c.total > 0)
        .sort((a, b) => b.total - a.total);

    const max = cats.length ? cats[0].total : 1;
    const wide = box.width >= NARROW_PX;
    const cap = wide ? Math.max(1, Math.min(6, box.rows)) : 0;

    return (
        <Pad ref={ref}>
            <Big>{pct}<span>%</span></Big>
            <Caption>{tr.home.doneRatio(done, total)}</Caption>
            <Bar><Fill $pct={pct} /></Bar>
            {cap > 0 && (
                <>
                    <Dashed />
                    {cats.length === 0
                        ? <Thin>{tr.home.noData}</Thin>
                        : cats.slice(0, cap).map(c => (
                            <CatRow key={c.id}>
                                <Mark $c={c.color} />
                                <CatName>{c.name}</CatName>
                                <CatBar><CatFill $c={c.color} $pct={(c.total / max) * 100} /></CatBar>
                                <Meta>{`${c.done}/${c.total}`}</Meta>
                            </CatRow>
                        ))}
                </>
            )}
        </Pad>
    );
}

export function ChallengePanel() {
    const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [ref, box] = useFrame(ROW_PX, 26);

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

    const key = dayKey(today);
    const toggle = (id: string, d: Date) => {
        const safe = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        toggleChallengeCompletion(authFetch, id, safe.toISOString());
    };

    if (active.length === 0) {
        return <Pad ref={ref}><SectionHead>{tr.home.challenge}</SectionHead><Thin>{tr.home.noChallenges}</Thin></Pad>;
    }

    if (box.height < 260) {
        const c = active[0];
        const set = new Set((c.completions ?? []).map(x => dayKey(x.targetDate)));
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - 13 + i);
            return { d, on: set.has(dayKey(d)), isToday: i === 13 };
        });
        return (
            <Pad ref={ref}>
                <SectionHead>{tr.home.challenge}</SectionHead>
                <NowTitle>{c.title}</NowTitle>
                <NowMeta>{c.targetCount ? `${c.completions?.length ?? 0}/${c.targetCount}` : `${c.completions?.length ?? 0}`}</NowMeta>
                <Streak>
                    {days.map((x, i) => (
                        <Dot key={i} $on={x.on} $today={x.isToday} onClick={() => toggle(c.id, x.d)} />
                    ))}
                </Streak>
            </Pad>
        );
    }

    const cap = Math.max(1, box.rows);

    return (
        <Pad ref={ref}>
            <SectionHead>{tr.home.challenge}</SectionHead>
            {active.slice(0, cap).map(c => {
                const done = (c.completions ?? []).some(cp => dayKey(cp.targetDate) === key);
                const count = c.completions?.length ?? 0;
                return (
                    <Row key={c.id}>
                        <Box $done={done} onClick={() => toggle(c.id, today)}>
                            {done && <Check size={9} strokeWidth={3} />}
                        </Box>
                        <Name $done={done}>{c.title}</Name>
                        <Meta>{c.targetCount ? `${count}/${c.targetCount}` : count}</Meta>
                    </Row>
                );
            })}
            {active.length > cap && <More>{`+${active.length - cap}`}</More>}
        </Pad>
    );
}

export function MemoPanel() {
    const { memo, fetchDailyData, updateDailyMemo } = useDailyStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [draft, setDraft] = React.useState("");
    const [loaded, setLoaded] = React.useState(false);
    const key = useCurrentDayKey();

    React.useEffect(() => {
        setLoaded(false);
        fetchDailyData(authFetch, new Date(dayKeyToIso(key))).then(() => setLoaded(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    React.useEffect(() => {
        if (loaded) setDraft(memo ?? "");
    }, [loaded, memo]);

    return (
        <MemoArea
            value={draft}
            placeholder={tr.calendar.memoPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => updateDailyMemo(authFetch, new Date(dayKeyToIso(key)), draft)}
        />
    );
}

export function QuickTaskPanel() {
    const { tasks, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask } = useDailyStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [text, setText] = React.useState("");
    const key = useCurrentDayKey();
    const [ref, box] = useFrame(ROW_PX, 4);

    React.useEffect(() => {
        fetchDailyData(authFetch, new Date(dayKeyToIso(key)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const submit = () => {
        const v = text.trim();
        if (!v) return;
        addDailyTask(authFetch, new Date(dayKeyToIso(key)), v);
        setText("");
    };

    const cap = Math.max(1, box.rows);

    return (
        <Column>
            <QuickInput
                value={text}
                placeholder={tr.calendar.addTask}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <Fit ref={ref}>
                {tasks.length === 0
                    ? <Thin>{tr.home.noTodayTodos}</Thin>
                    : tasks.slice(0, cap).map(task => (
                        <Row key={task.id}>
                            <Box $done={task.isDone} onClick={() => toggleDailyTask(authFetch, task.id)}>
                                {task.isDone && <Check size={9} strokeWidth={3} />}
                            </Box>
                            <Name $done={task.isDone}>{task.text}</Name>
                            <DelBtn onClick={() => deleteDailyTask(authFetch, task.id)}>×</DelBtn>
                        </Row>
                    ))}
                {tasks.length > cap && <More>{`+${tasks.length - cap}`}</More>}
            </Fit>
        </Column>
    );
}

const Pad = styled.div`
    height: 100%;
    width: 100%;
    overflow: hidden;
    padding: var(--widget-pad);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
`;

const Fit = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

const Column = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: var(--widget-pad);
    box-sizing: border-box;
`;

const SectionHead = styled.div`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.primary};
    padding-bottom: 5px;
    margin-bottom: 3px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}40;

    &.mt { margin-top: 10px; }
`;

const Row = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    height: ${ROW_PX}px;
    box-sizing: border-box;
`;

const ProjRow = styled.div`
    flex-shrink: 0;
    height: 38px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    box-sizing: border-box;
`;

const ProjTop = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const More = styled.div`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.64rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    padding-top: 2px;
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

const Star = styled.span`
    width: 9px;
    flex-shrink: 0;
    text-align: center;
    font-size: 0.62rem;
    color: ${p => p.theme.colors.primary};
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

    &.hot { color: ${p => p.theme.colors.primary}; }
`;

const Thin = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.74rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
`;

const BigRow = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const NowTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.92rem;
    color: ${p => p.theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 4px;
`;

const NowMeta = styled.div`
    font-size: 0.7rem;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 3px;
`;

const Streak = styled.div`
    display: flex;
    gap: 5px;
    margin-top: 10px;
`;

const Dot = styled.button<{ $on: boolean; $today: boolean }>`
    width: 8px;
    height: 8px;
    padding: 0;
    transform: rotate(45deg);
    cursor: pointer;
    border: 1px solid ${p => p.$today ? p.theme.colors.primary : `${p.theme.colors.primary}66`};
    background: ${p => p.$on ? p.theme.colors.primary : "transparent"};
    box-shadow: ${p => p.$today ? `0 0 4px ${p.theme.colors.primary}66` : "none"};
`;

const Big = styled.div`
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 2rem;
    line-height: 1;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.primary};
    span { font-size: 0.9rem; margin-left: 3px; }
`;

const Caption = styled.div`
    flex-shrink: 0;
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 5px;
`;

const Bar = styled.div`
    flex-shrink: 0;
    height: 1px;
    margin-top: 8px;
    background: ${p => p.theme.colors.primary}33;
`;

const Fill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
`;

const Dashed = styled.div`
    flex-shrink: 0;
    border-top: 1px dashed ${p => p.theme.colors.primary}40;
    margin: 10px 0 8px;
`;

const CatRow = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 22px;
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

const MemoArea = styled.textarea`
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: var(--widget-pad);
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.92rem;
    line-height: 1.7;
    color: ${p => p.theme.colors.text};
    background: transparent;
    &::placeholder { color: ${p => p.theme.colors.textSecondary}88; }
`;

const QuickInput = styled.input`
    flex-shrink: 0;
    margin-bottom: 8px;
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
