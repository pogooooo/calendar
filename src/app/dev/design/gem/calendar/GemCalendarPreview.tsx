"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GemButton, GemFacet, GemField } from "@/features/gem/GemParts";
import { utcDayKey } from "@/lib/dateKey";
import parts from "@/features/gem/GemParts.module.css";
import styles from "./GemCalendarPreview.module.css";
import { GemCalendarDate, GemMonthStep, GemSettingCorners, GemTodayJump } from "./GemCalendarParts";

const WEEKDAYS = [
    ["일", "SUN"], ["월", "MON"], ["화", "TUE"], ["수", "WED"],
    ["목", "THU"], ["금", "FRI"], ["토", "SAT"],
] as const;
const SAMPLE_TODAY = "2026-11-08";
const INITIAL_DAY = "2026-11-18";
const MONTH_FORMAT = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", timeZone: "UTC" });
const DAY_FORMAT = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long", timeZone: "UTC" });
const FULL_DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long", timeZone: "UTC",
});

const compactDay = (key: string) => key.slice(5).replace("-", ".");

type Event = {
    title: string;
    time?: string;
    state?: "event" | "anniversary" | "done";
};

type Period = {
    title: string;
    start: string;
    end: string;
    tone: "amethyst" | "lilac";
};

const SAMPLE_PERIODS: Period[] = [
    { title: "콘텐츠 리뷰", start: "2026-11-06", end: "2026-11-10", tone: "amethyst" },
    { title: "사용자 테스트", start: "2026-11-16", end: "2026-11-19", tone: "amethyst" },
    { title: "릴리스 점검", start: "2026-11-18", end: "2026-11-21", tone: "lilac" },
    { title: "12월 계획 초안", start: "2026-11-29", end: "2026-12-02", tone: "lilac" },
];

const SAMPLE_EVENTS: Record<string, Event[]> = {
    "2026-11-02": [{ title: "11월 계획", time: "09:00", state: "done" }],
    "2026-11-04": [{ title: "디자인 리뷰", time: "14:00" }],
    "2026-11-06": [{ title: "팀 회의", time: "16:00" }],
    "2026-11-08": [{ title: "다음 주 준비" }],
    "2026-11-10": [{ title: "자료 정리", state: "done" }],
    "2026-11-13": [{ title: "프로젝트 기념일", state: "anniversary" }],
    "2026-11-17": [{ title: "발표 자료 준비", time: "11:00" }],
    "2026-11-18": [
        { title: "디자인 검토", time: "10:00" },
        { title: "다음 분기 일정 정리", time: "13:00" },
        { title: "팀 회의", time: "16:00", state: "done" },
    ],
    "2026-11-20": [{ title: "배포 준비", time: "14:30" }],
    "2026-11-23": [{ title: "피드백 확인" }],
    "2026-11-25": [{ title: "다음 분기 기획", time: "11:30" }],
    "2026-11-27": [{ title: "운영 일정 정리" }],
    "2026-11-30": [{ title: "월간 회고", time: "15:00" }],
};

function periodsOn(key: string) {
    return SAMPLE_PERIODS.filter(period => period.start <= key && key <= period.end);
}

function weekBands(dayKeys: string[]) {
    const first = dayKeys[0];
    const last = dayKeys[dayKeys.length - 1];
    const laneEnds: number[] = [];
    const bands = SAMPLE_PERIODS.filter(period => period.start <= last && first <= period.end)
        .sort((a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end))
        .map(period => {
            const from = period.start < first ? 0 : dayKeys.indexOf(period.start);
            const to = period.end > last ? dayKeys.length - 1 : dayKeys.indexOf(period.end);
            const openLane = laneEnds.findIndex(end => end < from);
            const lane = openLane < 0 ? laneEnds.length : openLane;
            laneEnds[lane] = to;
            return { period, from, to, lane };
        });
    return { bands, laneCount: laneEnds.length };
}

function CalendarSeal() {
    return <svg className={styles.seal} viewBox="0 0 32 34" fill="none" aria-hidden="true">
        <path d="M16 2 27 8l3 9-3 9-11 6-11-6-3-9 3-9 11-6Z" />
        <path d="m16 6 9 5 2 6-2 6-9 5-9-5-2-6 2-6 9-5Z" />
        <path d="m16 7 6 10-6 10-6-10 6-10Zm-9 4 3 6-3 6m18-12-3 6 3 6M5 17h22" />
    </svg>;
}

