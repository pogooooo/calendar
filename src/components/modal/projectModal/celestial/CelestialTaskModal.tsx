"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { TaskModalProps } from "../TaskModal";
import { UserType, ProjectTaskType } from "@/store/useProjectStore";
import { X, AlignLeft, Calendar, Flag, Users, Link } from 'lucide-react';
import * as S from "./CelestialModal.styles";

/** 날짜 입력을 비우면 빈 문자열이 온다. new Date("") 는 RangeError 를 던져 입력이 먹통이 된다. */
const toIsoOrNull = (value: string): string | null => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export default function CelestialTaskModal({
                                               isOpen, mode, data, tasks, availableAssignees,
                                               onClose, onSave, setData, toggleParticipant
                                           }: TaskModalProps) {
    const t = useT();
    const f = t.form;
    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="480px">
            <S.FormWrapper onSubmit={onSave}>
                <S.Header>
                    <S.TitleInput
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder={mode === 'add' ? f.newTaskName : f.taskName}
                        required
                        autoFocus
                    />
                    <S.CloseButton type="button" onClick={onClose}>
                        <X size={22} />
                    </S.CloseButton>
                </S.Header>

                <S.ScrollBody>
                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> {f.startDate}</S.FieldLabel>
                        <S.FieldInput
                            type="date"
                            value={data.startAt ? data.startAt.split('T')[0] : ''}
                            onChange={e => setData({ ...data, startAt: toIsoOrNull(e.target.value) })}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> {f.endDate}</S.FieldLabel>
                        <S.FieldInput
                            type="date"
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
                                    onClick={() => toggleParticipant(user)}
                                >
                                    <S.ParticipantName>{user.name}</S.ParticipantName>
                                </S.ParticipantItem>
                            ))}
                        </S.ParticipantPicker>
                    </S.ParticipantRow>

                    <S.ParticipantRow>
                        <S.FieldLabel><Link size={16} /> {f.blockedBy}</S.FieldLabel>
                        <S.ParticipantPicker>
                            {tasks.filter((t: ProjectTaskType) => t.id !== data.id).map((t: ProjectTaskType) => {
                                const isSelected = data.blockedBy?.some((b: ProjectTaskType) => b.id === t.id) || false;
                                return (
                                    <S.ParticipantItem
                                        key={t.id}
                                        $selected={isSelected}
                                        onClick={() => {
                                            const newBlockedBy = isSelected
                                                ? (data.blockedBy || []).filter((b: ProjectTaskType) => b.id !== t.id)
                                                : [...(data.blockedBy || []), t];
                                            setData({ ...data, blockedBy: newBlockedBy });
                                        }}
                                    >
                                        <S.ParticipantName>{t.title}</S.ParticipantName>
                                    </S.ParticipantItem>
                                );
                            })}
                        </S.ParticipantPicker>
                    </S.ParticipantRow>

                    <S.MemoRow>
                        <S.FieldLabel><AlignLeft size={16} /> {f.description}</S.FieldLabel>
                        <S.MemoTextArea
                            value={data.description || ''}
                            onChange={e => setData({ ...data, description: e.target.value })}
                            placeholder={f.taskDescPlaceholder}
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    <SecondaryButton type="button" onClick={onClose} $width="70px" $height="36px" $variant="default">
                        {f.cancel}
                    </SecondaryButton>
                    <SecondaryButton type="submit" $width="90px" $height="36px" $variant="primary">
                        {f.save}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}