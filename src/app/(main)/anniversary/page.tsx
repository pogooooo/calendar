"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import { Cake, Plus, Trash2 } from "lucide-react";
import useAnniversaryStore, { AnniversaryType } from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import CelestialSelect from "@/components/input/select/CelestialSelect";
import AnniversaryIcon, { ANNIVERSARY_ICONS } from "@/assets/celestial/AnniversaryIcons";

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
    const authFetch = useAuthFetch();
    const dialog = useDialog();
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
        if (error) { await dialog.notify({ title: "추가하지 못했습니다", message: error }); return; }
        setTitle("");
    };

    const handleDelete = async (a: AnniversaryType) => {
        const ok = await dialog.confirmDanger({
            title: "기념일을 삭제할까요",
            message: `'${a.title}' 기록이 사라집니다. 되돌릴 수 없습니다.`,
        });
        if (ok) deleteAnniversary(authFetch, a.id);
    };

    const sorted = [...anniversaries].sort(
        (a, b) => nextOccurrence(a.month, a.day).getTime() - nextOccurrence(b.month, b.day).getTime()
    );

    return (
        <Page>
            <Zodiac viewBox="0 0 400 400" aria-hidden>
                <circle className="dashed" cx="200" cy="200" r="190" />
                <circle cx="200" cy="200" r="160" />
                {Array.from({ length: 24 }, (_, i) => (
                    <line key={i} x1="200" y1="14" x2="200" y2="26" transform={`rotate(${i * 15} 200 200)`} />
                ))}
            </Zodiac>

            <PageHeader>
                <i />
                <span>기념일</span>
                <hr />
            </PageHeader>

            <AddForm onSubmit={handleAdd}>
                <Corners><i /><i /><i /><i /></Corners>
                <FormCaption>새로운 날을 새기다</FormCaption>
                <IconRow>
                    {ANNIVERSARY_ICONS.map(i => (
                        <IconChoice
                            key={i.key}
                            type="button"
                            title={i.label}
                            $selected={icon === i.key}
                            onClick={() => setIcon(i.key)}
                        >
                            <AnniversaryIcon name={i.key} size={17} />
                        </IconChoice>
                    ))}
                </IconRow>
                <FormRow>
                    <TitleInput
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="기념일 이름 (예: 결혼기념일)"
                        maxLength={40}
                    />
                    <DateField>
                        <CelestialSelect
                            value={String(month)}
                            onChange={v => {
                                const m = Number(v);
                                setMonth(m);
                                // 2월로 바꿨는데 31일이 선택돼 있으면 존재하지 않는 날짜가 된다
                                if (day > DAYS_IN_MONTH[m - 1]) setDay(DAYS_IN_MONTH[m - 1]);
                            }}
                            options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}월` }))}
                            ariaLabel="월"
                        />
                    </DateField>
                    <DateField>
                        <CelestialSelect
                            value={String(day)}
                            onChange={v => setDay(Number(v))}
                            options={Array.from({ length: DAYS_IN_MONTH[month - 1] }, (_, i) => ({ value: String(i + 1), label: `${i + 1}일` }))}
                            ariaLabel="일"
                        />
                    </DateField>
                    <AddButton type="submit" disabled={!title.trim() || pending}>
                        <Plus size={14} />
                        추가
                    </AddButton>
                </FormRow>
            </AddForm>

            {sorted.length === 0 ? (
                <Empty>
                    <Cake size={28} strokeWidth={1.2} />
                    <p>등록된 기념일이 없습니다.<br />매년 축하하고 싶은 날을 추가해보세요.</p>
                </Empty>
            ) : (
                <CardGrid>
                    {sorted.map((a, idx) => {
                        const diff = ddayDiff(a.month, a.day);
                        const isToday = diff === 0;
                        return (
                            <Card key={a.id} $today={isToday}>
                                <Corners><i /><i /><i /><i /></Corners>
                                <CardDelete type="button" onClick={() => handleDelete(a)}>
                                    <Trash2 size={13} />
                                </CardDelete>
                                <CardNumeral>{ROMAN[idx] ?? String(idx + 1)}</CardNumeral>
                                <CardEmblem $today={isToday}>
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
                                </CardEmblem>
                                <CardTitle>{a.title}</CardTitle>
                                <CardDate>매년 {a.month}월 {a.day}일</CardDate>
                                <CardDday $today={isToday}>
                                    <i />{isToday ? "오늘 ✦" : `D-${diff}`}<i />
                                </CardDday>
                            </Card>
                        );
                    })}
                </CardGrid>
            )}
        </Page>
    );
}

const todayGlow = keyframes`
    0%, 100% { box-shadow: 0 0 8px 0 currentColor inset, 0 0 10px -4px currentColor; }
    50%      { box-shadow: 0 0 14px 0 currentColor inset, 0 0 18px -4px currentColor; }
`;

const Page = styled.div`
    position: relative;
    max-width: 860px;
    margin: 0 auto;
`;

const Zodiac = styled.svg`
    position: absolute;
    top: -60px;
    right: -80px;
    width: 380px;
    height: 380px;
    color: ${p => p.theme.colors.primary};
    opacity: 0.055;
    pointer-events: none;

    circle, line {
        fill: none;
        stroke: currentColor;
    }

    .dashed { stroke-dasharray: 2 6; }
