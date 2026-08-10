"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import { Cake, Plus, Trash2 } from "lucide-react";
import useAnniversaryStore, { AnniversaryType } from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import AnniversaryIcon, { ANNIVERSARY_ICONS } from "@/assets/celestial/AnniversaryIcons";

function nextOccurrence(month: number, day: number) {
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), month - 1, day);
    thisYear.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (thisYear.getTime() >= today.getTime()) return thisYear;
    return new Date(now.getFullYear() + 1, month - 1, day);
}

function dday(month: number, day: number) {
    const target = nextOccurrence(month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return "오늘";
    return `D-${diff}`;
}

export default function AnniversaryPage() {
    const authFetch = useAuthFetch();
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
        if (error) { alert(error); return; }
        setTitle("");
    };

    const handleDelete = (a: AnniversaryType) => {
        if (window.confirm(`'${a.title}' 기념일을 삭제할까요?`)) {
            deleteAnniversary(authFetch, a.id);
        }
    };

    const sorted = [...anniversaries].sort(
        (a, b) => nextOccurrence(a.month, a.day).getTime() - nextOccurrence(b.month, b.day).getTime()
    );

    return (
        <Page>
            <PageHeader>
                <span>기념일</span>
                <hr />
            </PageHeader>

            <AddForm onSubmit={handleAdd}>
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
                    <DateSelect value={month} onChange={e => setMonth(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}월</option>
                        ))}
                    </DateSelect>
                    <DateSelect value={day} onChange={e => setDay(Number(e.target.value))}>
                        {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}일</option>
                        ))}
                    </DateSelect>
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
                <List>
                    {sorted.map(a => {
                        const d = dday(a.month, a.day);
                        const isToday = d === "오늘";
                        return (
                            <Row key={a.id} $today={isToday}>
                                <RowIcon><AnniversaryIcon name={a.icon} size={18} /></RowIcon>
                                <RowTitle>{a.title}</RowTitle>
                                <RowDate>매년 {a.month}월 {a.day}일</RowDate>
                                <RowDday $today={isToday}>{isToday ? "오늘! ✦" : d}</RowDday>
                                <RowDelete type="button" onClick={() => handleDelete(a)}>
                                    <Trash2 size={14} />
                                </RowDelete>
                            </Row>
                        );
                    })}
                </List>
            )}
        </Page>
    );
}

const todayGlow = keyframes`
    0%, 100% { text-shadow: 0 0 4px currentColor; }
    50%      { text-shadow: 0 0 10px currentColor; }
`;

const Page = styled.div`
    max-width: 860px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;

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

const AddForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    margin-bottom: 26px;
    border: 1px solid ${p => p.theme.colors.primary}55;
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

const DateSelect = styled.select`
    ${inputBase}
    cursor: pointer;

    option { color: #222; }
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

const List = styled.div`
    display: flex;
    flex-direction: column;
    border-top: 1px solid ${p => p.theme.colors.primary}44;
`;

const Row = styled.div<{ $today: boolean }>`
    display: grid;
    grid-template-columns: 34px 1fr auto auto 30px;
    align-items: center;
    gap: 12px;
    padding: 13px 6px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}33;
    transition: box-shadow 0.2s;

    ${p => p.$today && css`
        box-shadow: inset 0 1px 0 ${p.theme.colors.primary}, inset 0 -1px 0 ${p.theme.colors.primary};
    `}

    &:hover {
        box-shadow: inset 0 -1px 0 ${p => p.theme.colors.primary};
    }
`;

const RowIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.theme.colors.primary};
`;

const RowTitle = styled.span`
    font-size: 0.9rem;
    letter-spacing: 0.5px;
`;

const RowDate = styled.span`
    font-size: 0.76rem;
    color: ${p => p.theme.colors.textSecondary};
    white-space: nowrap;
`;

const RowDday = styled.span<{ $today: boolean }>`
    min-width: 56px;
    text-align: right;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.82rem;
    letter-spacing: 1px;
    white-space: nowrap;
    color: ${p => p.theme.colors.primary};

    ${p => p.$today && css`
        animation: ${todayGlow} 2.4s ease-in-out infinite;
    `}
`;

const RowDelete = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: none;
    border: 1px solid transparent;
    color: ${p => p.theme.colors.textSecondary};
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;

    &:hover {
        color: #e05b5b;
        border-color: #e05b5b66;
    }
`;
