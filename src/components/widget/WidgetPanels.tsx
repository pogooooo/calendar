"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialWidgetPanels.styles";
import * as MapleS from "./maple/MapleWidgetPanels.styles";
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
import { dayKeyToIso, localDateKey, utcDayKey } from "@/lib/dateKey";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

/** 줄 높이는 모양 쪽(styles)이 정한다 — 몇 줄이 들어가는지 셀 때 같은 값을 봐야 한다 */
const ROW_PX = CelestialS.ROW_PX;
const NARROW_PX = 300;

const spansDay = (t: { startAt?: string | number | Date | null; endAt?: string | number | Date | null }, key: string) => {
    if (!t.startAt || !t.endAt) return false;
    return localDateKey(t.startAt) <= key && key <= localDateKey(t.endAt);
};

const doneOn = (t: { completions?: { targetDate: string | Date }[] }, key: string) =>
    (t.completions ?? []).some(c => utcDayKey(c.targetDate) === key);

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

/**
 * 위젯에서 날짜를 하루씩 옮긴다. 데스크톱 위젯은 늘 오늘만 보여 줬다 —
 * 어제 못 끝낸 것을 보려면 앱을 열어야 했다. 옮긴 날은 창을 닫으면 잊는다(오늘로 돌아온다).
 */
function useDayShift() {
    const [offset, setOffset] = React.useState(0);
    const date = React.useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + offset);
        return d;
    }, [offset]);
    return {
        offset,
        date,
        key: localDateKey(date),
        shift: (delta: number) => setOffset(o => o + delta),
        reset: () => setOffset(0),
    };
}

function useMinuteTick(ms = 30000) {
    const [, force] = React.useReducer((n: number) => n + 1, 0);
    React.useEffect(() => {
        const id = window.setInterval(force, ms);
        return () => window.clearInterval(id);
    }, [ms]);
}

export function TodayPanel() {
    const S = usePickTheme(STYLES);
    const { todos, toggleTodo, addTodo } = useTodoStore();
    const { categories } = useCategoryStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [ref, box] = useFrame(ROW_PX, 26 + 38 + 22);
    const [draft, setDraft] = React.useState("");

    const day = useDayShift();
    const key = day.key;
    const t0 = day.date.getTime();

    const today = todos.filter(t => spansDay(t, key));
    const next = todos
        .filter(t => t.startAt && new Date(t.startAt).getTime() >= t0 + 86400000 && new Date(t.startAt).getTime() < t0 + 86400000 * 8)
        .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime());

    const hasNext = next.length > 0;
    const budget = Math.max(1, box.rows - (hasNext ? 1 : 0));
    const todayCap = hasNext ? Math.max(1, Math.round(budget * 0.6)) : budget;
    const nextCap = Math.max(0, budget - todayCap);

    const theme = useTheme();
    const color = (id: string) => categories.find(c => c.id === id)?.color || theme.colors.primary;

    const submit = () => {
        const v = draft.trim();
        if (!v) return;

        const cat = categories[0];
        if (!cat) return;

        // 보고 있는 날에 넣는다 (오늘이면 지금부터 한 시간)
        const start = new Date(day.date);
        if (day.offset === 0) start.setTime(Date.now());
        else start.setHours(9, 0, 0, 0);
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
        <S.Pad ref={ref}>
            <S.QuickInput
                value={draft}
                placeholder={tr.calendar.addTask}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <S.DayNav>
                <S.NavBtn type="button" onClick={() => day.shift(-1)} aria-label={tr.calendar.prevDay}>‹</S.NavBtn>
                <button type="button" className="label" onClick={day.reset} disabled={day.offset === 0}>
                    {day.offset === 0 ? tr.home.today : tr.calendar.dayLabelShort(day.date.getMonth() + 1, day.date.getDate())}
                </button>
                <S.NavBtn type="button" onClick={() => day.shift(1)} aria-label={tr.calendar.nextDay}>›</S.NavBtn>
            </S.DayNav>
            {/* 날짜는 위의 줄이 말한다 — 여기서 또 "오늘" 이라고 하면 같은 말이 두 번이다 */}
            <S.SectionHead>{tr.home.tasks}</S.SectionHead>
            {today.length === 0
                ? <S.Thin>{day.offset === 0 ? tr.home.noTodayTodos : tr.home.noDayTodos}</S.Thin>
                : today.slice(0, todayCap).map(t => {
                    const done = doneOn(t, key);
                    return (
                        <S.Row key={t.id}>
                            <S.Box $done={done} onClick={() => toggleTodo(authFetch, t.id, key)}>
                                {done && <Check size={9} strokeWidth={3} />}
                            </S.Box>
                            <S.Mark $c={color(t.categoryId)} />
                            <S.Name $done={done}>{t.title}</S.Name>
                        </S.Row>
                    );
                })}
            {today.length > todayCap && <S.More>{`+${today.length - todayCap}`}</S.More>}

            {hasNext && nextCap > 0 && (
                <>
                    <S.SectionHead className="mt">{tr.home.upcoming}</S.SectionHead>
                    {next.slice(0, nextCap).map(t => {
                        const k = localDateKey(t.startAt!);
                        const done = doneOn(t, k);
                        const d = new Date(t.startAt!);
                        return (
                            <S.Row key={t.id}>
                                <S.Box $done={done} onClick={() => toggleTodo(authFetch, t.id, k)}>
                                    {done && <Check size={9} strokeWidth={3} />}
                                </S.Box>
                                <S.Mark $c={color(t.categoryId)} />
                                <S.Name $done={done}>{t.title}</S.Name>
                                <S.Meta>{`${d.getMonth() + 1}/${d.getDate()}`}</S.Meta>
                            </S.Row>
                        );
                    })}
                    {next.length > nextCap && <S.More>{`+${next.length - nextCap}`}</S.More>}
                </>
            )}
        </S.Pad>
    );
}

