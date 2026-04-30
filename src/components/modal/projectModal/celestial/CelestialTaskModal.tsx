"use client";

import * as React from "react";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { TaskModalProps } from "../TaskModal";
import { UserType, ProjectTaskType } from "@/store/useProjectStore";
import { X, AlignLeft, Calendar, Flag, Users, Link } from 'lucide-react';
import * as S from "./CelestialModal.styles";

export default function CelestialTaskModal({
                                               isOpen, mode, data, tasks, availableAssignees,
                                               onClose, onSave, setData, toggleParticipant
                                           }: TaskModalProps) {
    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="480px">
            <S.FormWrapper onSubmit={onSave}>
                <S.Header>
                    <S.TitleInput
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder={mode === 'add' ? "새로운 할 일" : "할 일 이름"}
                        required
                        autoFocus
                    />
                    <S.CloseButton type="button" onClick={onClose}>
                        <X size={22} />
                    </S.CloseButton>
                </S.Header>

                <S.ScrollBody>
                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> 시작일</S.FieldLabel>
                        <S.FieldInput
                            type="date"
                            value={data.startAt ? data.startAt.split('T')[0] : ''}
                            onChange={e => setData({ ...data, startAt: new Date(e.target.value).toISOString() })}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> 종료일</S.FieldLabel>
                        <S.FieldInput
                            type="date"
                            value={data.endAt ? data.endAt.split('T')[0] : ''}
                            onChange={e => setData({ ...data, endAt: new Date(e.target.value).toISOString() })}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <S.FieldLabel><Flag size={16} /> 중요도</S.FieldLabel>
                        <div style={{ width: '120px' }}>
                            <Dropdown
                                value={data.priority || 'medium'}
                                onChange={(val: string) => setData({ ...data, priority: val })}
                                options={[
                                    { label: '낮음', value: 'low' },
                                    { label: '보통', value: 'medium' },
                                    { label: '높음', value: 'high' }
                                ]}
                            />
                        </div>
                    </S.FieldRow>

                    <S.ParticipantRow>
                        <S.FieldLabel><Users size={16} /> 담당자 할당</S.FieldLabel>
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
                        <S.FieldLabel><Link size={16} /> 선행 조건 (종속성)</S.FieldLabel>
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
                        <S.FieldLabel><AlignLeft size={16} /> 설명</S.FieldLabel>
                        <S.MemoTextArea
                            value={data.description || ''}
                            onChange={e => setData({ ...data, description: e.target.value })}
                            placeholder="할 일에 대한 설명이나 메모를 남겨보세요."
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    <SecondaryButton type="button" onClick={onClose} $width="70px" $height="36px" $variant="default">
                        취소
                    </SecondaryButton>
                    <SecondaryButton type="submit" $width="90px" $height="36px" $variant="primary">
                        저장하기
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}