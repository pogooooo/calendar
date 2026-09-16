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
import ChallengeModal, { type ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import { useDialog } from "@/components/dialog/DialogProvider";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialHome.styles";
import * as MapleS from "./maple/MapleHome.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

const CX = 120;
const CY = 122;
const R = 104;
const MAX_LOAD = 6;

const pad2 = (n: number) => String(n).padStart(2, "0");

const polar = (r: number, deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

const diamond = (x: number, y: number, s: number) => ({
    x: x - s / 2,
    y: y - s / 2,
    width: s,
    height: s,
    transform: `rotate(45 ${x} ${y})`,
});

const starPath = (x: number, y: number, s: number) =>
    `M ${x} ${y - s} L ${x + s * 0.24} ${y - s * 0.24} L ${x + s} ${y}` +
    ` L ${x + s * 0.24} ${y + s * 0.24} L ${x} ${y + s} L ${x - s * 0.24} ${y + s * 0.24}` +
    ` L ${x - s} ${y} L ${x - s * 0.24} ${y - s * 0.24} Z`;

const SPOKES = Array.from({ length: 45 }, (_, i) => -88 + i * 4);

export default function HomeView() {
    const S = usePickTheme(STYLES);
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

    const todayTime = React.useMemo(() => new Date().setHours(0, 0, 0, 0), []);
    const today = React.useMemo(() => new Date(todayTime), [todayTime]);
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIdx = today.getDate() - 1;
    const todayKey = localDateKey(today);

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

    const monthLoad = React.useMemo(
        () => monthDays.map(k => todos.filter(t2 => spansDay(t2, k)).length),
        [monthDays, todos, spansDay]
    );

    const monthStats = React.useMemo(() => {
        let total = 0;
        let done = 0;
        monthDays.forEach(k => {
            todos.forEach(t2 => {
                if (!spansDay(t2, k)) return;
                total += 1;
                if (isDoneOn(t2, k)) done += 1;
            });
        });
        return { left: total - done, done };
    }, [monthDays, todos, spansDay, isDoneOn]);

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

    const todayTodos = React.useMemo(
        () => todos.filter(t2 => spansDay(t2, todayKey)),
        [todos, todayKey, spansDay]
    );

    const upcomingTodos = React.useMemo(() => {
        const start = new Date(todayTime + 86400000);
        const end = new Date(todayTime + 86400000 * 8);
        return todos
            .filter(t2 => t2.startAt && new Date(t2.startAt) >= start && new Date(t2.startAt) < end)
            .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())
            .slice(0, 6);
    }, [todos, todayTime]);

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
        return anniversaries
            .map(a => {
                let d = new Date(year, a.month - 1, a.day);
                if (d.getTime() < todayTime) d = new Date(year + 1, a.month - 1, a.day);
                return { ...a, dday: Math.round((d.getTime() - todayTime) / 86400000) };
            })
            .sort((a, b) => a.dday - b.dday)
            .slice(0, 3);
    }, [anniversaries, year, todayTime]);

    const dayDeg = React.useCallback(
        (i: number) => -90 + (i / Math.max(1, daysInMonth - 1)) * 180,
        [daysInMonth]
    );

    const handleToggleTodo = (id: string) => toggleTodo(authFetch, id, today.toISOString());

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
        // 하루 종일 일정으로 넣는다. 시간을 물으면 한 줄 추가가 아니게 된다.
        const start = new Date(todayTime);
        const end = new Date(todayTime);
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
            const d = new Date(todayTime);
            d.setDate(d.getDate() - 6 + i);
            return { date: d, done: set.has(localDateKey(d)), isToday: i === 6 };
        });
    };

    const [rayTipX, rayTipY] = polar(R - 1, dayDeg(todayIdx));
    const [crossAX, crossAY] = polar((R - 1) * 0.62, dayDeg(todayIdx) - 3.4);
    const [crossBX, crossBY] = polar((R - 1) * 0.62, dayDeg(todayIdx) + 3.4);

    return (
        <S.PageWrapper>
            <S.Card>
                <S.Main>
                    <S.ArchWrap>
                        <S.Arch viewBox="0 0 240 132" aria-hidden="true">
                            <line className="basel" x1={CX - R - 4} y1={CY} x2={CX + R + 4} y2={CY} />

                            {SPOKES.map(deg => {
                                const [x1, y1] = polar(34, deg);
                                const [x2, y2] = polar(R - 4, deg);
                                return <line key={`s${deg}`} className="spoke" x1={x1} y1={y1} x2={x2} y2={y2} />;
                            })}

                            <path className="base" d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} />
                            <path className="base2" d={`M ${CX - R - 5} ${CY} A ${R + 5} ${R + 5} 0 0 1 ${CX + R + 5} ${CY}`} />

                            {monthLoad.map((v, i) => {
                                const deg = dayDeg(i);
                                const capped = Math.min(v, MAX_LOAD);
                                const [x1, y1] = polar(R - 1, deg);
                                const [x2, y2] = polar(R - 4 - capped * 3.4, deg);
                                return (
                                    <line
                                        key={`t${i}`}
                                        className="tick"
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        strokeOpacity={0.18 + capped * 0.13}
                                    />
                                );
                            })}

                            {monthDays.map((_, i) => {
                                if (i % 5 !== 0) return null;
                                const deg = dayDeg(i);
                                const [x1, y1] = polar(R, deg);
                                const [x2, y2] = polar(R + 3, deg);
                                return <line key={`m${i}`} className="major" x1={x1} y1={y1} x2={x2} y2={y2} />;
                            })}

                            {marks.map(mk => {
                                const deg = dayDeg(mk.day - 1);
                                const [ix, iy] = polar(R + 3, deg);
                                const [ox, oy] = polar(R + 10, deg);
                                return (
                                    <g key={`${mk.kind}${mk.day}`}>
                                        <line className="mkline" x1={ix} y1={iy} x2={ox} y2={oy} />
                                        {mk.kind === "anv" ? (
                                            <path className="mkanv" d={starPath(ox, oy, 3.6)} />
                                        ) : (
                                            <rect className="mkdue" {...diamond(ox, oy, 6)} />
                                        )}
                                    </g>
                                );
                            })}

                            <line className="nray" x1={CX} y1={CY} x2={rayTipX} y2={rayTipY} />
                            <line className="ncross" x1={crossAX} y1={crossAY} x2={crossBX} y2={crossBY} />
                            <rect className="ncap" {...diamond(rayTipX, rayTipY, 7.4)} />
                            <rect className="fin" {...diamond(CX, CY, 7)} />
                        </S.Arch>

                        <S.ArchFoot>
                            <span className="edge">1</span>
                            <span className="center">
                                <i>✦</i>
                                {t.home.monthLabel(month + 1)} · {t.home.monthSummary(monthStats.left, monthStats.done)}
                                <i>✦</i>
                            </span>
                            <span className="edge">{daysInMonth}</span>
                        </S.ArchFoot>
                    </S.ArchWrap>

                    <S.Lists>
                        <S.ListCol>
                            <S.SectionHead>
                                <i className="hd" />
                                {t.home.today}
                                <span className="hr" />
                                <b>{todayTodos.length}</b>
                            </S.SectionHead>
                            <S.QuickForm onSubmit={handleQuickAdd}>
                                <i className="dot" style={quickCategory ? { background: quickCategory.color } : undefined} />
                                <input
                                    value={quick}
                                    onChange={(e) => { setQuick(e.target.value); setQuickError(null); }}
                                    placeholder={t.calendar.addTask}
                                    maxLength={120}
                                    aria-label={t.calendar.addTask}
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
                                {todayTodos.length === 0 ? (
                                    <S.Empty>{t.home.noTodayTodos}</S.Empty>
                                ) : (
                                    todayTodos.map(todo => {
                                        const done = isDoneOn(todo, todayKey);
                                        return (
                                            <S.Row key={todo.id} $done={done} onClick={() => handleToggleTodo(todo.id)}>
                                                <S.Mark $on={done} />
                                                <span className="name">{todo.title}</span>
                                            </S.Row>
                                        );
                                    })
                                )}
                            </S.Scroll>
                        </S.ListCol>

                        <S.ListCol>
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
                                            <S.Row key={todo.id} $done={done} $soft onClick={() => router.push(`/calendar?date=${key}`)}>
                                                <S.Mark $on={done} />
                                                <span className="name">{todo.title}</span>
                                                <em>{t.calendar.days[new Date(todo.startAt!).getDay()]}</em>
                                            </S.Row>
                                        );
                                    })
                                )}
                            </S.Scroll>
                        </S.ListCol>
                    </S.Lists>
                </S.Main>

                <S.Pillar>
                    <S.Crest>✦</S.Crest>

                    <S.PillarHead onClick={() => router.push("/project")}>
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

                    <S.PillarHeadRow className="mt">
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
                                                onClick={() => handleToggleChallenge(c.id, s.date)}
                                            />
                                        ))}
                                    </span>
                                </S.ChallengeRow>
                            );
                        })
                    )}

                    <S.PillarHeadRow className="mt">
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
                </S.Pillar>
            </S.Card>

            <TodoModal
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
        </S.PageWrapper>
    );
}
