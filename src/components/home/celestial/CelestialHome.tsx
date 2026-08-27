"use client";

import * as React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

import useTodoStore from "@/store/useTodoStore";
import useProjectStore from "@/store/useProjectStore";
import useChallengeStore from "@/store/useChallengeStore";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { celestial_hide_scrollbar } from "@/styles/celestial_theme";
import { useT } from "@/i18n/useT";

const CX = 120;
const CY = 122;
const R = 104;
const MAX_LOAD = 6;

const pad2 = (n: number) => String(n).padStart(2, "0");
const dayKey = (v: string | number | Date) => {
    const d = new Date(v);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

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

export default function CelestialHome() {
    const { todos, toggleTodo } = useTodoStore();
    const { projects, fetchProjects } = useProjectStore();
    const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
    const { anniversaries, fetchAnniversaries } = useAnniversaryStore();
    const authFetch = useAuthFetch();
    const router = useRouter();
    const t = useT();

    React.useEffect(() => {
        fetchProjects(authFetch);
        fetchChallenges(authFetch);
        fetchAnniversaries(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const todayTime = React.useMemo(() => new Date().setHours(0, 0, 0, 0), []);
    const today = React.useMemo(() => new Date(todayTime), [todayTime]);
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIdx = today.getDate() - 1;
    const todayKey = dayKey(today);

    const spansDay = React.useCallback(
        (t2: { startAt?: string | number | Date | null; endAt?: string | number | Date | null }, key: string) => {
            if (!t2.startAt || !t2.endAt) return false;
            return dayKey(t2.startAt) <= key && key <= dayKey(t2.endAt);
        },
        []
    );

    const isDoneOn = React.useCallback(
        (t2: { completions?: { targetDate: string | Date }[] }, key: string) =>
            (t2.completions ?? []).some(c => dayKey(c.targetDate) === key),
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

    const handleToggleTodo = (id: string) => toggleTodo(authFetch, id, todayKey);

    const handleToggleChallenge = (id: string, d: Date) => {
        const safe = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        return toggleChallengeCompletion(authFetch, id, safe.toISOString());
    };

    const streakOf = (completions?: { targetDate: string | Date }[]) => {
        const set = new Set((completions ?? []).map(c => dayKey(c.targetDate)));
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(todayTime);
            d.setDate(d.getDate() - 6 + i);
            return { date: d, done: set.has(dayKey(d)), isToday: i === 6 };
        });
    };

    const [rayTipX, rayTipY] = polar(R - 1, dayDeg(todayIdx));
    const [crossAX, crossAY] = polar((R - 1) * 0.62, dayDeg(todayIdx) - 3.4);
    const [crossBX, crossBY] = polar((R - 1) * 0.62, dayDeg(todayIdx) + 3.4);

    return (
        <PageWrapper>
            <Card>
                <Main>
                    <ArchWrap>
                        <Arch viewBox="0 0 240 132" aria-hidden="true">
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
                        </Arch>

                        <ArchFoot>
                            <span className="edge">1</span>
                            <span className="center">
                                <i>✦</i>
                                {t.home.monthLabel(month + 1)} · {t.home.monthSummary(monthStats.left, monthStats.done)}
                                <i>✦</i>
                            </span>
                            <span className="edge">{daysInMonth}</span>
                        </ArchFoot>
                    </ArchWrap>

                    <Lists>
                        <ListCol>
                            <SectionHead>
                                <i className="hd" />
                                {t.home.today}
                                <span className="hr" />
                                <b>{todayTodos.length}</b>
                            </SectionHead>
                            <Scroll>
                                {todayTodos.length === 0 ? (
                                    <Empty>{t.home.noTodayTodos}</Empty>
                                ) : (
                                    todayTodos.map(todo => {
                                        const done = isDoneOn(todo, todayKey);
                                        return (
                                            <Row key={todo.id} $done={done} onClick={() => handleToggleTodo(todo.id)}>
                                                <Mark $on={done} />
                                                <span className="name">{todo.title}</span>
                                            </Row>
                                        );
                                    })
                                )}
                            </Scroll>
                        </ListCol>

                        <ListCol>
                            <SectionHead>
                                <i className="hd" />
                                {t.home.thisWeek}
                                <span className="hr" />
                                <b>{upcomingTodos.length}</b>
                            </SectionHead>
                            <Scroll>
                                {upcomingTodos.length === 0 ? (
                                    <Empty>{t.home.noUpcoming}</Empty>
                                ) : (
                                    upcomingTodos.map(todo => {
                                        const key = dayKey(todo.startAt!);
                                        const done = isDoneOn(todo, key);
                                        return (
                                            <Row key={todo.id} $done={done} $soft onClick={() => router.push("/calendar")}>
                                                <Mark $on={done} />
                                                <span className="name">{todo.title}</span>
                                                <em>{t.calendar.days[new Date(todo.startAt!).getDay()]}</em>
                                            </Row>
                                        );
                                    })
                                )}
                            </Scroll>
                        </ListCol>
                    </Lists>
                </Main>

                <Pillar>
                    <Crest>✦</Crest>

                    <PillarHead onClick={() => router.push("/project")}>
                        <span className="idx">I</span>
                        {t.home.project}
                        <i className="rule" />
                    </PillarHead>
                    {activeProjects.length === 0 ? (
                        <Empty>{t.home.noProjects}</Empty>
                    ) : (
                        activeProjects.map(p => {
                            const tasks = p.tasks ?? [];
                            const done = tasks.filter(task => task.status === "done").length;
                            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
                            return (
                                <ProjectRow key={p.id}>
                                    <span className="name">{p.title}</span>
                                    <i className="bar">
                                        <b style={{ width: `${pct}%` }} />
                                    </i>
                                    <em>{done}/{tasks.length}</em>
                                </ProjectRow>
                            );
                        })
                    )}

                    <PillarHead className="mt" onClick={() => router.push("/challenge")}>
                        <span className="idx">II</span>
                        {t.home.challenge}
                        <i className="rule" />
                    </PillarHead>
                    {activeChallenges.length === 0 ? (
                        <Empty>{t.home.noChallenges}</Empty>
                    ) : (
                        activeChallenges.map(c => {
                            const slots = streakOf(c.completions);
                            const count = c.completions?.length ?? 0;
                            return (
                                <ChallengeRow key={c.id}>
                                    <span className="name">{c.title}</span>
                                    <em>{count}{c.targetCount ? `/${c.targetCount}` : ""}</em>
                                    <span className="streak">
                                        {slots.map((s, i) => (
                                            <Slot
                                                key={i}
                                                type="button"
                                                $on={s.done}
                                                $today={s.isToday}
                                                onClick={() => handleToggleChallenge(c.id, s.date)}
                                            />
                                        ))}
                                    </span>
                                </ChallengeRow>
                            );
                        })
                    )}

                    <PillarHead className="mt" onClick={() => router.push("/anniversary")}>
                        <span className="idx">III</span>
                        {t.sidebar.anniversary}
                        <i className="rule" />
                    </PillarHead>
                    {upcomingAnniversaries.length === 0 ? (
                        <Empty>{t.home.noAnniversaries}</Empty>
                    ) : (
                        upcomingAnniversaries.map(a => (
                            <AnniversaryRow key={a.id}>
                                <span className="star">✦</span>
                                <span className="name">{a.title}</span>
                                <em>{a.dday === 0 ? "D-DAY" : `D-${a.dday}`}</em>
                            </AnniversaryRow>
                        ))
                    )}
                </Pillar>
            </Card>
        </PageWrapper>
    );
}

const PageWrapper = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
    color: ${p => p.theme.colors.text};
    padding: 12px 0;

    @media (max-width: 768px) {
        height: auto;
        min-height: 100%;
        overflow: visible;
        padding: 0;
    }
`;

const Card = styled.div`
    position: relative;
    width: min(1120px, 100%);
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 236px;
    border: 1px solid ${p => p.theme.colors.primary}75;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        inset: 5px;
        border: 1px solid ${p => p.theme.colors.primary}24;
        pointer-events: none;
        z-index: 5;
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        overflow-y: auto;
        ${celestial_hide_scrollbar}
    }

    @media (max-width: 768px) {
        height: auto;
        overflow: visible;
        border: none;

        &::before { display: none; }
    }
`;

const Main = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding-top: 8px;
`;

const ArchWrap = styled.div`
    flex-shrink: 0;
    padding: 14px 30px 0;

    @media (max-width: 768px) {
        padding: 4px 4px 0;
    }
`;

const Arch = styled.svg`
    display: block;
    width: 100%;
    height: auto;
    max-height: 210px;

    @media (max-width: 768px) {
        max-height: 170px;
    }

    .basel { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.26; stroke-width: 0.7; }
    .spoke { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.09; stroke-width: 0.5; }
    .base { fill: none; stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.3; stroke-width: 0.8; }
    .base2 { fill: none; stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.14; stroke-width: 0.6; }
    .tick { stroke: ${p => p.theme.colors.primary}; stroke-width: 1.2; }
    .major { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.4; stroke-width: 0.7; }
    .mkline { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.36; stroke-width: 0.7; }
    .mkanv { fill: ${p => p.theme.colors.primary}; }
    .mkdue { fill: ${p => p.theme.colors.background}; stroke: ${p => p.theme.colors.primary}; stroke-width: 1; }
    .nray { stroke: ${p => p.theme.colors.primary}; stroke-width: 0.9; }
    .ncross { stroke: ${p => p.theme.colors.primary}; stroke-width: 1.1; }
    .ncap,
    .fin { fill: ${p => p.theme.colors.background}; stroke: ${p => p.theme.colors.primary}; stroke-width: 1.1; }
`;

const ArchFoot = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid ${p => p.theme.colors.primary}42;
    padding-top: 9px;
    margin-top: 6px;

    .edge {
        font-size: 0.58rem;
        letter-spacing: 0.14em;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    .center {
        display: flex;
        align-items: center;
        gap: 11px;
        font-family: ${p => p.theme.fonts.celestial};
        font-size: 0.8rem;
        letter-spacing: 0.16em;
        color: ${p => p.theme.colors.primary};
    }

    .center i {
        font-style: normal;
        font-size: 0.56rem;
    }
`;

const Lists = styled.div`
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 34px;
    padding: 22px 30px 20px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    @media (max-width: 768px) {
        padding: 18px 4px 6px;
    }
`;

const ListCol = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
`;

const SectionHead = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.74rem;
    letter-spacing: 0.2em;
    color: ${p => p.theme.colors.primary};
    margin-bottom: 12px;

    .hd {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme.colors.primary};
    }

    .hr {
        flex: 1;
        height: 1px;
        background: ${p => p.theme.colors.primary}42;
    }

    b {
        font-weight: 500;
        font-size: 0.66rem;
        letter-spacing: 0;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }
`;

const Scroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    ${celestial_hide_scrollbar}

    @media (max-width: 768px) {
        overflow: visible;
        min-height: auto;
    }
`;

const Empty = styled.div`
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    padding: 8px 0;
`;

const Mark = styled.span<{ $on: boolean }>`
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    transform: rotate(45deg);
    border: 1px solid ${p => p.theme.colors.primary}75;
    background: ${p => (p.$on ? p.theme.colors.primary : "transparent")};
    transition: border-color 0.18s, box-shadow 0.18s;
`;

const Row = styled.div<{ $done: boolean; $soft?: boolean }>`
    display: flex;
    align-items: center;
    gap: 11px;
    padding: ${p => (p.$soft ? "6px 0" : "7px 0")};

    @media (max-width: 768px) {
        min-height: 44px;
        gap: 14px;
    }
    font-size: ${p => (p.$soft ? "0.74rem" : "0.78rem")};
    color: ${p => (p.$done || p.$soft ? p.theme.colors.textSecondary : p.theme.colors.text)};
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    cursor: pointer;

    .name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-decoration: ${p => (p.$done ? "line-through" : "none")};
        text-decoration-color: ${p => p.theme.colors.primary}75;
    }

    em {
        margin-left: auto;
        font-style: normal;
        font-size: 0.6rem;
        letter-spacing: 0.12em;
        color: ${p => p.theme.colors.textSecondary};
        flex-shrink: 0;
    }

    &:hover {
        color: ${p => p.theme.colors.primary};
    }

    &:hover ${Mark} {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 5px ${p => p.theme.colors.primary}75;
    }
`;

const Pillar = styled.aside`
    border-left: 1px solid ${p => p.theme.colors.primary}42;
    padding: 16px 22px 18px;
    min-height: 0;
    overflow-y: auto;
    ${celestial_hide_scrollbar}

    @media (max-width: 900px) {
        border-left: 0;
        border-top: 1px solid ${p => p.theme.colors.primary}42;
    }

    @media (max-width: 768px) {
        overflow: visible;
        padding: 16px 4px 8px;
    }
`;

const Crest = styled.div`
    text-align: center;
    color: ${p => p.theme.colors.primary};
    font-size: 0.66rem;
    letter-spacing: 0.4em;
    margin-bottom: 14px;
`;

const PillarHead = styled.button`
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    color: ${p => p.theme.colors.primary};
    margin-bottom: 11px;

    &.mt { margin-top: 22px; }

    .idx {
        font-size: 0.56rem;
        letter-spacing: 0.14em;
        line-height: 1.5;
        padding: 0 4px;
        color: ${p => p.theme.colors.textSecondary};
        border: 1px solid ${p => p.theme.colors.primary}42;
    }

    .rule {
        flex: 1;
        height: 1px;
        background: ${p => p.theme.colors.primary}42;
    }

    &:hover .rule { background: ${p => p.theme.colors.primary}; }
`;

const ProjectRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 9px;
    padding: 7.5px 0;
    font-size: 0.73rem;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;

    .name {
        flex: 1 0 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bar {
        position: relative;
        flex: 1;
        height: 3px;
        background: repeating-linear-gradient(
            to right,
            ${p => p.theme.colors.primary}42 0 1px,
            transparent 1px 5px
        );
    }

    .bar b {
        position: absolute;
        left: 0;
        top: 1px;
        height: 1px;
        background: ${p => p.theme.colors.primary};
    }

    em {
        font-style: normal;
        font-size: 0.62rem;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
    }
`;

const ChallengeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 8px;
    padding: 7.5px 0;
    font-size: 0.73rem;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;

    .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    em {
        font-style: normal;
        font-size: 0.62rem;
        color: ${p => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }

    .streak {
        flex: 1 0 100%;
        display: flex;
        gap: 5px;
    }
`;

const Slot = styled.button<{ $on: boolean; $today: boolean }>`
    width: 7px;
    height: 7px;
    padding: 0;
    transform: rotate(45deg);
    cursor: pointer;
    border: 1px solid ${p => (p.$today ? p.theme.colors.primary : `${p.theme.colors.primary}75`)};
    background: ${p => (p.$on ? p.theme.colors.primary : "transparent")};
    box-shadow: ${p => (p.$today ? `0 0 4px ${p.theme.colors.primary}75` : "none")};
    transition: box-shadow 0.18s;

    &:hover { box-shadow: 0 0 5px ${p => p.theme.colors.primary}; }
`;

const AnniversaryRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    font-size: 0.73rem;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;

    .star {
        width: 9px;
        flex-shrink: 0;
        text-align: center;
        font-size: 0.62rem;
        color: ${p => p.theme.colors.primary};
    }

    .name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    em {
        margin-left: auto;
        font-style: normal;
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        color: ${p => p.theme.colors.primary};
        flex-shrink: 0;
    }
`;
