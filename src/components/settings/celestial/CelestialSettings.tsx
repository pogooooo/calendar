"use client";

import * as React from "react";
import { Check } from "lucide-react";
import * as S from "./CelestialSettings.styles";

export interface SettingsThemeProps {
    currentTheme: string;
    onThemeChange: (themeId: string) => void;
}

const THEMES = [
    {
        id: "celestial",
        label: "Celestial",
        description: "Gold accents, Orbit typeface",
        preview: { bar: "#D4AF37", dot: "#FAE7B5", line1: "#D4AF37", line2: "#FAE7B5" },
    },
    {
        id: "light",
        label: "Light",
        description: "Clean blue, minimal",
        preview: { bar: "#007bff", dot: "#e8f0fe", line1: "#007bff", line2: "#cce0ff" },
    },
];

export default function CelestialSettings({ currentTheme, onThemeChange }: SettingsThemeProps) {
    return (
        <S.PageWrapper>
            <S.PageHeader>
                <span>Settings</span>
                <hr />
            </S.PageHeader>

            <S.Section>
                <S.SectionHeader>Appearance</S.SectionHeader>

                <S.ThemeGrid>
                    {THEMES.map((t) => {
                        const selected = currentTheme === t.id;
                        return (
                            <S.ThemeCard
                                key={t.id}
                                $selected={selected}
                                onClick={() => onThemeChange(t.id)}
                            >
                                <S.ThemePreview>
                                    <S.PreviewBar $color={t.preview.bar} />
                                    <S.PreviewRow>
                                        <S.PreviewDot $color={t.preview.dot} />
                                        <S.PreviewLines>
                                            <S.PreviewLine $color={t.preview.line1} $w={55} />
                                            <S.PreviewLine $color={t.preview.line2} $w={35} />
                                        </S.PreviewLines>
                                    </S.PreviewRow>
                                    <S.PreviewRow>
                                        <S.PreviewDot $color={t.preview.dot} />
                                        <S.PreviewLines>
                                            <S.PreviewLine $color={t.preview.line1} $w={40} />
                                            <S.PreviewLine $color={t.preview.line2} $w={60} />
                                        </S.PreviewLines>
                                    </S.PreviewRow>
                                </S.ThemePreview>

                                <S.ThemeInfo>
                                    <S.ThemeLabelGroup>
                                        <S.ThemeLabel>{t.label}</S.ThemeLabel>
                                        <S.ThemeDesc>{t.description}</S.ThemeDesc>
                                    </S.ThemeLabelGroup>
                                    {selected && (
                                        <S.CheckMark>
                                            <Check size={12} strokeWidth={3} />
                                        </S.CheckMark>
                                    )}
                                </S.ThemeInfo>
                            </S.ThemeCard>
                        );
                    })}
                </S.ThemeGrid>
            </S.Section>
        </S.PageWrapper>
    );
}
