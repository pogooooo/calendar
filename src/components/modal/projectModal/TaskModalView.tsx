"use client";

import * as GemS from "./gem/GemModal.styles";
import * as React from "react";
import { useT } from "@/i18n/useT";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { TaskModalProps } from "./TaskModal";
import { UserType, ProjectTaskType } from "@/store/useProjectStore";
import { X, AlignLeft, Calendar, Flag, Users, Link, Clock, CircleDot } from 'lucide-react';
import DateTimePicker from "@/components/input/dateTimePicker/DateTimePicker";
import { toLocalInput as toLocal, fromLocalInput as toIso, todayKey } from "@/lib/localTime";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialModal.styles";
import * as MapleS from "./maple/MapleModal.styles";
import { dependencyIssue } from "@/lib/taskInteractions";
import * as OceanS from './ocean/OceanModal.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

const HOUR = 60 * 60 * 1000;

export default function TaskModalView({
                                               isOpen, mode, data, tasks, availableAssignees,
                                               onClose, onSave, onDelete, setData, toggleParticipant, pending = false, error
                                           }: TaskModalProps) {
    const S = usePickTheme(STYLES);
    const t = useT();
    const f = t.form;
    const [query, setQuery] = React.useState('');
    React.useEffect(() => { setQuery(''); }, [isOpen, data.id]);
    /* ── 날짜 ─────────────────────────────────────────────────────────
       하루 종일이면 그날 0시 ~ 23:59 로, 아니면 고른 시각 그대로 둔다. 예전 할 일은 날짜만 있었으므로
       isAllDay 가 비어 있으면 하루 종일로 본다. */
    const allDay = data.isAllDay ?? true;
    const scheduled = !!(data.startAt || data.endAt);
    const startLocal = toLocal(data.startAt ?? data.endAt);
    const endLocal = toLocal(data.endAt ?? data.startAt);

    const setScheduled = (on: boolean) => {
        if (!on) { setData({ ...data, startAt: null, endAt: null }); return; }
        const key = todayKey();
        setData(allDay
            ? { ...data, startAt: toIso(key, "00:00"), endAt: toIso(key, "23:59") }
            : { ...data, startAt: toIso(`${key}T09:00`), endAt: toIso(`${key}T10:00`) });
    };

    const setAllDay = (on: boolean) => {
        const startKey = startLocal.slice(0, 10);
        const endKey = endLocal.slice(0, 10) || startKey;
        if (!startKey) { setData({ ...data, isAllDay: on }); return; }
        setData(on
            ? { ...data, isAllDay: true, startAt: toIso(startKey, "00:00"), endAt: toIso(endKey, "23:59") }
            // 시각을 고르게 되면 그날 9시부터 한 시간으로 시작한다 (여러 날이면 마지막 날 10시까지)
            : { ...data, isAllDay: false, startAt: toIso(`${startKey}T09:00`), endAt: toIso(`${endKey}T10:00`) });
    };

    const changeStart = (value: string) => {
        if (allDay) {
            const start = toIso(value.slice(0, 10), "00:00");
            const end = data.endAt && start && new Date(data.endAt) < new Date(start) ? toIso(value.slice(0, 10), "23:59") : data.endAt;
            setData({ ...data, startAt: start, endAt: end ?? toIso(value.slice(0, 10), "23:59") });
            return;
        }
        // 시작을 옮기면 끝도 같은 길이만큼 따라간다 (길이를 모르면 한 시간)
        const start = toIso(value);
        const prevStart = data.startAt ? new Date(data.startAt).getTime() : NaN;
        const prevEnd = data.endAt ? new Date(data.endAt).getTime() : NaN;
        const length = prevEnd - prevStart > 0 ? prevEnd - prevStart : HOUR;
        setData({ ...data, startAt: start, endAt: start ? new Date(new Date(start).getTime() + length).toISOString() : data.endAt });
    };

    const changeEnd = (value: string) => {
        setData({ ...data, endAt: allDay ? toIso(value.slice(0, 10), "23:59") : toIso(value) });
    };

    const changeRange = (start: string, end: string) => {
        setData(allDay
            ? { ...data, startAt: toIso(start.slice(0, 10), "00:00"), endAt: toIso(end.slice(0, 10), "23:59") }
            : { ...data, startAt: toIso(start), endAt: toIso(end) });
    };

    const candidates = tasks.filter(task => task.id !== data.id && (task.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) || data.blockedBy?.some(b => b.id === task.id)));
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="480px" ariaLabel={data.title || f.taskName}>
            <S.FormWrapper onSubmit={onSave} aria-busy={pending}>
                <S.Header>
                    <S.TitleInput
                        aria-label={f.taskName}
                        data-autofocus
                        disabled={pending}
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder={mode === 'add' ? f.newTaskName : f.taskName}
                        required
                        autoFocus
                    />
                    <S.CloseButton type="button" onClick={onClose} disabled={pending} aria-label={t.interaction.dismiss}>
                        <X size={22} />
                    </S.CloseButton>
                </S.Header>

                <S.ScrollBody disabled={pending}>
                    <S.FieldRow>
                        <S.FieldLabel><CircleDot size={16} /> {t.project.status}</S.FieldLabel>
                        <div style={{ width: '120px' }}>
                            <Dropdown
                                value={data.status || 'todo'}
                                onChange={(val: string) => setData({ ...data, status: val })}
                                options={[
                                    { label: t.project.colTodo, value: 'todo' },
                                    { label: t.project.colDoing, value: 'in_progress' },
                                    { label: t.project.colDone, value: 'done' },
                                ]}
                            />
                        </div>
                    </S.FieldRow>

                    {/* 날짜 없는 할 일(보드에만 있는 것)도 있다 — 끄면 달력에서 빠진다 */}
                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> {t.project.schedule}</S.FieldLabel>
                        <S.ToggleSwitch>
                            <input type="checkbox" aria-label={t.project.schedule} checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />
                            <span className="slider" />
                        </S.ToggleSwitch>
                    </S.FieldRow>

                    {scheduled && (
                        <>
                            <S.FieldRow>
                                <S.FieldLabel><Clock size={16} /> {t.todo.allDay}</S.FieldLabel>
                                <S.ToggleSwitch>
                                    <input type="checkbox" aria-label={t.todo.allDay} checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                                    <span className="slider" />
                                </S.ToggleSwitch>
                            </S.FieldRow>

                            <S.FieldRow>
                                <S.FieldLabel>{f.startDate}</S.FieldLabel>
                                <S.PickerCell>
                                    <DateTimePicker
                                        mode={allDay ? "date" : "datetime"}
                                        value={allDay ? startLocal.slice(0, 10) : startLocal}
                                        onChange={changeStart}
                                        range={{ start: startLocal, end: endLocal, edge: "start", onRangeChange: changeRange }}
                                    />
                                </S.PickerCell>
                            </S.FieldRow>

                            <S.FieldRow>
                                <S.FieldLabel>{f.endDate}</S.FieldLabel>
                                <S.PickerCell>
                                    <DateTimePicker
                                        mode={allDay ? "date" : "datetime"}
                                        value={allDay ? endLocal.slice(0, 10) : endLocal}
                                        onChange={changeEnd}
                                        range={{ start: startLocal, end: endLocal, edge: "end", onRangeChange: changeRange }}
                                    />
                                </S.PickerCell>
                            </S.FieldRow>
                        </>
                    )}

                    <S.FieldRow>
                        <S.FieldLabel><Flag size={16} /> {f.priority}</S.FieldLabel>
                        <div style={{ width: '120px' }}>
                            <Dropdown
                                value={data.priority || 'medium'}
                                onChange={(val: string) => setData({ ...data, priority: val })}
                                options={[
                                    { label: t.project.priorityLow, value: 'low' },
                                    { label: t.project.priorityMid, value: 'medium' },
                                    { label: t.project.priorityHigh, value: 'high' }
                                ]}
                            />
                        </div>
                    </S.FieldRow>

                    <S.ParticipantRow>
                        <S.FieldLabel><Users size={16} /> {f.assignees}</S.FieldLabel>
                        <S.ParticipantPicker>
                            {availableAssignees.map((user: UserType) => (
                                <S.ParticipantItem
                                    key={user.id}
                                    $selected={data.assignees?.some((a: UserType) => a.id === user.id) || false}
                                    aria-pressed={data.assignees?.some(a => a.id === user.id) || false}
                                    onClick={() => toggleParticipant(user)}
                                >
                                    <S.ParticipantName>{user.name}</S.ParticipantName>
                                </S.ParticipantItem>
                            ))}
                        </S.ParticipantPicker>
                    </S.ParticipantRow>

                    <S.ParticipantRow>
                        <S.FieldLabel><Link size={16} /> {f.blockedBy}</S.FieldLabel>
                        {/* 검색칸의 Enter 는 창 전체를 저장하고 닫지 않는다 — 목록은 치는 대로 걸러진다 */}
                        <S.FieldInput type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.preventDefault(); }} placeholder={t.interaction.searchDependencies} aria-label={t.interaction.searchDependencies} style={{ textAlign: 'left', cursor: 'text' }} />
                        <S.ParticipantPicker>
                            {candidates.length === 0 && <S.ParticipantName>{t.interaction.noMatches}</S.ParticipantName>}
                            {candidates.map((task: ProjectTaskType) => {
                                const isSelected = data.blockedBy?.some((b: ProjectTaskType) => b.id === task.id) || false;
                                const issue = data.id ? dependencyIssue(tasks, task.id, data.id) : null;
                                const disabled = !isSelected && (issue === 'cycle' || issue === 'self');
                                return (
                                    <S.ParticipantItem
                                        key={task.id}
                                        $selected={isSelected}
                                        aria-pressed={isSelected}
                                        disabled={disabled}
                                        title={disabled ? t.interaction.linkInvalid : task.title}
                                        onClick={() => {
                                            const newBlockedBy = isSelected
                                                ? (data.blockedBy || []).filter((b: ProjectTaskType) => b.id !== task.id)
                                                : [...(data.blockedBy || []), task];
                                            setData({ ...data, blockedBy: newBlockedBy });
                                        }}
                                    >
                                        <S.ParticipantName>{task.title}</S.ParticipantName>
                                    </S.ParticipantItem>
                                );
                            })}
                        </S.ParticipantPicker>
                    </S.ParticipantRow>

                    <S.MemoRow>
                        <S.FieldLabel><AlignLeft size={16} /> {f.description}</S.FieldLabel>
                        <S.MemoTextArea
                            aria-label={f.description}
                            value={data.description || ''}
                            onChange={e => setData({ ...data, description: e.target.value })}
                            placeholder={f.taskDescPlaceholder}
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                {error && <S.ErrorMessage role="alert">{error}</S.ErrorMessage>}
                <S.Footer>
                    {mode === 'edit' && onDelete && (
                        <SecondaryButton type="button" onClick={onDelete} disabled={pending} $width="70px" $height="36px" $variant="danger">
                            {t.project.deleteTask}
                        </SecondaryButton>
                    )}
                    <S.FooterSpacer />
                    <SecondaryButton type="button" onClick={onClose} disabled={pending} $width="70px" $height="36px" $variant="default">
                        {f.cancel}
                    </SecondaryButton>
                    <SecondaryButton type="submit" disabled={pending} $width="110px" $height="36px" $variant="primary">
                        {pending ? t.account.saving : f.save}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </BaseModal>
    );
}
