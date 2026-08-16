"use client";

import * as React from "react";
import { ChallengeThemeProps } from "../ChallengeModal";
import * as S from "./CelestialChallengeModal.styles";
import { X, Check, Plus } from "lucide-react";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import CelestialSelect from "@/components/input/select/CelestialSelect";

export default function CelestialChallengeModal({
                                                    isOpen, onClose, initialData, categories,
                                                    title, setTitle, description, setDescription,
                                                    interval, setInterval, targetCount, setTargetCount,
                                                    categoryId, setCategoryId, isSubmitting, handleSubmit
                                                }: ChallengeThemeProps) {
    const isEditing = !!initialData;

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px">
            <S.ModalHeader>
                {isEditing ? 'Edit Challenge' : 'Create New Challenge'}
            </S.ModalHeader>
            <S.ModalBody>
                <S.FormArea onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Category</label>
                        <CelestialSelect
                            value={categoryId}
                            onChange={setCategoryId}
                            options={categories.map(c => ({ value: c.id, label: c.name, color: c.color }))}
                            placeholder="카테고리를 고르세요"
                            ariaLabel="카테고리"
                        />
                    </div>
                    <div className="form-group">
                        <label>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex) 매일 책 10쪽 읽기" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="목표에 대한 설명" />
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Interval (Days)</label>
                            <input type="number" min="1" value={interval} onChange={e => setInterval(Number(e.target.value))} required />
                        </div>
                        <div className="form-group">
                            <label>Target Count</label>
                            <input type="number" min="1" value={targetCount} onChange={e => setTargetCount(e.target.value)} placeholder="무기한 (비워둠)" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <SecondaryButton type="button" onClick={onClose} style={{ flex: 1, gap: '6px' }}>
                            <X size={16} /> Cancel
                        </SecondaryButton>
                        <SecondaryButton type="submit" $variant="primary" disabled={isSubmitting} style={{ flex: 2, gap: '6px' }}>
                            {isEditing ? <Check size={16}/> : <Plus size={16} />}
                            {isEditing ? 'Update Challenge' : 'Create Challenge'}
                        </SecondaryButton>
                    </div>
                </S.FormArea>
            </S.ModalBody>
        </CelestialBaseModal>
    );
}