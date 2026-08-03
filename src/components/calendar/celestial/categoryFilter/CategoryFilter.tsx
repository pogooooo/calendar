"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useTheme } from "styled-components";
import * as S from "./CategoryFilter.styles";
import { CategoryType } from "@/types/calendar";
import { useT } from "@/i18n/useT";

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
    const [openUp, setOpenUp] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const t = useT();

    React.useLayoutEffect(() => {
        if (!isOpen || !anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 260 && rect.top > spaceBelow);
    }, [isOpen]);

    const hasExtras = !!onToggleProjects || !!onToggleChallenges;

    return (
        <S.SettingsContainer ref={anchorRef}>
            <S.SetCategoryButton onClick={() => setIsOpen(!isOpen)}>
                <Settings2 strokeWidth={1.5} size={24} />
            </S.SetCategoryButton>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <S.SettingsBackdrop onClick={() => setIsOpen(false)} />

                        <S.SettingsPopover
                            as={motion.div}
                            $openUp={openUp}
                            initial={{ opacity: 0, y: openUp ? 8 : -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: openUp ? 8 : -8 }}
                            transition={{ duration: 0.16, ease: "easeOut" }}
                        >
                            <div className="popover-content">
                                {hasExtras && <S.PopoverLabel>{t.popup.display}</S.PopoverLabel>}

                                {onToggleProjects && (
                                    <S.MenuItem onClick={onToggleProjects} $isSelected={!!showProjects}>
                                        <S.CategoryColorDot
                                            $color={theme?.colors.primary || '#ffffff'}
                                            $isSelected={!!showProjects}
                                        />
                                        <span className="item-name">{t.popup.projectTodos}</span>
                                    </S.MenuItem>
                                )}

                                {onToggleChallenges && (
                                    <S.MenuItem onClick={onToggleChallenges} $isSelected={!!showChallenges}>
                                        <S.CategoryColorDot
                                            $color={theme.colors.primary}
                                            $isSelected={!!showChallenges}
                                        />
                                        <span className="item-name">{t.popup.challenges}</span>
                                    </S.MenuItem>
                                )}

                                {hasExtras && categories.length > 0 && <S.Divider />}

                                {categories.length > 0 && <S.PopoverLabel>{t.popup.category}</S.PopoverLabel>}

                                {categories.map((cat) => {
                                    const isSelected = selectedCategoryIds.includes(cat.id);
                                    return (
                                        <S.MenuItem
                                            key={cat.id}
                                            onClick={() => onToggle(cat.id)}
                                            $isSelected={isSelected}
                                        >
                                            <S.CategoryColorDot $color={cat.color} $isSelected={isSelected} />
                                            <span className="item-name">{cat.name}</span>
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
