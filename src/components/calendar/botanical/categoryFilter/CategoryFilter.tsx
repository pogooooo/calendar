"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useTheme } from "styled-components";
import * as S from "./CategoryFilter.styles";
import { CategoryType } from "@/types/calendar";

interface CategoryFilterProps {
    categories: CategoryType[];
    selectedCategoryIds: string[];
    onToggle: (categoryId: string) => void;
    showProjects?: boolean;
    onToggleProjects?: () => void;
    showChallenges?: boolean;
    onToggleChallenges?: () => void;
}

export default function CategoryFilter({
    categories,
    selectedCategoryIds,
    onToggle,
    showProjects,
    onToggleProjects,
    showChallenges,
    onToggleChallenges
}: CategoryFilterProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const theme = useTheme();

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
                            <div className="popover-content">
                                {onToggleProjects && (
                                    <S.MenuItem onClick={onToggleProjects} $isSelected={!!showProjects}>
                                        <S.CategoryColorDot
                                            $color={theme?.colors.primary || '#C9B59C'}
                                            $isSelected={!!showProjects}
                                        />
                                        프로젝트 할 일
                                    </S.MenuItem>
                                )}

                                {onToggleChallenges && (
                                    <>
                                        <S.MenuItem onClick={onToggleChallenges} $isSelected={!!showChallenges}>
                                            <S.CategoryColorDot
                                                $color={theme.colors.primary}
                                                $isSelected={!!showChallenges}
                                            />
                                            챌린지 스티커
                                        </S.MenuItem>
                                        <S.Divider />
                                    </>
                                )}

                                {categories.map((cat) => {
                                    const isSelected = selectedCategoryIds.includes(cat.id);
                                    return (
                                        <S.MenuItem
                                            key={cat.id}
                                            onClick={() => onToggle(cat.id)}
                                            $isSelected={isSelected}
                                        >
                                            <S.CategoryColorDot $color={cat.color} $isSelected={isSelected} />
                                            {cat.name}
                                        </S.MenuItem>
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
