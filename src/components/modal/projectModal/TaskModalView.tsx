"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { TaskModalProps } from "./TaskModal";
import { UserType, ProjectTaskType } from "@/store/useProjectStore";
import { X, AlignLeft, Calendar, Flag, Users, Link } from 'lucide-react';
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialModal.styles";
import * as MapleS from "./maple/MapleModal.styles";
import { dependencyIssue } from "@/lib/taskInteractions";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

/** 날짜 입력을 비우면 빈 문자열이 온다. new Date("") 는 RangeError 를 던져 입력이 먹통이 된다. */
const toIsoOrNull = (value: string): string | null => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export default function TaskModalView({
                                               isOpen, mode, data, tasks, availableAssignees,
                                               onClose, onSave, setData, toggleParticipant, pending = false, error
                                           }: TaskModalProps) {
    const S = usePickTheme(STYLES);
    const t = useT();
    const f = t.form;
    const [query, setQuery] = React.useState('');
    React.useEffect(() => { setQuery(''); }, [isOpen, data.id]);
    const candidates = tasks.filter(task => task.id !== data.id && (task.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) || data.blockedBy?.some(b => b.id === task.id)));
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="480px" ariaLabel={data.title || f.taskName}>
            <S.FormWrapper onSubmit={onSave} aria-busy={pending}>
                <S.Header>
                    <S.TitleInput
                        aria-label={f.taskName}
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
                        <S.FieldLabel><Calendar size={16} /> {f.startDate}</S.FieldLabel>
                        <S.FieldInput
                            type="date"
                            aria-label={f.startDate}
                            value={data.startAt ? data.startAt.split('T')[0] : ''}
                            onChange={e => setData({ ...data, startAt: toIsoOrNull(e.target.value) })}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> {f.endDate}</S.FieldLabel>
                        <S.FieldInput
                            type="date"
                            aria-label={f.endDate}
                            value={data.endAt ? data.endAt.split('T')[0] : ''}
                            onChange={e => setData({ ...data, endAt: toIsoOrNull(e.target.value) })}
                        />
                    </S.FieldRow>

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
                        <S.FieldInput type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.interaction.searchDependencies} aria-label={t.interaction.searchDependencies} style={{ textAlign: 'left', cursor: 'text' }} />
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
