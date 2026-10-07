"use client";

import { Cake, Trash2 } from "lucide-react";
import { useT } from "@/i18n/useT";
import AnniversaryIcon from "@/assets/AnniversaryIcon";
import EmptyArt from "@/components/empty/EmptyArt";
import type { AnniversaryLayoutProps } from "../AnniversaryLayout.types";

const ROMAN = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];
const RING_R = 27;
const RING_C = 2 * Math.PI * RING_R;

/**
 * Celestial(과 Maple)의 기념일 배치 — 별자리 워터마크 아래 위의 새 기념일 서식, 아래 카드 격자.
 * 예전 기념일 화면의 뼈대를 그대로 옮겼다. 모양은 받은 S(갈래의 *.styles)가 입힌다.
 */
export default function CelestialAnniversaryLayout({ S, items, onDelete, onSubmit, fields }: AnniversaryLayoutProps) {
    const t = useT();

    return (
        <S.Page>
            <S.Zodiac viewBox="0 0 400 400" aria-hidden>
                <circle className="dashed" cx="200" cy="200" r="190" />
                <circle cx="200" cy="200" r="160" />
                {Array.from({ length: 24 }, (_, i) => (
                    <line key={i} x1="200" y1="14" x2="200" y2="26" transform={`rotate(${i * 15} 200 200)`} />
                ))}
            </S.Zodiac>

            <S.PageHeader>
                <i />
                <span>{t.anniversaryPage.title}</span>
                <hr />
            </S.PageHeader>

            <S.AddForm onSubmit={onSubmit}>
                <S.Corners><i /><i /><i /><i /></S.Corners>
                <S.FormCaption>{t.anniversaryPage.formCaption}</S.FormCaption>
                {fields}
            </S.AddForm>

            {items.length === 0 ? (
                <S.Empty>
                    <EmptyArt kind="anniversaries" />
                    <Cake size={28} strokeWidth={1.2} />
                    <p>{t.anniversaryPage.empty}<br />{t.anniversaryPage.emptyHint}</p>
                </S.Empty>
            ) : (
                <S.CardGrid>
                    {items.map(({ anniversary: a, diff, isToday }, idx) => {
                        return (
                            <S.Card key={a.id} $today={isToday} data-fx-anchor={isToday ? "anniversary-today" : undefined}>
                                <S.Corners><i /><i /><i /><i /></S.Corners>
                                <S.CardDelete type="button" onClick={() => onDelete(a)}>
                                    <Trash2 size={13} />
                                </S.CardDelete>
                                <S.CardNumeral>{ROMAN[idx] ?? String(idx + 1)}</S.CardNumeral>
                                <S.CardEmblem $today={isToday}>
                                    <svg viewBox="0 0 64 64">
                                        <rect className="dia" x="21" y="21" width="22" height="22" transform="rotate(45 32 32)" />
                                        <circle className="orbit" cx="32" cy="32" r={RING_R} />
                                        {/* 다가올수록 차오르는 궤도 — 남은 날이 적을수록 호가 길어진다 */}
                                        <circle
                                            className="orbit-fill"
                                            cx="32" cy="32" r={RING_R}
                                            strokeDasharray={RING_C}
                                            strokeDashoffset={RING_C * (diff / 365)}
                                            transform="rotate(-90 32 32)"
                                        />
                                    </svg>
                                    <span className="glyph"><AnniversaryIcon name={a.icon} size={20} /></span>
                                </S.CardEmblem>
                                <S.CardTitle>{a.title}</S.CardTitle>
                                <S.CardDate>{t.anniversaryPage.everyYear(a.month, a.day)}</S.CardDate>
                                <S.CardDday $today={isToday}>
                                    <i />{isToday ? t.anniversaryPage.todayMark : `D-${diff}`}<i />
                                </S.CardDday>
                            </S.Card>
                        );
                    })}
                </S.CardGrid>
            )}
        </S.Page>
    );
}
