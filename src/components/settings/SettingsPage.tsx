"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "styled-components";
import useAuthStore from "@/store/useAuthStore";
import useSettingStore from "@/store/useSettingStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { mirrorWidgetStateToFile } from "@/lib/widgetStateFile";
import { useT } from "@/i18n/useT";
import CelestialSettings from "./celestial/CelestialSettings";
import type { Translations } from "@/i18n/types";

export type ThemeDef = {
    id: string;
    label: string;
    description: string;
    preview: { bar: string; dot: string; line1: string; line2: string };
    options: readonly string[];
};

export interface SettingsThemeProps {
    currentTheme: string;
    onThemeChange: (themeId: string) => void;
    themes: ThemeDef[];
    themeOptions: Record<string, string>;
    onThemeOptionChange: (themeId: string, opt: string) => void;
    fontKey: string;
    onFontChange: (fontKey: string) => void;
    fontSizeKey: string;
    onFontSizeChange: (key: string) => void;
    fontWeightKey: string;
    onFontWeightChange: (key: string) => void;
    navSections: { id: string; label: string }[];
    widgetList: { kind: string; label: string; desc: string }[];
    onWidgetOpen: (kind: string) => void;
    onWidgetClose: (kind: string) => void;
    autostart: boolean;
    onAutostartToggle: () => void;
    user: { email?: string | null; name?: string | null } | null;
    t: Translations;
    newName: string;
    onNewNameChange: (name: string) => void;
    onNameSave: () => void;
    namePending: boolean;
    nameStatus: { type: "success" | "error"; msg: string } | null;
    pwForm: { current: string; next: string; confirm: string };
    onPwFormChange: (field: "current" | "next" | "confirm", value: string) => void;
    onPasswordSave: () => void;
    pwPending: boolean;
    pwStatus: { type: "success" | "error"; msg: string } | null;
    deleteConfirm: string;
    onDeleteConfirmChange: (val: string) => void;
    deletePassword: string;
    onDeletePasswordChange: (val: string) => void;
    deleteKeyword: string;
    deleteStatus: { type: "success" | "error"; msg: string } | null;
    deletePending: boolean;
    showDeleteForm: boolean;
    onShowDeleteForm: (show: boolean) => void;
    onDelete: () => void;
    onDeleteCancel: () => void;
}

const THEMES: ThemeDef[] = [
    {
        id: "celestial",
        label: "Celestial",
        description: "Gold accents, Orbit typeface",
        preview: { bar: "#D4AF37", dot: "#FAE7B5", line1: "#D4AF37", line2: "#FAE7B5" },
        options: ["light", "dark"] as const,
    },
];

import type { WidgetKind } from "@/store/useWidgetStore";

