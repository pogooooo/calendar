"use client";

import * as React from "react";
import styled from "styled-components";
import { Check } from "lucide-react";
import LocaleSelect from "@/components/LocaleSelect";
import * as S from "./CelestialSettings.styles";
import WidgetPreview from "./WidgetPreview";
import type { SettingsThemeProps } from "../SettingsPage";
import { FONT_OPTIONS, ensureFontLoaded } from "@/lib/fonts";

const FontGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 12px;
`;

const FontCard = styled.button<{ $selected: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    text-align: left;
    background: none;
    color: inherit;
    font-family: inherit;
    border: 1px solid ${(props) => props.theme.colors.primary}${(props) => (props.$selected ? "" : "55")};
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 8px ${(props) => props.theme.colors.primary}33;
    }
`;

const FontPreview = styled.div<{ $family: string }>`
    font-family: ${(props) => props.$family};
    font-size: 1.05rem;
    line-height: 1.5;
    color: ${(props) => props.theme.colors.text};
`;

const FontMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const WidgetBoard = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 12px;
`;

const WidgetCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 12px;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    transition: border-color 0.2s ease;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

const CardLabel = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.85rem;
    letter-spacing: 1px;
    color: ${(props) => props.theme.colors.text};
    margin-top: 4px;
`;

const CardDesc = styled.div`
    font-size: 0.72rem;
    line-height: 1.45;
    opacity: 0.55;
    flex: 1;
`;

const CardActions = styled.div`
    display: flex;
    gap: 6px;
    margin-top: 6px;

    & > button {
        flex: 1;
        min-width: 0;
        padding: 5px 0;
        font-size: 0.72rem;
    }
`;

