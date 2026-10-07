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
import { localDateKey, utcDayKey, activeTimeZone } from "@/lib/dateKey";
import { addDaysToKey, zonedDayStart } from "@/lib/timezone";
import { expandTodos } from "@/hooks/useExpandedTodos";
import { weeklyTaskStats } from "@/lib/widgetStats";
import * as OceanS from './ocean/OceanWidgetPanels.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

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
    const todayKey = useCurrentDayKey();
    const [offset, setOffset] = React.useState(0);
    const key = addDaysToKey(todayKey, offset);
    const date = React.useMemo(() => {
        return new Date(`${key}T00:00:00`);
    }, [key]);
    return {
        offset,
        date,
        key,
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

/**
 * 빠른 입력의 엔터.
 * 한글을 조합하던 중에 누른 엔터는 글자를 맺기만 한다(그 keydown 은 isComposing·229). 예전에는 그 엔터를 버려서
 * 한 번 더 눌러야 들어갔다 — "넣기가 잘 안 된다". 이제 조합 중 엔터는 기억해 두었다가 조합이 끝나는 순간 넣는다.
 * 같은 엔터가 맺은 뒤 한 번 더(13) 오는 IME 도 있으나, 넣는 중에는 submit 이 스스로 막는다.
 */
function useEnterSubmit(submit: (value: string) => void) {
    const enterWhileComposing = React.useRef(false);
    return {
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (e.nativeEvent.isComposing || e.keyCode === 229) { enterWhileComposing.current = true; return; }
            submit(e.currentTarget.value);
        },
        onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => {
            if (!enterWhileComposing.current) return;
            enterWhileComposing.current = false;
            const input = e.currentTarget;
            // 맺어진 글자가 value 에 들어간 뒤에 읽는다
            window.setTimeout(() => submit(input.value), 0);
        },
    };
}

