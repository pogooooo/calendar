"use client";

import * as React from "react";
import { CalendarClock, CalendarOff, Check, ChevronLeft, ChevronRight, CircleCheck, Pencil, Plus, Trash2, Undo2 } from "lucide-react";

import EmptyArt from "@/components/empty/EmptyArt";
import { useT } from "@/i18n/useT";
import type { ChallengeType } from "@/types";
import type { ChallengeLayoutProps } from "../ChallengeLayout.types";
import { streakOf, weekOf } from "./challengeWeek";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { useListMotion, useSwapMotion } from "@/hooks/useMotion";
import * as O from "./OceanChallenge.styles";

/** 진행 고리 — 가는 홈 위로 청록이 찬다. ratio 가 null 이면(목표 없음) 홈만 */
function Ring({ ratio, size, stroke, children }: { ratio: number | null; size: number; stroke: number; children: React.ReactNode }) {
    const r = (size - stroke) / 2;
    const len = 2 * Math.PI * r;
    return (
        <O.Ring $size={size} aria-hidden="true">
            <svg viewBox={`0 0 ${size} ${size}`}>
                <circle className="track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
                {ratio !== null && ratio > 0 && (
                    <circle
                        className="value"
                        cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
                        strokeDasharray={len}
                        strokeDashoffset={len * (1 - ratio)}
                        style={{ "--len": String(len) } as React.CSSProperties}
                    />
                )}
            </svg>
            <span className="center">{children}</span>
        </O.Ring>
    );
}

/** 지난 이레 — 오늘이 맨 오른쪽 */
function WeekStrip({ challenge, days, todayKey }: { challenge: ChallengeType; days: readonly string[]; todayKey: string }) {
    return (
        <O.Week aria-hidden="true">
            {weekOf(challenge, todayKey).map((d) => (
                <span key={d.key} className={`day ${d.mark}${d.today ? " today" : ""}`}>
                    <b>{days[d.date.getDay()].charAt(0)}</b>
                    <i />
                </span>
            ))}
        </O.Week>
    );
}

/**
 * 바다의 챌린지 — 카드 갤러리. 카드를 고르면 격자 위에 무대가 열리고, 격자는 아래에 그대로 남는다.
 * 갤러리: 머리줄(제목·개수 | 거르개·새 챌린지) 아래 진행 중 / 끝난 챌린지의 유리 카드 격자.
 * 무대: 머리줄이 "‹ 챌린지 / 이름" 과 앞뒤로 넘기기·고치기·지우기로 바뀌고, 그 아래 [자세히 | 스티커 판] 두 판.
 *   ‹ 챌린지 · Esc 로 닫고, ←·→ 로 넘긴다. 무대에 오른 카드는 격자에서 청록 테를 두른다.
 * (Celestial·Maple: 왼쪽 목록 | 오른쪽 스티커 판·자세히, 끄는 손잡이)
 */