`;

const PageHeader = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;

    i {
        width: 7px;
        height: 7px;
        border: 1px solid ${p => p.theme.colors.primary};
        transform: rotate(45deg);
        flex-shrink: 0;
    }

    span {
        font-family: ${p => p.theme.fonts.celestial};
        font-size: 1.3rem;
        letter-spacing: 5px;
        white-space: nowrap;
    }

    hr {
        flex: 1;
        border: none;
        height: 1px;
        background: linear-gradient(to right, ${p => p.theme.colors.primary}, transparent);
    }
`;

const Corners = styled.span`
    i {
        position: absolute;
        width: 6px;
        height: 6px;
        border: 1px solid ${p => p.theme.colors.primary}88;
        background: ${p => p.theme.colors.background};
        transform: rotate(45deg);
        pointer-events: none;
    }

    i:nth-child(1) { top: -3.5px; left: -3.5px; }
    i:nth-child(2) { top: -3.5px; right: -3.5px; }
    i:nth-child(3) { bottom: -3.5px; left: -3.5px; }
    i:nth-child(4) { bottom: -3.5px; right: -3.5px; }
`;

const AddForm = styled.form`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 22px 16px 16px;
    margin-bottom: 30px;
    border: 1px solid ${p => p.theme.colors.primary}55;
`;

const FormCaption = styled.span`
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 14px;
    background: ${p => p.theme.colors.background};
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 4px;
    color: ${p => p.theme.colors.primary};
    white-space: nowrap;
`;

const IconRow = styled.div`
    display: flex;
    gap: 6px;
`;

const IconChoice = styled.button<{ $selected: boolean }>`
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    color: ${p => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    border: 1px solid ${p => p.theme.colors.primary}${p => (p.$selected ? "" : "33")};
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;

    ${p => p.$selected && css`
        box-shadow: 0 0 6px ${p.theme.colors.primary}55;
        svg { filter: drop-shadow(0 0 3px ${p.theme.colors.primary}66); }
    `}

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.primary};
    }
`;

const FormRow = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const inputBase = css`
    padding: 9px 12px;
    font-size: 0.85rem;
    font-family: inherit;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}44;
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: ${p => p.theme.colors.primary}; }
`;

const TitleInput = styled.input`
    ${inputBase}
    flex: 1;
    min-width: 180px;
`;

const DateField = styled.div`
    width: 104px;
    flex-shrink: 0;
`;

const AddButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 9px 16px;
    font-size: 0.82rem;
    font-family: inherit;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary};
    cursor: pointer;
    transition: box-shadow 0.2s;

    &:hover:not(:disabled) { box-shadow: 0 0 10px ${p => p.theme.colors.primary}55; }
    &:disabled { opacity: 0.45; cursor: default; }
`;

const Empty = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 56px 0;
    color: ${p => p.theme.colors.textSecondary};

    svg { color: ${p => p.theme.colors.primary}; opacity: 0.7; }

    p {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.7;
        text-align: center;
    }
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
    gap: 18px;
    padding-bottom: 30px;
`;

const Card = styled.div<{ $today: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 22px 12px 18px;
    border: 1px solid ${p => p.theme.colors.primary}${p => (p.$today ? "" : "55")};
    text-align: center;

    &::before {
        content: "";
        position: absolute;
        inset: 5px;
        border: 1px solid ${p => p.theme.colors.primary}22;
        pointer-events: none;
        transition: border-color 0.3s;
    }

    &:hover::before { border-color: ${p => p.theme.colors.primary}66; }

    ${p => p.$today && css`
        color: ${p.theme.colors.primary}44;
        animation: ${todayGlow} 2.6s ease-in-out infinite;
    `}

    &:hover button { opacity: 1; }
`;

const CardDelete = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    color: ${p => p.theme.colors.textSecondary};
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s, color 0.2s;

    &:hover { color: #e05b5b; }
`;

const CardNumeral = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.primary};
    opacity: 0.85;
`;

const CardEmblem = styled.span<{ $today: boolean }>`
    position: relative;
    width: 64px;
    height: 64px;
    margin: 2px 0;

    svg {
        width: 100%;
        height: 100%;

        .dia {
            fill: none;
            stroke: ${p => p.theme.colors.primary}66;
        }

        .orbit {
            fill: none;
            stroke: ${p => p.theme.colors.primary}22;
        }

        .orbit-fill {
            fill: none;
            stroke: ${p => p.theme.colors.primary};
            stroke-width: 1.2;
            stroke-linecap: round;
            transition: stroke-dashoffset 0.6s ease;
        }
    }

    .glyph {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${p => p.theme.colors.primary};

        ${p => p.$today && css`
            svg { filter: drop-shadow(0 0 4px ${p.theme.colors.primary}); }
        `}
    }
`;

const CardTitle = styled.span`
    font-size: 0.88rem;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.text};
    word-break: keep-all;
`;

const CardDate = styled.span`
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    white-space: nowrap;
`;

const CardDday = styled.span<{ $today: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.8rem;
    letter-spacing: 2px;
    white-space: nowrap;
    color: ${p => p.theme.colors.primary};

    i {
        width: 14px;
        height: 1px;
        background: linear-gradient(to right, transparent, ${p => p.theme.colors.primary}88);
    }

    i:last-child {
        background: linear-gradient(to left, transparent, ${p => p.theme.colors.primary}88);
    }
`;
