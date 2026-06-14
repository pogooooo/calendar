"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import useSettingStore from "@/store/useSettingStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useT } from "@/i18n/useT";
import LocaleSelect from "@/components/LocaleSelect";
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

type WidgetKind = "daily" | "weekly" | "monthly";

async function invokeWidget(action: "open" | "close", kind: WidgetKind) {
    if (typeof window === "undefined") return;
    const isTauri = "__TAURI_INTERNALS__" in window;
    if (isTauri) {
        try {
            const { invoke } = await import("@tauri-apps/api/core");
            await invoke(action === "open" ? "open_widget" : "close_widget", { kind });
        } catch (err) {
            console.error("[Widget] invoke 실패:", err);
        }
    } else {
        if (action === "open") {
            window.open(`/widget/${kind}`, `widget_${kind}`,
                "width=400,height=520,menubar=no,toolbar=no,location=no");
        }
    }
}

async function invokeAutostart(enabled: boolean): Promise<void> {
    if (typeof window === "undefined") return;
    if (!("__TAURI_INTERNALS__" in window)) return;
    try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("set_autostart", { enabled });
    } catch (err) {
        console.error("[Autostart] invoke 실패:", err);
    }
}

export default function CelestialSettings({ currentTheme, onThemeChange }: SettingsThemeProps) {
    const router = useRouter();
    const t = useT();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const logout = useAuthStore((state) => state.logout);
    const authFetch = useAuthFetch();

    const locale = useSettingStore((s) => s.locale);
    const setLocale = useSettingStore((s) => s.setLocale);
    const autostart = useSettingStore((s) => s.autostart);
    const setAutostart = useSettingStore((s) => s.setAutostart);

    const NAV_SECTIONS = React.useMemo(() => [
        { id: "sec-appearance", label: t.settings.appearance },
        { id: "sec-widgets",    label: t.settings.widgets },
        { id: "sec-system",     label: t.settings.system },
        { id: "sec-account-info", label: t.settings.accountInfo },
        { id: "sec-name",       label: t.settings.changeName },
        { id: "sec-password",   label: t.settings.changePassword },
        { id: "sec-delete",     label: t.settings.deleteAccount },
    ], [t]);

    const WIDGET_LIST = React.useMemo(() => [
        { kind: "daily" as WidgetKind,   label: t.widget.daily,   desc: t.widget.dailyDesc },
        { kind: "weekly" as WidgetKind,  label: t.widget.weekly,  desc: t.widget.weeklyDesc },
        { kind: "monthly" as WidgetKind, label: t.widget.monthly, desc: t.widget.monthlyDesc },
    ], [t]);

    const [activeId, setActiveId] = React.useState<string>("sec-appearance");

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
        NAV_SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [NAV_SECTIONS]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleAutostartToggle = async () => {
        const next = !autostart;
        setAutostart(next);
        await invokeAutostart(next);
    };

    const [newName, setNewName] = React.useState(user?.name ?? "");
    const [nameStatus, setNameStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [namePending, setNamePending] = React.useState(false);

    const handleNameSave = async () => {
        if (!newName.trim() || newName.trim() === user?.name) return;
        setNamePending(true); setNameStatus(null);
        try {
            const res = await authFetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setNameStatus({ type: "error", msg: data.message ?? "오류가 발생했습니다." });
            } else {
                setUser({ ...user!, name: data.user.name });
                setNameStatus({ type: "success", msg: "이름이 변경되었습니다." });
            }
        } catch {
            setNameStatus({ type: "error", msg: "서버와 연결할 수 없습니다." });
        } finally {
            setNamePending(false);
        }
    };

    const [pwForm, setPwForm] = React.useState({ current: "", next: "", confirm: "" });
    const [pwStatus, setPwStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [pwPending, setPwPending] = React.useState(false);

    const handlePasswordSave = async () => {
        if (pwForm.next !== pwForm.confirm) { setPwStatus({ type: "error", msg: "새 비밀번호가 일치하지 않습니다." }); return; }
        if (pwForm.next.length < 8)         { setPwStatus({ type: "error", msg: "새 비밀번호는 8자 이상이어야 합니다." }); return; }
        setPwPending(true); setPwStatus(null);
        try {
            const res = await authFetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPwStatus({ type: "error", msg: data.message ?? "오류가 발생했습니다." });
            } else {
                setPwStatus({ type: "success", msg: "비밀번호가 변경되었습니다." });
                setPwForm({ current: "", next: "", confirm: "" });
            }
        } catch {
            setPwStatus({ type: "error", msg: "서버와 연결할 수 없습니다." });
        } finally {
            setPwPending(false);
        }
    };

    const [deleteConfirm, setDeleteConfirm] = React.useState("");
    const [deletePassword, setDeletePassword] = React.useState("");
    const [deleteStatus, setDeleteStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [deletePending, setDeletePending] = React.useState(false);
    const [showDeleteForm, setShowDeleteForm] = React.useState(false);

    const deleteKeyword = locale === 'en' ? 'delete' : '탈퇴';

    const handleDelete = async () => {
        if (deleteConfirm !== deleteKeyword) {
            setDeleteStatus({ type: "error", msg: locale === 'en' ? `Please type "${deleteKeyword}" exactly.` : `"${deleteKeyword}" 를 정확히 입력해주세요.` });
            return;
        }
        setDeletePending(true); setDeleteStatus(null);
        try {
            const res = await authFetch("/api/user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deletePassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setDeleteStatus({ type: "error", msg: data.message ?? "오류가 발생했습니다." });
            } else {
                await logout();
                router.push("/login");
            }
        } catch {
            setDeleteStatus({ type: "error", msg: "서버와 연결할 수 없습니다." });
        } finally {
            setDeletePending(false);
        }
    };

    return (
        <S.PageWrapper>
            <S.MainContent>
                <S.PageHeader>
                    <span>{t.settings.title}</span>
                    <hr />
                </S.PageHeader>

                <S.Section id="sec-appearance">
                    <S.SectionTitle>{t.settings.appearance}</S.SectionTitle>
                    <S.ThemeGrid>
                        {THEMES.map((th) => {
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
                </S.Section>

                <S.Section id="sec-widgets">
                    <S.SectionTitle>{t.settings.widgets}</S.SectionTitle>
                    <S.SectionBody>
                        <S.WarningText style={{ marginBottom: 16 }}>
                            {t.widget.desc}
                        </S.WarningText>
                        {WIDGET_LIST.map(({ kind, label, desc }) => (
                            <S.InfoRow key={kind}>
                                <div>
                                    <S.InfoValue>{label}</S.InfoValue>
                                    <div style={{ fontSize: "0.74rem", opacity: 0.55, marginTop: 2 }}>{desc}</div>
                                </div>
                                <S.ButtonRow style={{ marginTop: 0 }}>
                                    <S.FormButton $variant="primary" onClick={() => invokeWidget("open", kind)}>
                                        {t.widget.open}
                                    </S.FormButton>
                                    <S.FormButton $variant="default" onClick={() => invokeWidget("close", kind)}>
                                        {t.widget.close}
                                    </S.FormButton>
                                </S.ButtonRow>
                            </S.InfoRow>
                        ))}
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
                                onClick={handleAutostartToggle}
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
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t.account.newNamePlaceholder}
                                maxLength={30}
                            />
                        </S.FormRow>
                        <S.ButtonRow>
                            <S.FormButton
                                $variant="primary"
                                onClick={handleNameSave}
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
                                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                                placeholder={t.account.currentPassword}
                                autoComplete="current-password"
                            />
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormLabel>{t.account.newPassword}</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.next}
                                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                                placeholder={t.account.newPasswordPlaceholder}
                                autoComplete="new-password"
                            />
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormLabel>{t.account.confirmPassword}</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.confirm}
                                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                                placeholder={t.account.confirmPasswordPlaceholder}
                                autoComplete="new-password"
                            />
                        </S.FormRow>
                        <S.ButtonRow>
                            <S.FormButton
                                $variant="primary"
                                onClick={handlePasswordSave}
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
                                <S.FormButton $variant="danger" onClick={() => setShowDeleteForm(true)}>
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
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder={t.account.passwordConfirmPlaceholder}
                                    />
                                </S.FormRow>
                                <S.FormRow>
                                    <S.FormLabel>{t.account.deleteConfirmLabel}</S.FormLabel>
                                    <S.FormInput
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                        placeholder={t.account.deleteConfirmPlaceholder}
                                    />
                                </S.FormRow>
                                <S.ButtonRow>
                                    <S.FormButton
                                        $variant="default"
                                        onClick={() => { setShowDeleteForm(false); setDeleteConfirm(""); setDeletePassword(""); setDeleteStatus(null); }}
                                    >
                                        {t.account.cancel}
                                    </S.FormButton>
                                    <S.FormButton
                                        $variant="danger"
                                        onClick={handleDelete}
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
                {NAV_SECTIONS.map(({ id, label }) => (
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