export default function GemCalendarPreview() {
    const [selected, setSelected] = useState(INITIAL_DAY);
    const [events, setEvents] = useState(SAMPLE_EVENTS);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const selectedDate = new Date(selected);
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cellCount = Math.ceil((firstWeekday + lastDay) / 7) * 7;
    const selectedEvents = events[selected] ?? [];
    const selectedPeriods = periodsOn(selected);
    const selectedCount = selectedEvents.length + selectedPeriods.length;
    const selectedLabel = DAY_FORMAT.format(selectedDate);

    function moveMonth(offset: number) {
        const targetLastDay = new Date(Date.UTC(year, month + offset + 1, 0)).getUTCDate();
        const targetDay = Math.min(selectedDate.getUTCDate(), targetLastDay);
        setSelected(utcDayKey(new Date(Date.UTC(year, month + offset, targetDay))));
    }

    function addSample(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = title.trim();
        if (!name) {
            setError("일정 제목을 입력해 주세요.");
            return;
        }
        setEvents(current => ({ ...current, [selected]: [...(current[selected] ?? []), { title: name }] }));
        setTitle("");
        setError("");
    }

    return <main className={`${parts.scope} ${styles.finish} ${styles.preview}`}>
        <div className={styles.frame}>
            <header className={styles.masthead}>
                <div className={styles.identity}>
                    <span className={styles.wordmark}><CalendarSeal /> CRONOS</span>
                    <span className={styles.edition}>Amethyst &amp; Pearl</span>
                </div>
                <nav className={styles.navLinks} aria-label="미리보기 탐색">
                    <a className={styles.currentLink} href="#preview-calendar" aria-current="page">캘린더</a>
                    <Link className={styles.galleryLink} href="/dev/design/gem">부품 갤러리 <ArrowUpRight size={13} aria-hidden="true" /></Link>
                </nav>
            </header>
            <div className={styles.layout}>
                <section id="preview-calendar" className={styles.calendar} aria-labelledby="preview-month" tabIndex={-1}>
                    <header className={styles.monthHeader}>
                        <GemSettingCorners />
                        <div className={styles.monthTitle}>
                            <span className={styles.kicker}><GemFacet /> 월간 캘린더</span>
                            <h1 id="preview-month" aria-live="polite">{MONTH_FORMAT.format(selectedDate)}</h1>
                        </div>
                        <div className={styles.navigation} role="group" aria-label="달 이동">
                            <GemMonthStep direction="previous" onClick={() => moveMonth(-1)} />
                            <GemTodayJump onClick={() => setSelected(SAMPLE_TODAY)} />
                            <GemMonthStep direction="next" onClick={() => moveMonth(1)} />
                        </div>
                    </header>
                    <div className={styles.monthGrid}>
                        <div className={styles.weekdays}>
                            {WEEKDAYS.map(([day, short], index) => <span className={styles.weekday} key={day}
                                data-weekend={index === 0 || index === 6}>
                                <span>{day}</span><small aria-hidden="true">{short}</small>
                            </span>)}
                        </div>
                        {Array.from({ length: cellCount / 7 }, (_, week) => {
                            const dates = WEEKDAYS.map((_, column) => new Date(Date.UTC(year, month, week * 7 + column + 1 - firstWeekday)));
                            const keys = dates.map(utcDayKey);
                            const { bands, laneCount } = weekBands(keys);
                            return <div className={styles.week} key={keys[0]}
                                style={{ "--range-lanes": laneCount } as CSSProperties}>
                                {dates.map((date, column) => {
                                    const key = keys[column];
                                    const dayEvents = events[key] ?? [];
                                    const dayPeriods = periodsOn(key);
                                    const today = key === SAMPLE_TODAY;
                                    const adjacentMonth = date.getUTCMonth() !== month;
                                    const day = date.getUTCDate();
                                    const showMonthLabel = adjacentMonth && ((week === 0 && column === 0) || day === 1);
                                    const firstEvent = dayEvents[0];
                                    const remainingCount = dayEvents.length - 1;
                                    const count = dayEvents.length + dayPeriods.length;
                                    const dayLaneCount = bands.reduce((depth, { from, to, lane }) =>
                                        from <= column && column <= to ? Math.max(depth, lane + 1) : depth, 0);
                                    const labels = dayPeriods.map(period => period.title);
                                    if (firstEvent) labels.push(firstEvent.title);
                                    const dateLabel = `${FULL_DATE_FORMAT.format(date)}${today ? ", 오늘" : ""}, 일정 ${count}개`;
                                    return <GemCalendarDate key={key} day={day} selected={key === selected}
                                        today={today} muted={adjacentMonth} weekend={column === 0 || column === 6}
                                        monthLabel={showMonthLabel ? `${date.getUTCMonth() + 1}월` : undefined}
                                        style={{ gridColumn: column + 1, "--day-range-lanes": dayLaneCount } as CSSProperties}
                                        aria-label={[dateLabel, ...labels].join(", ")}
                                        onClick={() => setSelected(key)}>
                                        {firstEvent && <span className={styles.eventLine}>
                                            <span className={styles.eventStone} data-state={firstEvent.state ?? "event"}>
                                                <span className={styles.stoneTitle}>{firstEvent.title}</span>
                                            </span>
                                            {(firstEvent.time || remainingCount > 0) && <span className={styles.eventMeta}>
                                                {firstEvent.time && <time dateTime={firstEvent.time}>{firstEvent.time}</time>}
                                                {remainingCount > 0 && <small aria-hidden="true">+{remainingCount}</small>}
                                            </span>}
                                        </span>}
                                    </GemCalendarDate>;
                                })}
                                {bands.map(({ period, from, to, lane }) => <span key={period.title}
                                    className={`${styles.eventStone} ${styles.rangeStone}`} data-period={period.title} data-tone={period.tone}
                                    data-continues-start={period.start !== keys[from]} data-continues-end={period.end !== keys[to]}
                                    data-includes-selection={period.start <= selected && selected <= period.end}
                                    style={{ gridColumn: `${from + 1} / ${to + 2}`, "--range-lane": lane } as CSSProperties} aria-hidden="true">
                                    <span className={styles.stoneTitle}>{period.title}</span>
                                </span>)}
                            </div>;
                        })}
                    </div>
                </section>

                <aside id="preview-day-panel" className={styles.dayPanel} tabIndex={-1} aria-label="선택한 날짜">
                    <header className={styles.dayHeader}>
                        <GemSettingCorners />
                        <div className={styles.dayEyebrow}>
                            <span className={styles.kicker}>선택한 날</span>
                            {selectedCount > 0 && <span className={styles.dayCount}>{selectedCount}개 일정</span>}
                        </div>
                        <h2 id="preview-day" aria-live="polite">{selectedLabel}</h2>
                    </header>
                    <section className={styles.agenda} aria-labelledby="preview-day">
                        <div aria-live="polite">
                            {selectedCount > 0 ? <ul>
                                {selectedPeriods.map(period => <li key={period.title} className={styles.agendaItem} data-state="period">
                                    <span className={`${styles.agendaTime} ${styles.agendaRange}`}>
                                        <span className="sr-only">시작일 </span>
                                        <time dateTime={period.start}>{compactDay(period.start)}</time>
                                        <span className="sr-only">종료일 </span>
                                        <time dateTime={period.end}><span aria-hidden="true">– </span>{compactDay(period.end)}</time>
                                    </span>
                                    <span className={styles.agendaEvent}>
                                        <span className={styles.agendaTitle}>{period.title}</span>
                                    </span>
                                </li>)}
                                {selectedEvents.map((event, index) => <li key={index} className={styles.agendaItem} data-state={event.state ?? "event"}>
                                    <time className={styles.agendaTime} dateTime={event.time ?? selected}>{event.time ?? "종일"}</time>
                                    <span className={styles.agendaEvent}>
                                        <span className={styles.agendaTitle}>{event.title}</span>
                                        {event.state === "done" && <small>완료</small>}
                                        {event.state === "anniversary" && <small>기념일</small>}
                                    </span>
                                </li>)}
                            </ul> : <p className={styles.emptyAgenda}>이 날짜에는 일정이 없습니다.</p>}
                        </div>
                    </section>
                    <form className={styles.editor} onSubmit={addSample}>
                        <h3>빠른 일정 추가</h3>
                        <GemField label="일정 제목" value={title} error={error} maxLength={80}
                            placeholder="예: 다음 회의 준비" onChange={event => {
                                setTitle(event.target.value);
                                setError("");
                            }} />
                        <GemButton type="submit">일정 추가</GemButton>
                    </form>
                </aside>
            </div>
        </div>
    </main>;
}
