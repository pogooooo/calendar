"use client";

import * as React from "react";
import { ChallengeThemeProps } from "../ChallengeModal";
import * as S from "./CelestialChallengeModal.styles";
import { X, Check, Plus } from "lucide-react";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import CelestialSelect from "@/components/input/select/CelestialSelect";
import { useT } from "@/i18n/useT";

export default function CelestialChallengeModal({
                                                    isOpen, onClose, initialData, categories,
                                                    title, setTitle, description, setDescription,
                                                    interval, setInterval, targetCount, setTargetCount,
                                                    categoryId, setCategoryId, isSubmitting, handleSubmit
                                                }: ChallengeThemeProps) {
    const isEditing = !!initialData;
    const t = useT();

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px">
            <S.ModalHeader>
                {isEditing ? t.challenge.editTitle : t.challenge.createTitle}
            </S.ModalHeader>
            <S.ModalBody>
                <S.FormArea onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t.challenge.category}</label>
                        <CelestialSelect
                            value={categoryId}
                            onChange={setCategoryId}
                            options={categories.map(c => ({ value: c.id, label: c.name, color: c.color }))}
                            placeholder={t.todo.categorySelect}
                            ariaLabel={t.challenge.category}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t.challenge.nameLabel}</label>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                               placeholder={t.challenge.namePlaceholder} required />
                    </div>
                    <div className="form-group">
                        <label>{t.challenge.descLabel}</label>
                        <input value={description} onChange={e => setDescription(e.target.value)}
                               placeholder={t.challenge.descPlaceholder} />
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>{t.challenge.intervalLabel}</label>
                            <input type="number" min="1" inputMode="numeric" value={interval}
                                   onChange={e => setInterval(Number(e.target.value))} required />
                        </div>
                        <div className="form-group">
                            <label>{t.challenge.targetLabel}</label>
                            <input type="number" min="1" inputMode="numeric" value={targetCount}
                                   onChange={e => setTargetCount(e.target.value)}
                                   placeholder={t.challenge.targetPlaceholder} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <SecondaryButton type="button" onClick={onClose} style={{ flex: 1, gap: '6px' }}>
                            <X size={16} /> {t.challenge.cancel}
                        </SecondaryButton>
                        <SecondaryButton type="submit" $variant="primary" disabled={isSubmitting} style={{ flex: 2, gap: '6px' }}>
                            {isEditing ? <Check size={16}/> : <Plus size={16} />}
                            {isEditing ? t.challenge.submitUpdate : t.challenge.submitCreate}
                        </SecondaryButton>
                    </div>
                </S.FormArea>
            </S.ModalBody>
        </CelestialBaseModal>
    );
}
