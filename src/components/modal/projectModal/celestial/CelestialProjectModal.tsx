"use client";

import * as React from "react";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { ProjectModalProps } from "../ProjectModal";
import { UserType } from "@/store/useProjectStore";
import { CategoryType } from "@/store/useCategoryStore";
import { X, AlignLeft, Folder, Users } from 'lucide-react';
import * as S from "./CelestialModal.styles";

export default function CelestialProjectModal({
                                                  isOpen, mode, data, categories, modalCategoryParticipants,
                                                  onClose, onSave, setData, toggleParticipant
                                              }: ProjectModalProps) {
    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px">
            <S.FormWrapper onSubmit={onSave}>
                <S.Header>
                    <S.TitleInput
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder={mode === 'add' ? "새 프로젝트 이름" : "프로젝트 이름"}
                        required
                        autoFocus
                    />
                    <S.CloseButton type="button" onClick={onClose}>
                        <X size={22} />
                    </S.CloseButton>
                </S.Header>

                <S.ScrollBody>
                    <S.FieldRow style={{ borderBottom: 'none' }}>
                        <S.FieldLabel><Folder size={16} /> 카테고리</S.FieldLabel>
                        <div style={{ width: '180px' }}>
                            <Dropdown
                                value={data.categoryId || ''}
                                onChange={(val: string) => setData({ ...data, categoryId: val })}
                                placeholder="선택하세요"
                                options={categories.map((c: CategoryType) => ({
                                    label: c.name,
                                    value: c.id,
                                    color: c.color
                                }))}
                            />
                        </div>
                    </S.FieldRow>

                    {data.categoryId && (
                        <S.ParticipantRow>
                            <S.FieldLabel><Users size={16} /> 프로젝트 참가자</S.FieldLabel>
                            <S.ParticipantPicker>
                                {modalCategoryParticipants.map((user: UserType) => (
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
                    )}

                    <S.MemoRow>
                        <S.FieldLabel><AlignLeft size={16} /> 설명</S.FieldLabel>
                        <S.MemoTextArea
                            value={data.description || ''}
                            onChange={e => setData({ ...data, description: e.target.value })}
                            placeholder="프로젝트에 대한 설명을 남겨보세요."
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