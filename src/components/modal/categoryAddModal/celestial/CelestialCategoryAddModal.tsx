"use client";

import * as React from "react";
import { CategoryAddModalProps } from "../CategoryAddModal";
import * as S from "./CelestialCategoryAddModal.styles"; // 스타일은 3번 스텝에서 작성합니다
import { X } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";

export default function CelestialCategoryAddModal({ isOpen, onClose, onAdd }: CategoryAddModalProps) {
    // 폼 상태 관리
    const [name, setName] = React.useState("");
    const [color, setColor] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // 모달이 열릴 때 초기화
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
        <S.Overlay onClick={onClose}>
            <S.Container onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
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
                            <X size={30} />
                        </button>
                    </S.Header>

                    <S.InputRow>
                        <label>색상</label>
                        <div className="color-picker-wrapper">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                            <span className="hex-text">{color.toUpperCase()}</span>
                        </div>
                    </S.InputRow>

                    <S.MemoRow>
                        <label>설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="카테고리에 대한 설명을 적어주세요 (선택)"
                            rows={3}
                        />
                    </S.MemoRow>

                    <S.Footer>
                        {/* 여백을 맞추기 위해 투명한 요소 삽입 (투두 모달의 삭제 버튼 위치) */}
                        <div />
                        <SecondaryButton type="submit" $width="100px" $height="40px" $variant="primary" disabled={isSubmitting}>
                            추가하기
                        </SecondaryButton>
                    </S.Footer>
                </form>
            </S.Container>
        </S.Overlay>
    );
}