export default function OceanChallengeLayout({
    categories, challenges, ongoing, finished,
    selectedChallenge, select, onCreate, onEdit, onDelete,
    today, onToggleToday, filter, board, dialogs,
}: ChallengeLayoutProps) {
    const t = useT();
    const tr = t.challenge;
    const days = t.calendar.days;
    // 오늘은 사용자 시간대의 날 — 자정을 넘기면 이레 줄·연속 칸이 다시 셈된다
    const todayKey = useCurrentDayKey();

    const catOf = (c: ChallengeType) => categories.find((x) => x.id === c.categoryId);
    const cadence = (c: ChallengeType) =>
        `${tr.repeats(c.interval === 1 ? tr.everyday : tr.everyNDays(c.interval))}${c.targetCount != null ? tr.goal(c.targetCount) : ""}`;

    /* 무대에서 앞뒤로 넘기는 차례 — 갤러리에 놓인 순서(진행 중 → 끝남) */
    const order = React.useMemo(() => [...ongoing, ...finished], [ongoing, finished]);
    const selectedId = selectedChallenge?.id ?? null;
    const at = selectedId ? order.findIndex((c) => c.id === selectedId) : -1;
    const step = React.useCallback((d: number) => {
        const next = at >= 0 ? order[at + d] : undefined;
        if (next) select(next.id);
    }, [order, at, select]);

    /* 무대에서 다른 챌린지로 넘기면(‹ ›·←→·격자의 다른 카드) 두 판이 그 차례 쪽에서 들어온다 — 뒤 카드면 오른쪽에서.
       판 하나하나를 움직인다(감싼 상자에 투명도·흐림을 걸면 안의 유리가 뒤를 못 본다).
       자정을 넘겨 이레 줄이 하루 밀리면 줄이 오른쪽에서 한 칸 들어온다. 지운 카드는 제자리에서 흐려지며 빠진다 */
    const galleryRef = React.useRef<HTMLDivElement>(null);
    const stageRef = React.useRef<HTMLDivElement>(null);
    const ongoingRef = React.useRef<HTMLDivElement>(null);
    const finishedRef = React.useRef<HTMLDivElement>(null);
    const orderIds = React.useMemo(() => order.map((c) => c.id), [order]);
    useSwapMotion(selectedId, () => Array.from(stageRef.current?.children ?? []), { order: orderIds });
    useSwapMotion(todayKey, () => Array.from(galleryRef.current?.querySelectorAll(`${O.Week}`) ?? []), { size: "line" });
    useListMotion(ongoingRef, { enter: false, exit: "float" });
    useListMotion(finishedRef, { enter: false, exit: "float" });

    /* 펼치면 무대가 보이도록 맨 위로, 닫으면 방금 보던 카드로 돌아간다 */
    const barRef = React.useRef<HTMLElement>(null);
    const lastId = React.useRef<string | null>(null);
    React.useEffect(() => {
        if (selectedId) {
            lastId.current = selectedId;
            const still = document.documentElement.matches('[data-theme-motion="off"]') || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            barRef.current?.closest("main")?.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
            return;
        }
        if (!lastId.current) return;
        const tile = document.querySelector<HTMLElement>(`[data-challenge-id="${lastId.current}"]`);
        lastId.current = null;
        tile?.scrollIntoView({ block: "nearest" });
        tile?.focus({ preventScroll: true });
    }, [selectedId]);

    /* 무대의 자판 — Esc 돌아가기, ←·→ 넘기기. 글을 적는 중이거나 창이 떠 있으면 손대지 않는다 */
    React.useEffect(() => {
        if (!selectedId) return;
        const onKey = (e: KeyboardEvent) => {
            const el = document.activeElement;
            const typing = el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
            if (typing || e.isComposing || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
            if (e.key === "Escape") select(null);
            else if (e.key === "ArrowLeft") step(-1);
            else if (e.key === "ArrowRight") step(1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selectedId, select, step]);

    const tile = (c: ChallengeType, i: number, done: boolean) => {
        const cat = catOf(c);
        const count = c.completions?.length ?? 0;
        const target = c.targetCount ?? null;
        const ratio = target ? Math.min(1, count / target) : null;
        const reached = target !== null && count >= target;
        const streak = streakOf(c, todayKey);
        const current = c.id === selectedId;
        return (
            <O.Tile
                key={c.id}
                type="button"
                data-challenge-id={c.id}
                aria-current={current || undefined}
                $current={current}
                $muted={done && !reached}
                style={{ animationDelay: `${Math.min(i, 11) * 35}ms` }}
                onClick={() => select(c.id)}
            >
                <span className="head">
                    {cat && <span className="cat"><i style={{ backgroundColor: cat.color }} />{cat.name}</span>}
                    <span className="name">{c.title}</span>
                    <span className="cadence">{cadence(c)}</span>
                    <Ring ratio={ratio} size={44} stroke={3.5}>
                        {target === null ? "∞" : reached ? <Check strokeWidth={2.25} /> : <>{Math.round((ratio ?? 0) * 100)}<small>%</small></>}
                    </Ring>
                </span>
                <WeekStrip challenge={c} days={days} todayKey={todayKey} />
                <span className="foot">
                    <span>{target === null ? tr.indefinite(count) : <><b>{count}</b><em> / {target}</em></>}</span>
                    {streak > 1 && <span className="streak">{tr.streak(streak)}</span>}
                </span>
            </O.Tile>
        );
    };

    /* 머리줄 — 갤러리: 제목·개수 | 거르개·새 챌린지 / 무대: ‹ 챌린지 / 이름 | 앞뒤·고치기·지우기 */
    const bar = (sel: ChallengeType | null) => (
        <O.Bar ref={barRef}>
            {sel ? (
                <>
                    <O.Crumbs>
                        <O.Back type="button" onClick={() => select(null)}>
                            <ChevronLeft />{tr.title}
                        </O.Back>
                        <O.Slash aria-hidden="true">/</O.Slash>
                        <O.Here aria-current="page">{sel.title}</O.Here>
                    </O.Crumbs>
                    <O.Tools>
                        {at >= 0 && order.length > 1 && (
                            <O.Stepper>
                                <O.IconButton type="button" onClick={() => step(-1)} disabled={at <= 0} aria-label={tr.prev} title={tr.prev}>
                                    <ChevronLeft />
                                </O.IconButton>
                                <span className="pos">{at + 1} / {order.length}</span>
                                <O.IconButton type="button" onClick={() => step(1)} disabled={at >= order.length - 1} aria-label={tr.next} title={tr.next}>
                                    <ChevronRight />
                                </O.IconButton>
                            </O.Stepper>
                        )}
                        <O.IconButton type="button" onClick={onEdit} aria-label={tr.edit} title={tr.edit}><Pencil /></O.IconButton>
                        <O.IconButton type="button" $danger onClick={onDelete} aria-label={tr.delete} title={tr.delete}><Trash2 /></O.IconButton>
                    </O.Tools>
                </>
            ) : (
                <>
                    <O.Heading>
                        <O.Title>{tr.title}</O.Title>
                        <O.Count>{challenges.length}</O.Count>
                    </O.Heading>
                    <O.Tools>
                        {filter}
                        <O.NewButton type="button" onClick={onCreate}><Plus />{tr.new}</O.NewButton>
                    </O.Tools>
                </>
            )}
        </O.Bar>
    );

    /* 카드 격자 — 무대가 열려도 아래에 그대로 남아, 다른 챌린지로 한 번에 옮겨 간다 */
    const sections = challenges.length === 0 ? (
        <O.Nothing>
            <EmptyArt kind="challenges" />
            <p>{tr.none}</p>
            <O.NewButton type="button" onClick={onCreate}><Plus />{tr.new}</O.NewButton>
        </O.Nothing>
    ) : (
        <>
            {ongoing.length > 0 && (
                <O.Section>
                    <O.SectionHead>{tr.ongoing}<b>{ongoing.length}</b></O.SectionHead>
                    <O.Grid ref={ongoingRef}>{ongoing.map((c, i) => tile(c, i, false))}</O.Grid>
                </O.Section>
            )}
            {finished.length > 0 && (
                <O.Section>
                    <O.SectionHead>{tr.finished}<b>{finished.length}</b></O.SectionHead>
                    <O.Grid ref={finishedRef}>{finished.map((c, i) => tile(c, ongoing.length + i, true))}</O.Grid>
                </O.Section>
            )}
        </>
    );

    const stage = (sel: ChallengeType) => {
        const cat = catOf(sel);
        const count = sel.completions?.length ?? 0;
        const target = sel.targetCount ?? null;
        const ratio = target ? Math.min(1, count / target) : null;
        const streak = streakOf(sel, todayKey);
        return (
            <O.Stage key={sel.id} ref={stageRef}>
                <O.Brief>
                    {cat && <span className="cat"><i style={{ backgroundColor: cat.color }} />{cat.name}</span>}
                    <h2 className="name">{sel.title}</h2>
                    <p className="desc">{sel.description || tr.noDescription}</p>

                    <O.Meter>
                        <Ring ratio={ratio} size={112} stroke={7}>
                            {target === null ? count : <>{Math.round((ratio ?? 0) * 100)}<small>%</small></>}
                        </Ring>
                        <dl>
                            <div><dt>{tr.currentCount}</dt><dd>{tr.times(count)}</dd></div>
                            {target !== null && <div><dt>{tr.targetCount}</dt><dd>{tr.times(target)}</dd></div>}
                            <div><dt>{tr.interval}</dt><dd>{sel.interval === 1 ? tr.everyday : tr.everyNDays(sel.interval)}</dd></div>
                        </dl>
                    </O.Meter>

                    {today === "mark" || today === "undo" ? (
                        <O.TodayButton type="button" $undo={today === "undo"} onClick={onToggleToday}>
                            {today === "undo" ? <Undo2 /> : <Check />}
                            {today === "undo" ? tr.cancelToday : tr.doneToday}
                        </O.TodayButton>
                    ) : (
                        <O.Status $good={today === "reached"}>
                            {today === "reached" ? <CircleCheck /> : today === "ended" ? <CalendarOff /> : <CalendarClock />}
                            {today === "reached" ? tr.goalReached : today === "ended" ? tr.ended : tr.notTodaySlot}
                        </O.Status>
                    )}
                </O.Brief>

                <O.Board>
                    <header>
                        <h3>{tr.stickerBoard}</h3>
                        <span className="count">{target === null ? count : `${count} / ${target}`}</span>
                    </header>
                    <div className="board">{board}</div>
                    <footer>
                        <span className="label">{t.home.thisWeek}</span>
                        <WeekStrip challenge={sel} days={days} todayKey={todayKey} />
                        {streak > 1 && <span className="streak">{tr.streak(streak)}</span>}
                    </footer>
                </O.Board>
            </O.Stage>
        );
    };

    /* 자리는 늘 같다(머리줄 · 무대 · 격자 · 창) — 무대를 열고 닫아도 격자는 다시 그려지지 않는다 */
    return (
        <O.Gallery data-theme-layout="ocean-challenge" ref={galleryRef}>
            {bar(selectedChallenge)}
            {selectedChallenge ? stage(selectedChallenge) : null}
            {sections}
            {dialogs}
        </O.Gallery>
    );
}