export default function CelestialSettings({
    currentTheme, onThemeChange,
    themes, themeOptions, onThemeOptionChange,
    fontKey, onFontChange,
    navSections, widgetList,
    onWidgetOpen, onWidgetClose,
    autostart, onAutostartToggle,
    user, t,
    newName, onNewNameChange, onNameSave, namePending, nameStatus,
    pwForm, onPwFormChange, onPasswordSave, pwPending, pwStatus,
    deleteConfirm, onDeleteConfirmChange,
    deletePassword, onDeletePasswordChange,
    deleteKeyword, deleteStatus, deletePending,
    showDeleteForm, onShowDeleteForm, onDelete, onDeleteCancel,
}: SettingsThemeProps) {
    const [activeId, setActiveId] = React.useState<string>("sec-theme");

    React.useEffect(() => {
        FONT_OPTIONS.forEach(ensureFontLoaded);
    }, []);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
        );
        navSections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [navSections]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <S.PageWrapper>
            <S.MainContent>
                <S.PageHeader>
                    <span>{t.settings.title}</span>
                    <hr />
                </S.PageHeader>

                <S.Section id="sec-theme">
                    <S.SectionTitle>{t.settings.theme}</S.SectionTitle>
                    <S.ThemeGrid>
                        {themes.map((th) => {
                            const selected = currentTheme === th.id;
                            return (
                                <S.ThemeCard key={th.id} $selected={selected} onClick={() => onThemeChange(th.id)}>
                                    <S.ThemePreview>
                                        <S.PreviewBar $color={th.preview.bar} />
                                        <S.PreviewRow>
                                            <S.PreviewDot $color={th.preview.dot} />
                                            <S.PreviewLines>
                                                <S.PreviewLine $color={th.preview.line1} $w={55} />
                                                <S.PreviewLine $color={th.preview.line2} $w={35} />
                                            </S.PreviewLines>
                                        </S.PreviewRow>
                                        <S.PreviewRow>
                                            <S.PreviewDot $color={th.preview.dot} />
                                            <S.PreviewLines>
                                                <S.PreviewLine $color={th.preview.line1} $w={40} />
                                                <S.PreviewLine $color={th.preview.line2} $w={60} />
                                            </S.PreviewLines>
                                        </S.PreviewRow>
                                    </S.ThemePreview>
                                    <S.ThemeInfo>
                                        <S.ThemeLabelGroup>
                                            <S.ThemeLabel>{th.label}</S.ThemeLabel>
                                            <S.ThemeDesc>{th.description}</S.ThemeDesc>
                                        </S.ThemeLabelGroup>
                                        {selected && <S.CheckMark><Check size={12} strokeWidth={3} /></S.CheckMark>}
                                    </S.ThemeInfo>
                                </S.ThemeCard>
                            );
                        })}
                    </S.ThemeGrid>
                    {(() => {
                        const activeDef = themes.find(th => th.id === currentTheme);
                        if (!activeDef || activeDef.options.length === 0) return null;
                        const currentOption = themeOptions[currentTheme] ?? activeDef.options[0];
                        const optionLabels: Record<string, string> = {
                            light: t.settings.lightMode,
                            dark: t.settings.darkMode,
                        };
                        return (
                            <S.ThemeSubSection>
                                <S.ThemeSubLabel>{t.settings.themeOptions}</S.ThemeSubLabel>
                                <S.ModeButtonGroup>
                                    {activeDef.options.map((opt) => (
                                        <S.ModeButton
                                            key={opt}
                                            $active={currentOption === opt}
                                            onClick={() => onThemeOptionChange(currentTheme, opt)}
                                        >
                                            {optionLabels[opt] ?? opt}
                                        </S.ModeButton>
                                    ))}
                                </S.ModeButtonGroup>
                            </S.ThemeSubSection>
                        );
                    })()}
                </S.Section>

                <S.Section id="sec-font">
                    <S.SectionTitle>{t.settings.font}</S.SectionTitle>
                    <FontGrid>
                        {FONT_OPTIONS.map((f) => {
                            const selected = fontKey === f.key;
                            return (
                                <FontCard
                                    key={f.key}
                                    type="button"
                                    $selected={selected}
                                    onClick={() => onFontChange(f.key)}
                                >
                                    <FontPreview $family={f.family}>
                                        일정과 목표를 하나의 별자리처럼 ✦
                                    </FontPreview>
                                    <FontMeta>
                                        <CardLabel>{f.label}</CardLabel>
                                        {selected && <S.CheckMark><Check size={12} strokeWidth={3} /></S.CheckMark>}
                                    </FontMeta>
                                </FontCard>
                            );
                        })}
                    </FontGrid>
                </S.Section>

                <S.Section id="sec-widgets">
                    <S.SectionTitle>{t.settings.widgets}</S.SectionTitle>
                    <S.SectionBody>
                        <S.WarningText style={{ marginBottom: 16 }}>
                            {t.widget.desc}
                        </S.WarningText>
                        <WidgetBoard>
                            {widgetList.map(({ kind, label, desc }) => (
                                <WidgetCard key={kind}>
                                    <WidgetPreview kind={kind} />
                                    <CardLabel>{label}</CardLabel>
                                    <CardDesc>{desc}</CardDesc>
                                    <CardActions>
                                        <S.FormButton $variant="primary" onClick={() => onWidgetOpen(kind)}>
                                            {t.widget.open}
                                        </S.FormButton>
                                        <S.FormButton $variant="default" onClick={() => onWidgetClose(kind)}>
                                            {t.widget.close}
                                        </S.FormButton>
                                    </CardActions>
                                </WidgetCard>
                            ))}
                        </WidgetBoard>
                    </S.SectionBody>
                </S.Section>

                <S.Section id="sec-system">
                    <S.SectionTitle>{t.settings.system}</S.SectionTitle>
                    <S.SectionBody>
                        <S.InfoRow>
                            <div>
                                <S.InfoValue>{t.system.autostart}</S.InfoValue>
                                <div style={{ fontSize: "0.74rem", opacity: 0.55, marginTop: 2 }}>{t.system.autostartDesc}</div>
                            </div>
                            <S.FormButton
                                $variant={autostart ? "primary" : "default"}
                                onClick={onAutostartToggle}
                            >
                                {autostart ? "ON" : "OFF"}
                            </S.FormButton>
                        </S.InfoRow>
                        <S.InfoRow style={{ marginTop: 16 }}>
                            <div>
                                <S.InfoValue>{t.system.language}</S.InfoValue>
                                <div style={{ fontSize: "0.74rem", opacity: 0.55, marginTop: 2 }}>{t.system.languageDesc}</div>
                            </div>
                            <LocaleSelect />
                        </S.InfoRow>
                    </S.SectionBody>
                </S.Section>

                <S.Section id="sec-account-info">
                    <S.SectionTitle>{t.settings.accountInfo}</S.SectionTitle>
                    <S.SectionBody>
                        <S.InfoRow>
                            <S.InfoLabel>{t.account.email}</S.InfoLabel>
                            <S.InfoValue>{user?.email ?? "—"}</S.InfoValue>
                        </S.InfoRow>
                        <S.InfoRow>
                            <S.InfoLabel>{t.account.name}</S.InfoLabel>
                            <S.InfoValue>{user?.name ?? "—"}</S.InfoValue>
                        </S.InfoRow>
                    </S.SectionBody>
                </S.Section>

                <S.Section id="sec-name">
                    <S.SectionTitle>{t.settings.changeName}</S.SectionTitle>
                    <S.SectionBody>
                        <S.FormRow>
                            <S.FormLabel>{t.account.newName}</S.FormLabel>
                            <S.FormInput
                                value={newName}
                                onChange={(e) => onNewNameChange(e.target.value)}
                                placeholder={t.account.newNamePlaceholder}
                                maxLength={30}
                            />
                        </S.FormRow>
                        <S.ButtonRow>
                            <S.FormButton
                                $variant="primary"
                                onClick={onNameSave}
                                disabled={namePending || !newName.trim() || newName.trim() === user?.name}
                            >
                                {namePending ? t.account.saving : t.account.save}
                            </S.FormButton>
                        </S.ButtonRow>
                        {nameStatus && <S.StatusMessage $type={nameStatus.type}>{nameStatus.msg}</S.StatusMessage>}
                    </S.SectionBody>
                </S.Section>

                <S.Section id="sec-password">
                    <S.SectionTitle>{t.settings.changePassword}</S.SectionTitle>
                    <S.SectionBody>
                        <S.FormRow>
                            <S.FormLabel>{t.account.currentPassword}</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.current}
                                onChange={(e) => onPwFormChange("current", e.target.value)}
                                placeholder={t.account.currentPassword}
                                autoComplete="current-password"
                            />
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormLabel>{t.account.newPassword}</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.next}
                                onChange={(e) => onPwFormChange("next", e.target.value)}
                                placeholder={t.account.newPasswordPlaceholder}
                                autoComplete="new-password"
                            />
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormLabel>{t.account.confirmPassword}</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.confirm}
                                onChange={(e) => onPwFormChange("confirm", e.target.value)}
                                placeholder={t.account.confirmPasswordPlaceholder}
                                autoComplete="new-password"
                            />
                        </S.FormRow>
                        <S.ButtonRow>
                            <S.FormButton
                                $variant="primary"
                                onClick={onPasswordSave}
                                disabled={pwPending || !pwForm.current || !pwForm.next || !pwForm.confirm}
                            >
                                {pwPending ? t.account.changing : t.account.changePassword}
                            </S.FormButton>
                        </S.ButtonRow>
                        {pwStatus && <S.StatusMessage $type={pwStatus.type}>{pwStatus.msg}</S.StatusMessage>}
                    </S.SectionBody>
                </S.Section>

                <S.Section id="sec-delete">
                    <S.SectionTitle>{t.settings.deleteAccount}</S.SectionTitle>
                    <S.SectionBody>
                        {!showDeleteForm ? (
                            <>
                                <S.WarningText>
                                    {t.account.deleteWarning}
                                </S.WarningText>
                                <S.FormButton $variant="danger" onClick={() => onShowDeleteForm(true)}>
                                    {t.account.proceed}
                                </S.FormButton>
                            </>
                        ) : (
                            <>
                                <S.WarningText>
                                    {t.account.deleteInstructions}
                                </S.WarningText>
                                <S.FormRow>
                                    <S.FormLabel>{t.account.passwordConfirm}</S.FormLabel>
                                    <S.FormInput
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => onDeletePasswordChange(e.target.value)}
                                        placeholder={t.account.passwordConfirmPlaceholder}
                                    />
                                </S.FormRow>
                                <S.FormRow>
                                    <S.FormLabel>{t.account.deleteConfirmLabel}</S.FormLabel>
                                    <S.FormInput
                                        value={deleteConfirm}
                                        onChange={(e) => onDeleteConfirmChange(e.target.value)}
                                        placeholder={t.account.deleteConfirmPlaceholder}
                                    />
                                </S.FormRow>
                                <S.ButtonRow>
                                    <S.FormButton $variant="default" onClick={onDeleteCancel}>
                                        {t.account.cancel}
                                    </S.FormButton>
                                    <S.FormButton
                                        $variant="danger"
                                        onClick={onDelete}
                                        disabled={deletePending || deleteConfirm !== deleteKeyword}
                                    >
                                        {deletePending ? t.account.processing : t.account.finalDelete}
                                    </S.FormButton>
                                </S.ButtonRow>
                                {deleteStatus && <S.StatusMessage $type={deleteStatus.type}>{deleteStatus.msg}</S.StatusMessage>}
                            </>
                        )}
                    </S.SectionBody>
                </S.Section>
            </S.MainContent>

            <S.NavPanel>
                <S.NavTitle>{t.settings.onThisPage}</S.NavTitle>
                {navSections.map(({ id, label }) => (
                    <S.NavItem
                        key={id}
                        $active={activeId === id}
                        onClick={() => scrollTo(id)}
                    >
                        {label}
                    </S.NavItem>
                ))}
            </S.NavPanel>
        </S.PageWrapper>
    );
}