export function NowNextPanel() {
    const S = usePickTheme(STYLES);
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

    const theme = useTheme();
    const color = (id: string) => categories.find(c => c.id === id)?.color || theme.colors.primary;

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
        <S.Pad>
            <S.BigRow>
                <S.SectionHead>{tr.widget.now}</S.SectionHead>
                {current ? (
                    <>
                        <S.NowTitle><S.Mark $c={color(current.categoryId)} />{current.title}</S.NowTitle>
                        <S.NowMeta>{`${hhmm(current.startAt!)} – ${hhmm(current.endAt!)} · ${untilText(new Date(current.endAt!).getTime() - now)}`}</S.NowMeta>
                        <S.Bar><S.Fill $pct={pct} /></S.Bar>
                    </>
                ) : (
                    <S.NowMeta>{tr.widget.nothingNow}</S.NowMeta>
                )}
            </S.BigRow>

            <S.Dashed />

            <S.BigRow>
                <S.SectionHead>{tr.widget.next}</S.SectionHead>
                {upcoming ? (
                    <>
                        <S.NowTitle><S.Mark $c={color(upcoming.categoryId)} />{upcoming.title}</S.NowTitle>
                        <S.NowMeta>{`${hhmm(upcoming.startAt!)} · ${untilText(new Date(upcoming.startAt!).getTime() - now)}`}</S.NowMeta>
                    </>
                ) : (
                    <S.NowMeta>{tr.widget.nothingNext}</S.NowMeta>
                )}
            </S.BigRow>
        </S.Pad>
    );
}

export function DuePanel() {
    const S = usePickTheme(STYLES);
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
            return !doneOn(t, localDateKey(t.endAt));
        })
        .sort((a, b) => new Date(a.endAt!).getTime() - new Date(b.endAt!).getTime());

    const cap = Math.max(1, box.rows);
    const theme = useTheme();
    const color = (id: string) => categories.find(c => c.id === id)?.color || theme.colors.primary;

    const left = (v: string | number | Date) => {
        const h = Math.round((new Date(v).getTime() - now) / 3600000);
        return h >= 24 ? `D-${Math.floor(h / 24)}` : tr.widget.hoursLeft(Math.max(0, h));
    };

    return (
        <S.Pad ref={ref}>
            <S.SectionHead>{tr.widget.dueSoon}</S.SectionHead>
            {list.length === 0
                ? <S.Thin>{tr.widget.noDue}</S.Thin>
                : list.slice(0, cap).map(t => {
                    const k = localDateKey(t.endAt!);
                    return (
                        <S.Row key={t.id}>
                            <S.Box $done={false} onClick={() => toggleTodo(authFetch, t.id, k)} />
                            <S.Mark $c={color(t.categoryId)} />
                            <S.Name $done={false}>{t.title}</S.Name>
                            <S.Meta>{left(t.endAt!)}</S.Meta>
                        </S.Row>
                    );
                })}
            {list.length > cap && <S.More>{`+${list.length - cap}`}</S.More>}
        </S.Pad>
    );
}

export function AnniversaryPanel() {
    const S = usePickTheme(STYLES);
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
        <S.Pad ref={ref}>
            <S.SectionHead>{tr.sidebar.anniversary}</S.SectionHead>
            {list.length === 0
                ? <S.Thin>{tr.home.noAnniversaries}</S.Thin>
                : list.slice(0, cap).map(a => (
                    <S.Row key={a.id}>
                        <S.Star>✦</S.Star>
                        <S.Name $done={false}>{a.title}</S.Name>
                        <S.Meta className={a.dday === 0 ? "hot" : ""}>{a.dday === 0 ? "D-DAY" : `D-${a.dday}`}</S.Meta>
                    </S.Row>
                ))}
        </S.Pad>
    );
}

export function ProjectsPanel() {
    const S = usePickTheme(STYLES);
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
        <S.Pad ref={ref}>
            <S.SectionHead>{tr.home.project}</S.SectionHead>
            {list.length === 0
                ? <S.Thin>{tr.home.noProjects}</S.Thin>
                : list.slice(0, cap).map(p => {
                    const tasks = p.tasks ?? [];
                    const done = tasks.filter(t => t.status === "done").length;
                    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
                    return (
                        <S.ProjRow key={p.id}>
                            <S.ProjTop>
                                <S.Name $done={false}>{p.title}</S.Name>
                                <S.Meta>{`${done}/${tasks.length}`}</S.Meta>
                            </S.ProjTop>
                            <S.Bar><S.Fill $pct={pct} /></S.Bar>
                        </S.ProjRow>
                    );
                })}
            {list.length > cap && <S.More>{`+${list.length - cap}`}</S.More>}
        </S.Pad>
    );
}

