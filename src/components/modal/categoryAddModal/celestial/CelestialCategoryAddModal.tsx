"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import { CategoryAddThemeProps } from "../CategoryAddModal";
import * as S from "./CelestialCategoryAddModal.styles";
import { X, Palette, AlignLeft } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";

export default function CelestialCategoryAddModal({
                                                      isOpen, onClose,
                                                      name, setName,
                                                      color, setColor,
                                                      description, setDescription,
                                                      isSubmitting, handleSubmit
                                                  }: CategoryAddThemeProps) {
    const f = useT().form;

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="400px">
            <S.FormWrapper onSubmit={handleSubmit}>
                <S.Header>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={f.newCategoryName}
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
                        <label><Palette size={16} /> {f.color}</label>
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
                        <label><AlignLeft size={16} /> {f.description}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={f.categoryDescPlaceholder}
                            rows={3}
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    <SecondaryButton type="submit" $width="90px" $height="40px" disabled={isSubmitting}>
                        {f.add}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}