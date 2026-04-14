"use client";

import * as React from "react";
import { CategoryAddModalProps } from "../CategoryAddModal";
import * as S from "./CelestialCategoryAddModal.styles";
import { X, Palette, AlignLeft } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";

export default function CelestialCategoryAddModal({ isOpen, onClose, onAdd }: CategoryAddModalProps) {
    const [name, setName] = React.useState("");
    const [color, setColor] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setName("");
            setColor('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
            setDescription("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            alert("카테고리 이름을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdd({ name: trimmedName, color, description: description.trim() });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="400px">
            <S.FormWrapper onSubmit={handleSubmit}>
                <S.Header>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="새 카테고리 이름"
                        required
                        className="title-input"
                        autoFocus
                    />
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={26} />
                    </button>
                </S.Header>

                <S.ScrollBody>
                    <S.FieldRow>
                        <label><Palette size={16} /> 색상</label>
                        <div className="color-picker-wrapper">
                            <span className="hex-text">{color.toUpperCase()}</span>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                    </S.FieldRow>

                    <S.MemoRow>
                        <label><AlignLeft size={16} /> 설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="카테고리에 대한 설명을 적어주세요 (선택)"
                            rows={3}
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    <SecondaryButton type="submit" $width="90px" $height="40px" disabled={isSubmitting}>
                        추가하기
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}