export function StatsPanel() {
    const S = usePickTheme(STYLES);
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
        const k = localDateKey(d);
        todos.forEach(t => {
            if (!spansDay(t, k)) return;
            total += 1;
            if (doneOn(t, k)) done += 1;
        });
    }
    const pct = total ? Math.round((done / total) * 100) : 0;

    const key = localDateKey(new Date());
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
        <S.Pad ref={ref}>
            <S.Big>{pct}<span>%</span></S.Big>
            <S.Caption>{tr.home.doneRatio(done, total)}</S.Caption>
            <S.Bar><S.Fill $pct={pct} /></S.Bar>
            {cap > 0 && (
                <>
                    <S.Dashed />
                    {cats.length === 0
                        ? <S.Thin>{tr.home.noData}</S.Thin>
                        : cats.slice(0, cap).map(c => (
                            <S.CatRow key={c.id}>
                                <S.Mark $c={c.color} />
                                <S.CatName>{c.name}</S.CatName>
                                <S.CatBar><S.CatFill $c={c.color} $pct={(c.total / max) * 100} /></S.CatBar>
                                <S.Meta>{`${c.done}/${c.total}`}</S.Meta>
                            </S.CatRow>
                        ))}
                </>
            )}
        </S.Pad>
    );
}

export function ChallengePanel() {
    const S = usePickTheme(STYLES);
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

    const key = localDateKey(today);
    const toggle = (id: string, d: Date) => {
        const safe = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        toggleChallengeCompletion(authFetch, id, safe.toISOString());
    };

    if (active.length === 0) {
        return <S.Pad ref={ref}><S.SectionHead>{tr.home.challenge}</S.SectionHead><S.Thin>{tr.home.noChallenges}</S.Thin></S.Pad>;
    }

    if (box.height < 260) {
        const c = active[0];
        const set = new Set((c.completions ?? []).map(x => utcDayKey(x.targetDate)));
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - 13 + i);
            return { d, on: set.has(localDateKey(d)), isToday: i === 13 };
        });
        return (
            <S.Pad ref={ref}>
                <S.SectionHead>{tr.home.challenge}</S.SectionHead>
                <S.NowTitle>{c.title}</S.NowTitle>
                <S.NowMeta>{c.targetCount ? `${c.completions?.length ?? 0}/${c.targetCount}` : `${c.completions?.length ?? 0}`}</S.NowMeta>
                <S.Streak>
                    {days.map((x, i) => (
                        <S.Dot key={i} $on={x.on} $today={x.isToday} onClick={() => toggle(c.id, x.d)} />
                    ))}
                </S.Streak>
            </S.Pad>
        );
    }

    const cap = Math.max(1, box.rows);

    return (
        <S.Pad ref={ref}>
            <S.SectionHead>{tr.home.challenge}</S.SectionHead>
            {active.slice(0, cap).map(c => {
                const done = (c.completions ?? []).some(cp => utcDayKey(cp.targetDate) === key);
                const count = c.completions?.length ?? 0;
                return (
                    <S.Row key={c.id}>
                        <S.Box $done={done} onClick={() => toggle(c.id, today)}>
                            {done && <Check size={9} strokeWidth={3} />}
                        </S.Box>
                        <S.Name $done={done}>{c.title}</S.Name>
                        <S.Meta>{c.targetCount ? `${count}/${c.targetCount}` : count}</S.Meta>
                    </S.Row>
                );
            })}
            {active.length > cap && <S.More>{`+${active.length - cap}`}</S.More>}
        </S.Pad>
    );
}

export function MemoPanel() {
    const S = usePickTheme(STYLES);
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
        <S.MemoArea
            value={draft}
            placeholder={tr.calendar.memoPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => updateDailyMemo(authFetch, new Date(dayKeyToIso(key)), draft)}
        />
    );
}

export function QuickTaskPanel() {
    const S = usePickTheme(STYLES);
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
        <S.Column>
            <S.QuickInput
                value={text}
                placeholder={tr.calendar.addTask}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <S.Fit ref={ref}>
                {tasks.length === 0
                    ? <S.Thin>{tr.home.noTodayTodos}</S.Thin>
                    : tasks.slice(0, cap).map(task => (
                        <S.Row key={task.id}>
                            <S.Box $done={task.isDone} onClick={() => toggleDailyTask(authFetch, task.id)}>
                                {task.isDone && <Check size={9} strokeWidth={3} />}
                            </S.Box>
                            <S.Name $done={task.isDone}>{task.text}</S.Name>
                            <S.DelBtn onClick={() => deleteDailyTask(authFetch, task.id)}>×</S.DelBtn>
                        </S.Row>
                    ))}
                {tasks.length > cap && <S.More>{`+${tasks.length - cap}`}</S.More>}
            </S.Fit>
        </S.Column>
    );
}
