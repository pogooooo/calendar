"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { ProjectModalProps } from "./ProjectModal";
import { UserType } from "@/store/useProjectStore";
import { CategoryType } from "@/store/useCategoryStore";
import { X, AlignLeft, Folder, Users } from 'lucide-react';
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialModal.styles";
import * as MapleS from "./maple/MapleModal.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

export default function ProjectModalView({
                                                  isOpen, mode, data, categories, modalCategoryParticipants,
                                                  onClose, onSave, setData, toggleParticipant
                                              }: ProjectModalProps) {
    const S = usePickTheme(STYLES);
    const t = useT();
    const f = t.form;
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px">
            <S.FormWrapper onSubmit={onSave}>
                <S.Header>
                    <S.TitleInput
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder={mode === 'add' ? f.newProjectName : f.projectName}
                        required
                        autoFocus
                    />
                    <S.CloseButton type="button" onClick={onClose}>
                        <X size={22} />
                    </S.CloseButton>
                </S.Header>

                <S.ScrollBody>
                    <S.FieldRow style={{ borderBottom: 'none' }}>
                        <S.FieldLabel><Folder size={16} /> {t.challenge.category}</S.FieldLabel>
                        <div style={{ width: '180px' }}>
                            <Dropdown
                                value={data.categoryId || ''}
                                onChange={(val: string) => setData({ ...data, categoryId: val })}
                                placeholder={f.choose}
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
                            <S.FieldLabel><Users size={16} /> {f.participants}</S.FieldLabel>
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
                        <S.FieldLabel><AlignLeft size={16} /> {f.description}</S.FieldLabel>
                        <S.MemoTextArea
                            value={data.description || ''}
                            onChange={e => setData({ ...data, description: e.target.value })}
                            placeholder={f.projectDescPlaceholder}
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
        </BaseModal>
    );
}