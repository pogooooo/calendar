"use client";

import * as React from "react";
import { Cake, Plus, Trash2 } from "lucide-react";
import useAnniversaryStore, { AnniversaryType } from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";
import Select from "@/components/input/select/Select";
import AnniversaryIcon, { ANNIVERSARY_ICONS } from "@/assets/AnniversaryIcon";
import EmptyArt from "@/components/empty/EmptyArt";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialAnniversary.styles";
import * as MapleS from "./maple/MapleAnniversary.styles";
import * as OceanS from './ocean/OceanAnniversary.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const ROMAN = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];
// 윤년이 아닌 해도 있으므로 2월은 29일까지 허용한다
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const RING_R = 27;
const RING_C = 2 * Math.PI * RING_R;

function nextOccurrence(month: number, day: number) {
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), month - 1, day);
    thisYear.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (thisYear.getTime() >= today.getTime()) return thisYear;
    return new Date(now.getFullYear() + 1, month - 1, day);
}

function ddayDiff(month: number, day: number) {
    const target = nextOccurrence(month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function AnniversaryPage() {
    const S = usePickTheme(STYLES);
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();
    const { anniversaries, fetchAnniversaries, addAnniversary, deleteAnniversary } = useAnniversaryStore();

    const [title, setTitle] = React.useState("");
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [day, setDay] = React.useState(new Date().getDate());
    const [icon, setIcon] = React.useState(ANNIVERSARY_ICONS[0].key);
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        fetchAnniversaries(authFetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || pending) return;
        setPending(true);
        const error = await addAnniversary(authFetch, { title: title.trim(), month, day, icon });
        setPending(false);
        if (error) { await dialog.notify({ title: t.alert.addFailed, message: error }); return; }
        setTitle("");
    };

    const handleDelete = async (a: AnniversaryType) => {
        const ok = await dialog.confirmDanger({
            title: t.anniversaryPage.deleteTitle,
            message: t.anniversaryPage.deleteMessage(a.title),
        });
        if (ok) deleteAnniversary(authFetch, a.id);
    };

    const sorted = [...anniversaries].sort(
        (a, b) => nextOccurrence(a.month, a.day).getTime() - nextOccurrence(b.month, b.day).getTime()
    );

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

            <S.AddForm onSubmit={handleAdd}>
                <S.Corners><i /><i /><i /><i /></S.Corners>
                <S.FormCaption>{t.anniversaryPage.formCaption}</S.FormCaption>
                <S.IconRow>
                    {ANNIVERSARY_ICONS.map(i => (
                        <S.IconChoice
                            key={i.key}
                            type="button"
                            title={t.anniversaryPage.iconLabels[i.key]}
                            $selected={icon === i.key}
                            onClick={() => setIcon(i.key)}
                        >
                            <AnniversaryIcon name={i.key} size={17} />
                        </S.IconChoice>
                    ))}
                </S.IconRow>
                <S.FormRow>
                    <S.TitleInput
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={t.anniversaryPage.namePlaceholder}
                        maxLength={40}
                    />
                    <S.DateField>
                        <Select
                            value={String(month)}
                            onChange={v => {
                                const m = Number(v);
                                setMonth(m);
                                // 2월로 바꿨는데 31일이 선택돼 있으면 존재하지 않는 날짜가 된다
                                if (day > DAYS_IN_MONTH[m - 1]) setDay(DAYS_IN_MONTH[m - 1]);
                            }}
                            options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: t.anniversaryPage.monthOption(i + 1) }))}
                            ariaLabel={t.anniversaryPage.monthAria}
                        />
                    </S.DateField>
                    <S.DateField>
                        <Select
                            value={String(day)}
                            onChange={v => setDay(Number(v))}
                            options={Array.from({ length: DAYS_IN_MONTH[month - 1] }, (_, i) => ({ value: String(i + 1), label: t.anniversaryPage.dayOption(i + 1) }))}
                            ariaLabel={t.anniversaryPage.dayAria}
                        />
                    </S.DateField>
                    <S.AddButton type="submit" disabled={!title.trim() || pending}>
                        <Plus size={14} />
                        {t.anniversaryPage.add}
                    </S.AddButton>
                </S.FormRow>
            </S.AddForm>

            {sorted.length === 0 ? (
                <S.Empty>
                    <EmptyArt kind="anniversaries" />
                    <Cake size={28} strokeWidth={1.2} />
                    <p>{t.anniversaryPage.empty}<br />{t.anniversaryPage.emptyHint}</p>
                </S.Empty>
            ) : (
                <S.CardGrid>
                    {sorted.map((a, idx) => {
                        const diff = ddayDiff(a.month, a.day);
                        const isToday = diff === 0;
                        return (
                            <S.Card key={a.id} $today={isToday}>
                                <S.Corners><i /><i /><i /><i /></S.Corners>
                                <S.CardDelete type="button" onClick={() => handleDelete(a)}>
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
