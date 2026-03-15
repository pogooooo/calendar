"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2 } from "lucide-react";
import * as S from "./CategoryFilter.styles";
import { CategoryType } from "@/types/calendar";

interface CategoryFilterProps {
    categories: CategoryType[];
    selectedCategoryIds: string[];
    onToggle: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, selectedCategoryIds, onToggle }: CategoryFilterProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <S.SettingsContainer>
            <S.SetCategoryButton onClick={() => setIsOpen(!isOpen)}>
                <Settings2 strokeWidth={1.5} size={24} />
            </S.SetCategoryButton>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <S.SettingsBackdrop onClick={() => setIsOpen(false)} />

                        <S.SettingsPopover
                            as={motion.div}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                            <div className="popover-header">출력할 카테고리 선택</div>
                            <div className="popover-content">
                                {categories.map((cat) => {
                                    const isSelected = selectedCategoryIds.includes(cat.id);
                                    return (
                                        <div
                                            key={cat.id}
                                            className="menu-item"
                                            onClick={() => onToggle(cat.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                opacity: isSelected ? 1 : 0.4,
                                                textDecoration: isSelected ? 'none' : 'line-through'
                                            }}
                                        >
                                            <div style={{
                                                width: '12px', height: '12px', borderRadius: '50%',
                                                backgroundColor: cat.color, marginRight: '8px'
                                            }} />
                                            {cat.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </S.SettingsPopover>
                    </>
                )}
            </AnimatePresence>
        </S.SettingsContainer>
    );
}