async function invokeWidget(action: "open" | "close", kind: WidgetKind) {
    if (typeof window === "undefined") return;
    const isTauri = "__TAURI_INTERNALS__" in window;
    if (isTauri) {
        try {
            // 여기서 플래그를 갱신하지 않으면 설정에서 끈 위젯이 다음 부팅에 되살아난다
            try { localStorage.setItem(`cronos-widget-open:${kind}`, action === "open" ? "1" : "0"); } catch {}
            await mirrorWidgetStateToFile();

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

export default function SettingsPage() {
    const theme = useTheme();
    const themeName = theme?.name || "celestial";
    const router = useRouter();
    const t = useT();
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const logout = useAuthStore((s) => s.logout);
    const authFetch = useAuthFetch();

    const { theme: currentTheme, updateTheme } = useSettingStore();
    const themeOptions = useSettingStore((s) => s.themeOptions);
    const setThemeOption = useSettingStore((s) => s.setThemeOption);
    const locale = useSettingStore((s) => s.locale);
    const autostart = useSettingStore((s) => s.autostart);
    const setAutostart = useSettingStore((s) => s.setAutostart);
    const fontKey = useSettingStore((s) => s.font);
    const setFont = useSettingStore((s) => s.setFont);
    const fontSizeKey = useSettingStore((s) => s.fontSize);
    const setFontSize = useSettingStore((s) => s.setFontSize);
    const fontWeightKey = useSettingStore((s) => s.fontWeight);
    const setFontWeight = useSettingStore((s) => s.setFontWeight);

    const NAV_SECTIONS = React.useMemo(() => [
        { id: "sec-theme",        label: t.settings.theme },
        { id: "sec-font",         label: t.settings.font },
        { id: "sec-widgets",      label: t.settings.widgets },
        { id: "sec-system",       label: t.settings.system },
        { id: "sec-account-info", label: t.settings.accountInfo },
        { id: "sec-name",         label: t.settings.changeName },
        { id: "sec-password",     label: t.settings.changePassword },
        { id: "sec-delete",       label: t.settings.deleteAccount },
    ], [t]);

    const WIDGET_LIST = React.useMemo(() => [
        { kind: "today",       label: t.widget.todayW,       desc: t.widget.todayWDesc,       group: t.widget.groupTodo },
        { kind: "quicktask",   label: t.widget.quicktaskW,   desc: t.widget.quicktaskWDesc,   group: t.widget.groupTodo },
        { kind: "due",         label: t.widget.dueW,         desc: t.widget.dueWDesc,         group: t.widget.groupTodo },
        { kind: "nownext",     label: t.widget.nowNextW,     desc: t.widget.nowNextWDesc,     group: t.widget.groupCalendar },
        { kind: "weekly",      label: t.widget.weekly,       desc: t.widget.weeklyDesc,       group: t.widget.groupCalendar },
        { kind: "monthly",     label: t.widget.monthly,      desc: t.widget.monthlyDesc,      group: t.widget.groupCalendar },
        { kind: "anniversary", label: t.widget.anniversaryW, desc: t.widget.anniversaryWDesc, group: t.widget.groupCalendar },
        { kind: "projects",    label: t.widget.projectsW,    desc: t.widget.projectsWDesc,    group: t.widget.groupRecord },
        { kind: "challenge",   label: t.widget.challengeW,   desc: t.widget.challengeWDesc,   group: t.widget.groupRecord },
        { kind: "stats",       label: t.widget.statsW,       desc: t.widget.statsWDesc,       group: t.widget.groupRecord },
        { kind: "memo",        label: t.widget.memoW,        desc: t.widget.memoWDesc,        group: t.widget.groupRecord },
    ], [t]);

    const handleThemeChange = (themeId: string) => updateTheme(authFetch, themeId);
    const handleThemeOptionChange = (themeId: string, opt: string) => setThemeOption(themeId, opt);
    const handleWidgetOpen = (kind: string) => invokeWidget("open", kind as WidgetKind);
    const handleWidgetClose = (kind: string) => invokeWidget("close", kind as WidgetKind);

    // 스위치가 OS 의 실제 등록 상태와 어긋나 있으면 실제 쪽에 맞춘다
    React.useEffect(() => {
        if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) return;
        (async () => {
            try {
                const { invoke } = await import("@tauri-apps/api/core");
                const actual = await invoke<boolean>("get_autostart");
                if (actual !== useSettingStore.getState().autostart) setAutostart(actual);
            } catch {}
        })();
    }, [setAutostart]);

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

    const handlePwFormChange = (field: "current" | "next" | "confirm", value: string) => {
        setPwForm((p) => ({ ...p, [field]: value }));
    };

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

    const deleteKeyword = locale === "en" ? "delete" : "탈퇴";

    const handleDelete = async () => {
        if (deleteConfirm !== deleteKeyword) {
            setDeleteStatus({ type: "error", msg: locale === "en" ? `Please type "${deleteKeyword}" exactly.` : `"${deleteKeyword}" 를 정확히 입력해주세요.` });
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

    const handleDeleteCancel = () => {
        setShowDeleteForm(false);
        setDeleteConfirm("");
        setDeletePassword("");
        setDeleteStatus(null);
    };

    const themeProps: SettingsThemeProps = {
        currentTheme,
        onThemeChange: handleThemeChange,
        themes: THEMES,
        themeOptions,
        onThemeOptionChange: handleThemeOptionChange,
        fontKey,
        onFontChange: setFont,
        fontSizeKey,
        onFontSizeChange: setFontSize,
        fontWeightKey,
        onFontWeightChange: setFontWeight,
        navSections: NAV_SECTIONS,
        widgetList: WIDGET_LIST,
        onWidgetOpen: handleWidgetOpen,
        onWidgetClose: handleWidgetClose,
        autostart,
        onAutostartToggle: handleAutostartToggle,
        user,
        t,
        newName,
        onNewNameChange: setNewName,
        onNameSave: handleNameSave,
        namePending,
        nameStatus,
        pwForm,
        onPwFormChange: handlePwFormChange,
        onPasswordSave: handlePasswordSave,
        pwPending,
        pwStatus,
        deleteConfirm,
        onDeleteConfirmChange: setDeleteConfirm,
        deletePassword,
        onDeletePasswordChange: setDeletePassword,
        deleteKeyword,
        deleteStatus,
        deletePending,
        showDeleteForm,
        onShowDeleteForm: setShowDeleteForm,
        onDelete: handleDelete,
        onDeleteCancel: handleDeleteCancel,
    };

    return <CelestialSettings {...themeProps} />;
}
