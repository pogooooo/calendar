"use client";

import * as GemS from "./gem/GemChallengeModal.styles";
import * as React from "react";
import { ChallengeThemeProps } from "./ChallengeModal";
import { X, Check, Plus } from "lucide-react";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import Select from "@/components/input/select/Select";
import { useT } from "@/i18n/useT";
import { TARGET_MAX } from "@/lib/schema";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialChallengeModal.styles";
import * as MapleS from "./maple/MapleChallengeModal.styles";
import * as OceanS from './ocean/OceanChallengeModal.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export default function ChallengeModalView({
                                                    isOpen, onClose, initialData, categories,
                                                    title, setTitle, description, setDescription,
                                                    interval, setInterval, targetCount, setTargetCount,
                                                    categoryId, setCategoryId, isSubmitting, handleSubmit
                                                }: ChallengeThemeProps) {
    const S = usePickTheme(STYLES);
    const isEditing = !!initialData;
    const t = useT();

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px" ariaLabel={isEditing ? t.challenge.editTitle : t.challenge.createTitle}>
            <S.ModalHeader>
                {isEditing ? t.challenge.editTitle : t.challenge.createTitle}
            </S.ModalHeader>
            <S.ModalBody>
                <S.FormArea onSubmit={handleSubmit} aria-busy={isSubmitting}>
                    <div className="form-group">
                        <label>{t.challenge.category}</label>
                        <Select
                            value={categoryId}
                            onChange={setCategoryId}
                            options={categories.map(c => ({ value: c.id, label: c.name, color: c.color }))}
                            placeholder={t.todo.categorySelect}
                            ariaLabel={t.challenge.category}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t.challenge.nameLabel}</label>
                        <input data-autofocus aria-label={t.challenge.nameLabel} value={title} onChange={e => setTitle(e.target.value)}
                               placeholder={t.challenge.namePlaceholder} required />
                    </div>
                    <div className="form-group">
                        <label>{t.challenge.descLabel}</label>
                        <input aria-label={t.challenge.descLabel} value={description} onChange={e => setDescription(e.target.value)}
                               placeholder={t.challenge.descPlaceholder} />
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>{t.challenge.intervalLabel}</label>
                            {/* 비우면 0 이 아니라 빈칸으로 — 예전엔 지우는 순간 "0" 이 박혀 "05" 처럼 쳐졌다 (빈칸은 required 가 막는다) */}
                            <input type="number" min="1" inputMode="numeric" aria-label={t.challenge.intervalLabel} value={interval || ""}
                                   onChange={e => setInterval(Number(e.target.value))} required />
                        </div>
                        <div className="form-group">
                            <label>{t.challenge.targetLabel}</label>
                            <input type="number" min="1" max={TARGET_MAX} inputMode="numeric" aria-label={t.challenge.targetLabel} value={targetCount}
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
        </BaseModal>
    );
}