export function TodayPanel() {
    const S = usePickTheme(STYLES);
    const { todos, toggleTodo, addTodo } = useTodoStore();
    const { categories } = useCategoryStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [draft, setDraft] = React.useState("");
    const [pending, setPending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const submitting = React.useRef(false);

    const day = useDayShift();
    const key = day.key;
    const t0 = day.date.getTime();

    const windowEnd = new Date(day.date);
    windowEnd.setDate(windowEnd.getDate() + 7);
    const occurrences = expandTodos(todos, day.date, windowEnd);
    const today = occurrences.filter(t => spansDay(t, key));
    const next = occurrences
        .filter(t => t.startAt && new Date(t.startAt).getTime() >= t0 + 86400000 && new Date(t.startAt).getTime() < t0 + 86400000 * 8)
        .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime());

    const hasNext = next.length > 0;

    const theme = useTheme();
    const color = (id: string) => categories.find(c => c.id === id)?.color || theme.colors.primary;
    const todayEnter = useEnterSubmit((value) => void submit(value));

    const submit = async (value: string = draft) => {
        const v = value.trim();
        if (!v || submitting.current) return;

        // 카테고리가 없으면 넣을 곳이 없다 — 예전엔 입력칸을 말없이 잠갔다
        const cat = categories[0];
        if (!cat) { setError(tr.category.selectOrAdd); return; }

        // 보고 있는 날에 넣는다 (오늘이면 지금부터 한 시간)
        const start = new Date(day.date);
        if (day.offset === 0) start.setTime(Date.now());
        else start.setHours(9, 0, 0, 0);
        const end = new Date(start.getTime() + 3600000);

        submitting.current = true;
        setPending(true);
        setError(null);
        const message = await addTodo(authFetch, {
            title: v,
            categoryId: cat.id,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
        });
        submitting.current = false;
        setPending(false);
        if (message) setError(message);
        else setDraft("");
    };

    return (
        <S.Pad>
            {/* 넣는 동안 잠그지 않는다 — 잠그면 초점이 빠져, 하나 넣을 때마다 입력칸을 다시 눌러야 했다 */}
            <S.QuickRow>
                <S.QuickInput
                    value={draft}
                    aria-label={tr.calendar.addTask}
                    aria-busy={pending}
                    maxLength={120}
                    placeholder={tr.calendar.addTask}
                    onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
                    {...todayEnter}
                />
                <S.AddBtn aria-label={tr.calendar.addTask} disabled={pending || !draft.trim()} onClick={() => void submit()}>+</S.AddBtn>
            </S.QuickRow>
            {error && <S.More role="alert">{error}</S.More>}
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
                : today.map(t => {
                    const done = doneOn(t, key);
                    return (
                        <S.Row key={t.id}>
                            <S.Box $done={done} aria-label={t.title} aria-pressed={done} onClick={() => toggleTodo(authFetch, t.originalTodo?.id ?? t.id, key)}>
                                {done && <Check size={9} strokeWidth={3} />}
                            </S.Box>
                            <S.Mark $c={color(t.categoryId)} />
                            <S.Name $done={done}>{t.title}</S.Name>
                        </S.Row>
                    );
                })}
            {hasNext && (
                <>
                    <S.SectionHead className="mt">{tr.home.upcoming}</S.SectionHead>
                    {next.map(t => {
                        const k = localDateKey(t.startAt!);
                        const done = doneOn(t, k);
                        const d = new Date(t.startAt!);
                        return (
                            <S.Row key={t.id}>
                                <S.Box $done={done} aria-label={t.title} aria-pressed={done} onClick={() => toggleTodo(authFetch, t.originalTodo?.id ?? t.id, k)}>
                                    {done && <Check size={9} strokeWidth={3} />}
                                </S.Box>
                                <S.Mark $c={color(t.categoryId)} />
                                <S.Name $done={done}>{t.title}</S.Name>
                                <S.Meta>{`${d.getMonth() + 1}/${d.getDate()}`}</S.Meta>
                            </S.Row>
                        );
                    })}
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
    const timed = expandTodos(todos, new Date(now), new Date(now + 7 * 86400000))
        .filter(t => t.startAt && t.endAt && !t.isAllDay && !doneOn(t, localDateKey(Math.max(now, new Date(t.startAt!).getTime()))));

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
    useMinuteTick(60000);

    const now = Date.now();
    const list = expandTodos(todos, new Date(now), new Date(now + 2 * 86400000))
        .filter(t => {
            if (!t.endAt) return false;
            const end = new Date(t.endAt).getTime();
            if (end < now || end > now + 86400000 * 2) return false;
            return !doneOn(t, localDateKey(t.endAt));
        })
        .sort((a, b) => new Date(a.endAt!).getTime() - new Date(b.endAt!).getTime());

    const theme = useTheme();
    const color = (id: string) => categories.find(c => c.id === id)?.color || theme.colors.primary;

    const left = (v: string | number | Date) => {
        const h = Math.round((new Date(v).getTime() - now) / 3600000);
        return h >= 24 ? `D-${Math.floor(h / 24)}` : tr.widget.hoursLeft(Math.max(0, h));
    };

    return (
        <S.Pad>
            <S.SectionHead>{tr.widget.dueSoon}</S.SectionHead>
            {list.length === 0
                ? <S.Thin>{tr.widget.noDue}</S.Thin>
                : list.map(t => {
                    const k = localDateKey(t.endAt!);
                    return (
                        <S.Row key={t.id}>
                            <S.Box $done={false} aria-label={t.title} aria-pressed={false} onClick={() => toggleTodo(authFetch, t.originalTodo?.id ?? t.id, k)} />
                            <S.Mark $c={color(t.categoryId)} />
                            <S.Name $done={false}>{t.title}</S.Name>
                            <S.Meta>{left(t.endAt!)}</S.Meta>
                        </S.Row>
                    );
                })}
        </S.Pad>
    );
}

export function AnniversaryPanel() {
    const S = usePickTheme(STYLES);
    const { anniversaries, fetchAnniversaries } = useAnniversaryStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    useCurrentDayKey();

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

    return (
        <S.Pad>
            <S.SectionHead>{tr.sidebar.anniversary}</S.SectionHead>
            {list.length === 0
                ? <S.Thin>{tr.home.noAnniversaries}</S.Thin>
                : list.map(a => (
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

    return (
        <S.Pad>
            <S.SectionHead>{tr.home.project}</S.SectionHead>
            {list.length === 0
                ? <S.Thin>{tr.home.noProjects}</S.Thin>
                : list.map(p => {
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
        </S.Pad>
    );
}

export function StatsPanel() {
    const todayKey = useCurrentDayKey();
    const S = usePickTheme(STYLES);
    const { todos: sourceTodos } = useTodoStore();
    const { categories } = useCategoryStore();
    const tr = useT();
    const [ref, box] = useFrame(22, 96);

    const weekKey = addDaysToKey(todayKey, -new Date(`${todayKey}T00:00:00Z`).getUTCDay());
    const base = zonedDayStart(weekKey, activeTimeZone())!;
    const weekEnd = new Date(zonedDayStart(addDaysToKey(weekKey, 7), activeTimeZone())!.getTime() - 1);
    const todos = expandTodos(sourceTodos, base, weekEnd);
    const { total, done, categories: categoryCounts } = weeklyTaskStats(todos, weekKey);
    const pct = total ? Math.round((done / total) * 100) : 0;

    const cats = categories
        .map(c => {
            const counts = categoryCounts.get(c.id) ?? { total: 0, done: 0 };
            return { ...c, ...counts };
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
    useCurrentDayKey();
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
                        <S.Dot key={i} $on={x.on} $today={x.isToday} aria-label={`${c.title} ${localDateKey(x.d)}`} aria-pressed={x.on} onClick={() => toggle(c.id, x.d)} />
                    ))}
                </S.Streak>
            </S.Pad>
        );
    }

    return (
        <S.Pad ref={ref}>
            <S.SectionHead>{tr.home.challenge}</S.SectionHead>
            {active.map(c => {
                const done = (c.completions ?? []).some(cp => utcDayKey(cp.targetDate) === key);
                const count = c.completions?.length ?? 0;
                return (
                    <S.Row key={c.id}>
                        <S.Box $done={done} aria-label={c.title} aria-pressed={done} onClick={() => toggle(c.id, today)}>
                            {done && <Check size={9} strokeWidth={3} />}
                        </S.Box>
                        <S.Name $done={done}>{c.title}</S.Name>
                        <S.Meta>{c.targetCount ? `${count}/${c.targetCount}` : count}</S.Meta>
                    </S.Row>
                );
            })}
        </S.Pad>
    );
}

export function MemoPanel() {
    const S = usePickTheme(STYLES);
    const { memo, memoDate, error, memoError, fetchDailyData, updateDailyMemo } = useDailyStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [draft, setDraft] = React.useState("");
    const [loaded, setLoaded] = React.useState(false);
    const draftRef = React.useRef(draft);
    draftRef.current = draft;
    const dirty = React.useRef(false);
    const key = useCurrentDayKey();

    React.useEffect(() => {
        setLoaded(false);
        dirty.current = false;
        let active = true;
        fetchDailyData(authFetch, zonedDayStart(key, activeTimeZone())!).then(() => {
            if (active) setLoaded(useDailyStore.getState().memoDate === key && !useDailyStore.getState().error);
        });
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    React.useEffect(() => {
        if (loaded && memoDate === key && !dirty.current) setDraft(memo ?? "");
    }, [loaded, memo, memoDate, key]);

    return (
        <S.MemoColumn>
        <S.MemoArea
            value={draft}
            aria-label={tr.calendar.memoPlaceholder}
            disabled={!loaded}
            placeholder={tr.calendar.memoPlaceholder}
            onChange={(e) => { dirty.current = true; setDraft(e.target.value); }}
            onBlur={async () => {
                if (!loaded || !dirty.current) return;
                const savedDraft = draft;
                const message = await updateDailyMemo(authFetch, zonedDayStart(key, activeTimeZone())!, savedDraft);
                if (!message && draftRef.current === savedDraft) dirty.current = false;
            }}
        />
        {(error || memoError) && <S.More role="alert">{error || memoError}</S.More>}
        </S.MemoColumn>
    );
}

export function QuickTaskPanel() {
    const S = usePickTheme(STYLES);
    const { tasks, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask } = useDailyStore();
    const authFetch = useAuthFetch();
    const tr = useT();
    const [text, setText] = React.useState("");
    const [pending, setPending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const submitting = React.useRef(false);
    const key = useCurrentDayKey();

    React.useEffect(() => {
        fetchDailyData(authFetch, zonedDayStart(key, activeTimeZone())!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const quickEnter = useEnterSubmit((value) => void submit(value));

    const submit = async (value: string = text) => {
        const v = value.trim();
        if (!v || submitting.current) return;
        submitting.current = true;
        setPending(true);
        setError(null);
        const message = await addDailyTask(authFetch, zonedDayStart(key, activeTimeZone())!, v);
        submitting.current = false;
        setPending(false);
        if (message) setError(message);
        else setText("");
    };

    return (
        <S.Column>
            <S.QuickRow>
                <S.QuickInput
                    value={text}
                    aria-label={tr.calendar.addTask}
                    aria-busy={pending}
                    maxLength={120}
                    placeholder={tr.calendar.addTask}
                    onChange={(e) => { setText(e.target.value); if (error) setError(null); }}
                    {...quickEnter}
                />
                <S.AddBtn aria-label={tr.calendar.addTask} disabled={pending || !text.trim()} onClick={() => void submit()}>+</S.AddBtn>
            </S.QuickRow>
            {error && <S.More role="alert">{error}</S.More>}
            <S.Fit>
                {tasks.length === 0
                    ? <S.Thin>{tr.home.noTodayTodos}</S.Thin>
                    : tasks.map(task => (
                        <S.Row key={task.id}>
                            <S.Box $done={task.isDone} aria-label={task.text} aria-pressed={task.isDone} onClick={() => toggleDailyTask(authFetch, task.id)}>
                                {task.isDone && <Check size={9} strokeWidth={3} />}
                            </S.Box>
                            <S.Name $done={task.isDone}>{task.text}</S.Name>
                            <S.DelBtn aria-label={`${tr.todo.delete}: ${task.text}`} onClick={() => deleteDailyTask(authFetch, task.id)}>×</S.DelBtn>
                        </S.Row>
                    ))}
            </S.Fit>
        </S.Column>
    );
}
