"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import useTodoStore from "@/store/useTodoStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import useCategoryStore from "@/store/useCategoryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useT } from "@/i18n/useT";
import { localDateKey, utcDayKey } from "@/lib/dateKey";
import { Plus, SlidersHorizontal } from "lucide-react";
import Arrow from "@/assets/Arrow";
import DateTimePicker from "@/components/input/dateTimePicker/DateTimePicker";
import useSwipe from "@/hooks/useSwipe";
import { localDateKey as toKey } from "@/lib/dateKey";
import ChallengeModal, { type ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import { useDialog } from "@/components/dialog/DialogProvider";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialHome.styles";
import * as MapleS from "./maple/MapleHome.styles";
import MonthArch from "./parts/MonthArch";
import EmptyArt from "@/components/empty/EmptyArt";
import CelestialHomeLayout from "./celestial/CelestialHomeLayout";
import MapleHomeLayout from "./maple/MapleHomeLayout";
import { expandTodos } from "@/hooks/useExpandedTodos";
import { addDaysToKey, zonedDayStart } from "@/lib/timezone";
import { activeTimeZone } from "@/lib/dateKey";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

const LAYOUTS = { celestial: CelestialHomeLayout, maple: MapleHomeLayout };

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function HomeView() {
    const S = usePickTheme(STYLES);
    const Layout = usePickTheme(LAYOUTS);
    const { todos, toggleTodo, addTodo } = useTodoStore();
    const { projects, fetchProjects } = useProjectStore();
    const { challenges, fetchChallenges, toggleChallengeCompletion, addChallenge } = useChallengeStore();
    const { anniversaries, fetchAnniversaries, addAnniversary } = useAnniversaryStore();
    const { categories, fetchCategories } = useCategoryStore();
    const authFetch = useAuthFetch();
    const router = useRouter();
    const t = useT();
    const dialog = useDialog();

    React.useEffect(() => {
        fetchProjects(authFetch);
        fetchChallenges(authFetch);
        fetchAnniversaries(authFetch);
        fetchCategories(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── 보는 날 ──────────────────────────────────────────────────────────
       홈은 오늘만 보여 줬다. 어제 못 끝낸 것, 내일 할 것을 보려면 달력으로 나가야 했다.
       왼쪽(달 눈금·목록)은 "보는 날" 을 따르고, 오른쪽 기둥(프로젝트·챌린지·기념일)은
       늘 오늘 기준이다 — 그쪽은 "지금 어떤가" 를 보는 자리라서. */
    const todayKey = useCurrentDayKey();
    const realTodayTime = React.useMemo(() => new Date(`${todayKey}T00:00:00`).getTime(), [todayKey]);
    const [focusTime, setFocusTime] = React.useState(realTodayTime);
    const previousToday = React.useRef(realTodayTime);
    React.useEffect(() => {
        const previous = previousToday.current;
        setFocusTime(value => value === previous ? realTodayTime : value);
        previousToday.current = realTodayTime;
    }, [realTodayTime]);
    const focus = React.useMemo(() => new Date(focusTime), [focusTime]);
    const isToday = focusTime === realTodayTime;

    const shiftDay = React.useCallback((delta: number) => {
        setFocusTime(t2 => {
            const d = new Date(t2);
            d.setDate(d.getDate() + delta);
            return d.setHours(0, 0, 0, 0);
        });
    }, []);

    /* 폰에서는 목록을 좌우로 쓸어 하루씩 넘긴다 (달력 화면과 같은 손짓) */
    const daySwipe = useSwipe(() => shiftDay(1), () => shiftDay(-1));

    /* 데스크톱에서는 ←·→ 로 하루씩, T 로 오늘. 글을 적는 중에는 자판을 뺏지 않는다 */
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = document.activeElement;
            const typing = el instanceof HTMLElement
                && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
            if (typing || e.isComposing || document.querySelector('[role="dialog"]') || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === "ArrowLeft") { e.preventDefault(); shiftDay(-1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); shiftDay(1); }
            else if (e.key === "t" || e.key === "T") setFocusTime(new Date().setHours(0, 0, 0, 0));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [shiftDay]);

    const year = focus.getFullYear();
    const month = focus.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const focusIdx = focus.getDate() - 1;
    const focusKey = localDateKey(focus);

    const spansDay = React.useCallback(
        (t2: { startAt?: string | number | Date | null; endAt?: string | number | Date | null }, key: string) => {
            if (!t2.startAt || !t2.endAt) return false;
            return localDateKey(t2.startAt) <= key && key <= localDateKey(t2.endAt);
        },
        []
    );

    const isDoneOn = React.useCallback(
        (t2: { completions?: { targetDate: string | Date }[] }, key: string) =>
            (t2.completions ?? []).some(c => utcDayKey(c.targetDate) === key),
        []
    );

    const monthDays = React.useMemo(
        () => Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad2(month + 1)}-${pad2(i + 1)}`),
        [year, month, daysInMonth]
    );

    const homeTodos = React.useMemo(() => expandTodos(todos,
        zonedDayStart(monthDays[0], activeTimeZone())!,
        new Date(zonedDayStart(addDaysToKey(monthDays[monthDays.length - 1], 9), activeTimeZone())!.getTime() - 1)), [todos, monthDays]);

    const monthLoad = React.useMemo(
        () => monthDays.map(k => homeTodos.filter(t2 => spansDay(t2, k)).length),
        [monthDays, homeTodos, spansDay]
    );

    const monthStats = React.useMemo(() => {
        let total = 0;
        let done = 0;
        monthDays.forEach(k => {
            homeTodos.forEach(t2 => {
                if (!spansDay(t2, k)) return;
                total += 1;
                if (isDoneOn(t2, k)) done += 1;
            });
        });
        return { left: total - done, done };
    }, [monthDays, homeTodos, spansDay, isDoneOn]);

    const marks = React.useMemo(() => {
        const seen = new Set<string>();
        const out: { day: number; kind: "due" | "anv" }[] = [];

        projects.forEach(p => {
            (p.tasks ?? []).forEach(task => {
                if (!task.endAt || task.status === "done") return;
                const d = new Date(task.endAt);
                if (d.getFullYear() !== year || d.getMonth() !== month) return;
                const id = `due-${d.getDate()}`;
                if (seen.has(id)) return;
                seen.add(id);
                out.push({ day: d.getDate(), kind: "due" });
            });
        });

        anniversaries.forEach(a => {
            if (a.month !== month + 1) return;
            const id = `anv-${a.day}`;
            if (seen.has(id)) return;
            seen.add(id);
            out.push({ day: a.day, kind: "anv" });
        });

        return out;
    }, [projects, anniversaries, year, month]);

    const dayTodos = React.useMemo(
        () => homeTodos.filter(t2 => spansDay(t2, focusKey)),
        [homeTodos, focusKey, spansDay]
    );

    const upcomingTodos = React.useMemo(() => {
        const start = new Date(focusTime + 86400000);
        const end = new Date(focusTime + 86400000 * 8);
        return homeTodos
            .filter(t2 => t2.startAt && new Date(t2.startAt) >= start && new Date(t2.startAt) < end)
            .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())
            .slice(0, 6);
    }, [homeTodos, focusTime]);

    const activeProjects = React.useMemo(
        () => projects.filter(p => p.status !== "done").slice(0, 4),
        [projects]
    );

    const activeChallenges = React.useMemo(
        () =>
            challenges
                .filter(c => {
                    const target = c.targetCount ?? null;
                    return target === null || (c.completions?.length ?? 0) < target;
                })
                .slice(0, 3),
        [challenges]
    );

    const upcomingAnniversaries = React.useMemo(() => {
        const thisYear = new Date(realTodayTime).getFullYear();
        return anniversaries
            .map(a => {
                let d = new Date(thisYear, a.month - 1, a.day);
                if (d.getTime() < realTodayTime) d = new Date(thisYear + 1, a.month - 1, a.day);
                return { ...a, dday: Math.round((d.getTime() - realTodayTime) / 86400000) };
            })
            .sort((a, b) => a.dday - b.dday)
            .slice(0, 3);
    }, [anniversaries, realTodayTime]);

    const handleToggleTodo = (id: string) => toggleTodo(authFetch, id, focus.toISOString());

    /* ── 홈에서 바로 만들기 ───────────────────────────────────────────────
       챌린지는 물어볼 것이 많아 기존 창을 그대로 띄우고,
       기념일은 이름과 날짜뿐이라 그 자리에서 한 줄로 받는다. */
    const [challengeOpen, setChallengeOpen] = React.useState(false);
    const [anvOpen, setAnvOpen] = React.useState(false);
    const [anvTitle, setAnvTitle] = React.useState("");
    const [anvDate, setAnvDate] = React.useState(() => localDateKey(new Date()));
    const [anvPending, setAnvPending] = React.useState(false);

    const handleSaveChallenge = async (data: ChallengeData) => {
        // 서버가 시작일을 요구한다. 홈에서 만들면 오늘부터 시작이다.
        // (정오로 저장해야 어느 시간대에서 읽어도 같은 달력일로 해석된다)
        const startAt = `${localDateKey(new Date())}T12:00:00.000Z`;
        const error = await addChallenge(authFetch, { ...data, startAt });
        if (error) { await dialog.notify({ title: t.saveError.scopes.challenge, message: error }); return; }
        setChallengeOpen(false);
    };

    const handleAddAnniversary = async (e: React.FormEvent) => {
        e.preventDefault();
        const title = anvTitle.trim();
        const m = anvDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!title || !m || anvPending) return;

        setAnvPending(true);
        const error = await addAnniversary(authFetch, { title, month: Number(m[2]), day: Number(m[3]) });
        setAnvPending(false);
        if (error) { await dialog.notify({ title: t.saveError.scopes.anniversary, message: error }); return; }
        setAnvTitle("");
        setAnvOpen(false);
    };

    /* ── 오늘 한 줄 추가 ──────────────────────────────────────────────────
       홈에서 할 수 있는 일이 눈으로 보는 것뿐이면 굳이 홈에 올 이유가 없다.
       가장 자주 하는 일(오늘 할 일 적기)을 여기서 바로 끝낸다. */
    const [quick, setQuick] = React.useState("");
    const [quickPending, setQuickPending] = React.useState(false);
    const [quickError, setQuickError] = React.useState<string | null>(null);
    const quickCategory = categories[0];
    // "자세히": 적던 제목을 들고 할 일 창(시간·카테고리·반복·메모)을 연다. 빠른 추가는 하루 종일로만 넣기 때문
    const [detailOpen, setDetailOpen] = React.useState(false);
    const openDetail = () => { setQuickError(null); setDetailOpen(true); };
    const closeDetail = () => { setDetailOpen(false); setQuick(""); };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const title = quick.trim();
        if (!title || quickPending) return;
        if (!quickCategory) { setQuickError(t.category.selectOrAdd); return; }

        setQuickPending(true);
        setQuickError(null);
        // 하루 종일 일정으로 넣는다. 시간을 물으면 한 줄 추가가 아니게 된다. 넣는 날은 지금 보고 있는 날이다.
        const start = new Date(focusTime);
        const end = new Date(focusTime);
        end.setHours(23, 59, 0, 0);
        const error = await addTodo(authFetch, {
            title,
            categoryId: quickCategory.id,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            isAllDay: true,
        });
        setQuickPending(false);
        if (error) { setQuickError(error); return; }
        setQuick("");
    };

    const handleToggleChallenge = (id: string, d: Date) => {
        const safe = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        return toggleChallengeCompletion(authFetch, id, safe.toISOString());
    };

    const streakOf = (completions?: { targetDate: string | Date }[]) => {
        const set = new Set((completions ?? []).map(c => utcDayKey(c.targetDate)));
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(realTodayTime);
            d.setDate(d.getDate() - 6 + i);
            return { date: d, done: set.has(localDateKey(d)), isToday: i === 6 };
        });
    };

    const regions = {
        arch: (<S.ArchWrap>
                        <MonthArch daysInMonth={daysInMonth} focusIdx={focusIdx} monthLoad={monthLoad} marks={marks} />

                        <S.ArchFoot>
                            <span className="edge">1</span>
                            <span className="center">
                                <i>✦</i>
                                <span className="summary">{t.home.monthLabel(month + 1)} · {t.home.monthSummary(monthStats.left, monthStats.done)}</span>
                                <i>✦</i>
                            </span>
                            <span className="edge">{daysInMonth}</span>
                        </S.ArchFoot>
                    </S.ArchWrap>),
        navigation: (<S.DayNav>
                        <S.NavButton type="button" onClick={() => shiftDay(-1)} aria-label={t.calendar.prevDay}>
                            <Arrow width={34} height={13} isRight={false} />
                        </S.NavButton>
                        <S.DayPick>
                            <DateTimePicker
                                mode="date"
                                short
                                value={toKey(focus)}
                                onChange={(v) => {
                                    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
                                    if (m) setFocusTime(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).setHours(0, 0, 0, 0));
                                }}
                            />
                        </S.DayPick>
                        <S.NavButton type="button" onClick={() => shiftDay(1)} aria-label={t.calendar.nextDay}>
                            <Arrow width={34} height={13} isRight />
                        </S.NavButton>
                        <S.TodayButton type="button" onClick={() => setFocusTime(realTodayTime)} disabled={isToday}>
                            {t.home.today}
                        </S.TodayButton>
                    </S.DayNav>),
        today: (<S.ListCol>
                            <S.SectionHead>
                                <i className="hd" />
                                {isToday ? t.home.today : t.calendar.dayLabelShort(month + 1, focus.getDate())}
                                <span className="hr" />
                                <b>{dayTodos.length}</b>
                            </S.SectionHead>
                            <S.QuickForm onSubmit={handleQuickAdd}>
                                <i className="dot" style={quickCategory ? { background: quickCategory.color } : undefined} />
                                <input
                                    value={quick}
                                    onChange={(e) => { setQuick(e.target.value); setQuickError(null); }}
                                    placeholder={t.calendar.addTask}
                                    maxLength={120}
                                    aria-label={t.calendar.addTask}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault();
                                    }}
                                />
                                <button type="button" className="detail" onClick={openDetail} aria-label={t.home.quickDetail} title={t.home.quickDetail}>
                                    <SlidersHorizontal size={15} strokeWidth={2} />
                                </button>
                                <button type="submit" disabled={!quick.trim() || quickPending} aria-label={t.calendar.newTodo}>
                                    <Plus size={16} strokeWidth={2.5} />
                                </button>
                            </S.QuickForm>
                            {quickError && <S.QuickError role="alert">{quickError}</S.QuickError>}

                            <S.Scroll>
                                {dayTodos.length === 0 ? (
                                    <S.Empty><EmptyArt kind="todos" />{isToday ? t.home.noTodayTodos : t.home.noDayTodos}</S.Empty>
                                ) : (
                                    dayTodos.map(todo => {
                                        const done = isDoneOn(todo, focusKey);
                                        return (
                                            <S.Row key={todo.id} type="button" aria-pressed={done} $done={done} onClick={() => handleToggleTodo(todo.originalTodo?.id ?? todo.id)}>
                                                <S.Mark $on={done} />
                                                <span className="name">{todo.title}</span>
                                            </S.Row>
                                        );
                                    })
                                )}
                            </S.Scroll>
                        </S.ListCol>),
        upcoming: (<S.ListCol>
                            <S.SectionHead>
                                <i className="hd" />
                                {t.home.thisWeek}
                                <span className="hr" />
                                <b>{upcomingTodos.length}</b>
                            </S.SectionHead>
                            <S.Scroll>
                                {upcomingTodos.length === 0 ? (
                                    <S.Empty>{t.home.noUpcoming}</S.Empty>
                                ) : (
                                    upcomingTodos.map(todo => {
                                        const key = localDateKey(todo.startAt!);
                                        const done = isDoneOn(todo, key);
                                        return (
                                            // 그 날로 데려간다. 그냥 /calendar 로 보내면 오늘이 열려 다시 찾아야 한다.
                                            <S.Row key={todo.id} type="button" $done={done} $soft onClick={() => router.push(`/calendar?date=${key}`)}>
                                                <S.Mark $on={done} />
                                                <span className="name">{todo.title}</span>
                                                <em>{t.calendar.days[new Date(todo.startAt!).getDay()]}</em>
                                            </S.Row>
                                        );
                                    })
                                )}
                            </S.Scroll>
                        </S.ListCol>),
        projects: (<><S.PillarHead onClick={() => router.push("/project")}>
                        <span className="idx">I</span>
                        {t.home.project}
                        <i className="rule" />
                    </S.PillarHead>
                    {activeProjects.length === 0 ? (
                        <S.Empty>{t.home.noProjects}</S.Empty>
                    ) : (
                        activeProjects.map(p => {
                            const tasks = p.tasks ?? [];
                            const done = tasks.filter(task => task.status === "done").length;
                            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
                            return (
                                <S.ProjectRow key={p.id} role="button" tabIndex={0}
                                    onClick={() => router.push("/project")}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push("/project"); }}>
                                    <span className="name">{p.title}</span>
                                    <i className="bar">
                                        <b style={{ width: `${pct}%` }} />
                                    </i>
                                    <em>{done}/{tasks.length}</em>
                                </S.ProjectRow>
                            );
                        })
                    )}

                    </>),
        challenges: (<><S.PillarHeadRow className="mt">
                        <S.PillarHead onClick={() => router.push("/challenge")}>
                            <span className="idx">II</span>
                            {t.home.challenge}
                            <i className="rule" />
                        </S.PillarHead>
                        <S.PillarAdd
                            type="button"
                            aria-label={t.challenge.createTitle}
                            onClick={() => setChallengeOpen(true)}
                        >
                            <Plus size={13} strokeWidth={2.5} />
                        </S.PillarAdd>
                    </S.PillarHeadRow>
                    {activeChallenges.length === 0 ? (
                        <S.Empty>{t.home.noChallenges}</S.Empty>
                    ) : (
                        activeChallenges.map(c => {
                            const slots = streakOf(c.completions);
                            const count = c.completions?.length ?? 0;
                            return (
                                <S.ChallengeRow key={c.id}>
                                    <span className="name">{c.title}</span>
                                    <em>{count}{c.targetCount ? `/${c.targetCount}` : ""}</em>
                                    <span className="streak">
                                        {slots.map((s, i) => (
                                            <S.Slot
                                                key={i}
                                                type="button"
                                                $on={s.done}
                                                $today={s.isToday}
                                                aria-label={`${c.title} ${localDateKey(s.date)}`}
                                                aria-pressed={s.done}
                                                onClick={() => handleToggleChallenge(c.id, s.date)}
                                            />
                                        ))}
                                    </span>
                                </S.ChallengeRow>
                            );
                        })
                    )}

                    </>),
        anniversaries: (<><S.PillarHeadRow className="mt">
                        <S.PillarHead onClick={() => router.push("/anniversary")}>
                            <span className="idx">III</span>
                            {t.sidebar.anniversary}
                            <i className="rule" />
                        </S.PillarHead>
                        <S.PillarAdd
                            type="button"
                            aria-label={t.home.addAnniversary}
                            onClick={() => setAnvOpen(v => !v)}
                        >
                            <Plus size={13} strokeWidth={2.5} />
                        </S.PillarAdd>
                    </S.PillarHeadRow>

                    {anvOpen && (
                        <S.AnvForm onSubmit={handleAddAnniversary}>
                            <input
                                value={anvTitle}
                                onChange={(e) => setAnvTitle(e.target.value)}
                                placeholder={t.home.anniversaryName}
                                maxLength={40}
                                autoFocus
                            />
                            <input type="date" value={anvDate} onChange={(e) => setAnvDate(e.target.value)} />
                            <button type="submit" disabled={!anvTitle.trim() || anvPending}>
                                <Plus size={14} strokeWidth={2.5} />
                            </button>
                        </S.AnvForm>
                    )}
                    {upcomingAnniversaries.length === 0 ? (
                        <S.Empty>{t.home.noAnniversaries}</S.Empty>
                    ) : (
                        upcomingAnniversaries.map(a => (
                            <S.AnniversaryRow key={a.id} role="button" tabIndex={0}
                                onClick={() => router.push("/anniversary")}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push("/anniversary"); }}>
                                <span className="star">✦</span>
                                <span className="name">{a.title}</span>
                                <em>{a.dday === 0 ? "D-DAY" : `D-${a.dday}`}</em>
                            </S.AnniversaryRow>
                        ))
                    )}
                </>),
        dialogs: (<><TodoModal
                isOpen={detailOpen}
                onClose={closeDetail}
                categories={categories}
                initialTitle={quick}
            />

            <ChallengeModal
                isOpen={challengeOpen}
                onClose={() => setChallengeOpen(false)}
                categories={categories}
                initialData={null}
                onSave={handleSaveChallenge}
            />
        </>),
        listProps: daySwipe,
    };
    return <Layout {...regions} />;
}
