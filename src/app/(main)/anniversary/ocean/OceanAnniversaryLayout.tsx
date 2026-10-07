"use client";

import * as React from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useT } from "@/i18n/useT";
import AnniversaryIcon from "@/assets/AnniversaryIcon";
import EmptyArt from "@/components/empty/EmptyArt";
import type { AnniversaryLayoutProps } from "../AnniversaryLayout.types";
import * as O from "./OceanAnniversary.styles";

/* 꼬리표는 장식 글씨라 라틴 이름으로 (홈의 "Today · Wednesday" 와 같은 손) */
const LATIN_LONG = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });
const LATIN_SHORT = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

/** 앞 정거장과 며칠 떨어졌나에 따라 벌어지는 간격 — 가까우면 붙고, 멀면 조금 더 (제곱근이라 몇 달이 나도 지나치지 않게) */
const spacing = (days: number) => 12 + Math.min(56, Math.round(Math.sqrt(Math.max(0, days)) * 3.2));

/**
 * 바다의 기념일 — 가장 가까운 날의 큰 숫자, 그 아래 남은 날들의 물때 줄.
 * 머리줄: 제목·개수 | + 새 기념일 추가 (누르면 바로 아래 유리 서식이 펼쳐지고, Esc·× 로 접힌다).
 * 큰 판: 꼬리표(NEXT · FRI, OCT 17)·아이콘·이름·매년 날짜 | 아주 큰 D 숫자.
 * 물때 줄: 가로 선 위의 정거장 — 날짜 꼬리표, 점, 카드. 날 사이가 멀수록 간격이 조금 벌어진다. 폰은 세로 줄.
 * (Celestial·Maple: 위의 서식 판과 아래 가운데 정렬 카드 격자)
 */
export default function OceanAnniversaryLayout({ items, onDelete, onSubmit, fields }: AnniversaryLayoutProps) {
    const t = useT();
    const tp = t.anniversaryPage;
    const [open, setOpen] = React.useState(false);
    const composerRef = React.useRef<HTMLFormElement>(null);

    /* 서식을 열면 이름 칸에 바로 적게 하고, Esc 로 접는다 (고르개 목록·창이 떠 있으면 그쪽이 먼저) */
    React.useEffect(() => {
        if (!open) return;
        composerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape" || document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
            setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const [first, ...rest] = items;

    /* 물때 줄이 넘치면 마우스 바퀴(세로)로도 옆으로 민다 — 끝에 닿으면 손을 떼고 화면이 굴러가게 둔다.
       폰에서는 줄이 세로로 서서 넘치지 않으니 아무 일도 하지 않는다 */
    const trackRef = React.useRef<HTMLDivElement>(null);
    const hasTide = rest.length > 0;
    React.useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
            const max = el.scrollWidth - el.clientWidth;
            const next = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY));
            if (next === el.scrollLeft) return;
            e.preventDefault();
            el.scrollLeft = next;
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [hasTide]);

    const compose = (
        <O.Compose type="button" $open={open} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <Plus />{t.home.addAnniversary}
        </O.Compose>
    );

    return (
        <O.Frame data-theme-layout="ocean-anniversary">
            <O.Bar>
                <O.Heading>
                    <O.Title>{tp.title}</O.Title>
                    <O.Count>{items.length}</O.Count>
                </O.Heading>
                {items.length > 0 && compose}
            </O.Bar>

            {open && (
                <O.Composer ref={composerRef} onSubmit={onSubmit}>
                    <div className="head">
                        <span className="cap">{tp.formCaption}</span>
                        <O.Close type="button" onClick={() => setOpen(false)} aria-label={t.widget.close} title={t.widget.close}>
                            <X />
                        </O.Close>
                    </div>
                    {fields}
                </O.Composer>
            )}

            {!first ? (
                <O.Nothing>
                    <EmptyArt kind="anniversaries" />
                    <p>{tp.empty}<br />{tp.emptyHint}</p>
                    {!open && compose}
                </O.Nothing>
            ) : (
                <>
                    <O.Hero $today={first.isToday} data-fx-anchor={first.isToday ? "anniversary-today" : undefined}>
                        <div className="lead">
                            <span className="eyebrow" aria-hidden="true">
                                {first.isToday ? "Today" : "Next"} · {LATIN_LONG.format(first.date)}
                            </span>
                            <span className="icon" aria-hidden="true"><AnniversaryIcon name={first.anniversary.icon} size={22} /></span>
                            <h2 className="name">{first.anniversary.title}</h2>
                            <span className="date">{tp.everyYear(first.anniversary.month, first.anniversary.day)}</span>
                        </div>
                        <div className="count">
                            {first.isToday ? (
                                <b>{t.homeWidget.dToday}</b>
                            ) : (
                                <><span className="d">D-</span><b>{first.diff}</b></>
                            )}
                        </div>
                        <O.Delete type="button" onClick={() => onDelete(first.anniversary)} aria-label={t.dialog.delete} title={t.dialog.delete}>
                            <Trash2 />
                        </O.Delete>
                    </O.Hero>

                    {rest.length > 0 && (
                        <O.Tide>
                            <O.TideHead aria-hidden="true">Upcoming<b>{rest.length}</b></O.TideHead>
                            <O.Track ref={trackRef}>
                                <O.Stops>
                                    {rest.map((it, i) => {
                                        const a = it.anniversary;
                                        const before = i === 0 ? 0 : spacing(it.diff - rest[i - 1].diff);
                                        return (
                                            <O.Stop
                                                key={a.id}
                                                $first={i === 0}
                                                style={{ marginLeft: before, animationDelay: `${0.08 + Math.min(i, 10) * 0.04}s` }}
                                            >
                                                <span className="when" aria-hidden="true">{LATIN_SHORT.format(it.date)}</span>
                                                <i className="node" aria-hidden="true" />
                                                <O.StopCard>
                                                    <span className="icon" aria-hidden="true"><AnniversaryIcon name={a.icon} size={18} /></span>
                                                    <span className="text">
                                                        <span className="name">{a.title}</span>
                                                        <span className="date">{tp.everyYear(a.month, a.day)}</span>
                                                    </span>
                                                    <span className="dday">{it.isToday ? tp.todayMark : `D-${it.diff}`}</span>
                                                    <O.Delete type="button" onClick={() => onDelete(a)} aria-label={t.dialog.delete} title={t.dialog.delete}>
                                                        <Trash2 />
                                                    </O.Delete>
                                                </O.StopCard>
                                            </O.Stop>
                                        );
                                    })}
                                </O.Stops>
                            </O.Track>
                        </O.Tide>
                    )}
                </>
            )}
        </O.Frame>
    );
}
