"use client";

import * as React from "react";
import { usePickTheme } from "@/styles/themed";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import useSettingStore from "@/store/useSettingStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { mirrorWidgetStateToFile } from "@/lib/widgetStateFile";
import { useT } from "@/i18n/useT";
import useIsMobile from "@/hooks/useIsMobile";
import { isDesktopShell } from "@/lib/platform";
import { checkForUpdate } from "@/lib/updater";
import { RELEASE_NOTES, type ReleaseNote } from "@/lib/releaseNotes";
import { WIDGET_KINDS } from "@/lib/widgetKinds";
import { useDialog } from "@/components/dialog/DialogProvider";
import CelestialSettings from "./celestial/CelestialSettings";
import type { Translations } from "@/i18n/types";
import { listThemes, type ThemeChoice } from "@/styles/theme";

// 테마 목록의 모양은 styles/theme.ts 가 정한다.
export type { ThemeChoice as ThemeDef } from "@/styles/theme";

export interface SettingsThemeProps {
    currentTheme: string;
    onThemeChange: (themeId: string) => void;
    themes: ThemeChoice[];
    themeOptions: Record<string, string>;
    onThemeOptionChange: (themeId: string, opt: string) => void;
    fontKey: string;
    onFontChange: (fontKey: string) => void;
    fontSizeKey: string;
    onFontSizeChange: (key: string) => void;
    fontWeightKey: string;
    onFontWeightChange: (key: string) => void;
    widgetList: { kind: string; label: string; desc: string; group: string }[];
    onWidgetOpen: (kind: string) => void;
    onWidgetClose: (kind: string) => void;
    autostart: boolean;
    onAutostartToggle: () => void;
    /** 위젯을 띄울 창이 있는 환경인가 (폰에는 없다) */
    showWidgets: boolean;
    /** OS 시작 등록이 되는 환경인가 (데스크톱 앱만) */
    showAutostart: boolean;
    /** 업데이트 확인 단추 (데스크톱 앱만) */
    onCheckUpdate: () => void;
    updateChecking: boolean;
    /** 지금 쓰는 판 (package.json) */
    appVersion: string;
    releaseNotes: ReleaseNote[];
    locale: "ko" | "en";
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

import type { WidgetKind } from "@/store/useWidgetStore";
import { useWidgetMeta } from "@/hooks/useWidgetMeta";

/**
 * 실패하면 그 까닭을 글로 돌려준다.
 * 예전에는 console.error 로만 남겨서, 열리지 않는 위젯이
 * 사용자에게는 "눌러도 아무 일이 없는 단추"로 보였다.
 */
async function invokeWidget(action: "open" | "close", kind: WidgetKind): Promise<string | null> {
    if (typeof window === "undefined") return null;
    const isTauri = "__TAURI_INTERNALS__" in window;

    if (isTauri) {
        try {
            // 여기서 플래그를 갱신하지 않으면 설정에서 끈 위젯이 다음 부팅에 되살아난다
            try { localStorage.setItem(`cronos-widget-open:${kind}`, action === "open" ? "1" : "0"); } catch {}
            await mirrorWidgetStateToFile();

            const { invoke } = await import("@tauri-apps/api/core");
            await invoke(action === "open" ? "open_widget" : "close_widget", { kind });
            return null;
        } catch (err) {
            console.error("[Widget] invoke 실패:", err);
            return err instanceof Error ? err.message : String(err);
        }
    }

    if (action === "open") {
        const win = window.open(`/widget/${kind}`, `widget_${kind}`,
            "width=400,height=520,menubar=no,toolbar=no,location=no");
        // 팝업이 막히면 window.open 이 null 을 돌려준다. 이것도 알려야 한다.
        if (!win) return "popupBlocked";
    }
    return null;
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
    const SettingsView = usePickTheme({ celestial: CelestialSettings });
    const router = useRouter();
    const t = useT();
    const isMobile = useIsMobile();

    /**
     * 위젯 열기·닫기와 자동 시작은 데스크톱 전용 Tauri 명령이다
     * (lib.rs 에서 #[cfg(desktop)] 로 묶여 있어 안드로이드에는 등록조차 안 된다).
     * 폰에서 그 단추를 내보이면 눌러도 아무 일이 없다.
     */
    const [desktopShell, setDesktopShell] = React.useState(false);
    React.useEffect(() => setDesktopShell(isDesktopShell()), []);
    // 데스크톱 웹에서는 위젯이 새 창으로 뜨므로 그대로 쓸 수 있다.
    const showWidgets = !isMobile;
    const showAutostart = desktopShell;
    const locale = useSettingStore((s) => s.locale);
    const dialog = useDialog();

    const [updateChecking, setUpdateChecking] = React.useState(false);
    const handleCheckUpdate = React.useCallback(async () => {
        if (updateChecking) return;
        setUpdateChecking(true);
        try {
            const result = await checkForUpdate();
            const { getVersion } = await import("@tauri-apps/api/app");
            const current = await getVersion().catch(() => "");
            if (result.status === "available") {
                await dialog.notify({ title: t.update.title, message: t.update.found(result.update.version) });
            } else if (result.status === "latest") {
                await dialog.notify({ title: t.update.title, message: t.update.upToDate(current) });
            } else if (result.status === "error") {
                await dialog.notify({ title: t.update.title, message: t.update.checkFailed(result.message) });
            }
        } finally {
            setUpdateChecking(false);
        }
    }, [updateChecking, dialog, t]);
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const logout = useAuthStore((s) => s.logout);
    const authFetch = useAuthFetch();

    const { theme: currentTheme, updateTheme } = useSettingStore();
    const themeOptions = useSettingStore((s) => s.themeOptions);
    const setThemeOption = useSettingStore((s) => s.setThemeOption);
    const autostart = useSettingStore((s) => s.autostart);
    const setAutostart = useSettingStore((s) => s.setAutostart);
    const fontKey = useSettingStore((s) => s.font);
    const setFont = useSettingStore((s) => s.setFont);
    const fontSizeKey = useSettingStore((s) => s.fontSize);
    const setFontSize = useSettingStore((s) => s.setFontSize);
    const fontWeightKey = useSettingStore((s) => s.fontWeight);
    const setFontWeight = useSettingStore((s) => s.setFontWeight);

    /**
     * 목록은 WIDGET_KINDS 를 따라 만든다. Record 라서 새 위젯을 더하면
     * 여기 설명을 빠뜨렸을 때 컴파일이 멈춘다.
     */
    const widgetMeta = useWidgetMeta();
    const WIDGET_LIST = React.useMemo(
        () => WIDGET_KINDS.map((kind) => ({ kind, ...widgetMeta[kind] })),
        [widgetMeta],
    );

    const handleThemeChange = (themeId: string) => updateTheme(authFetch, themeId);
    const handleThemeOptionChange = (themeId: string, opt: string) => setThemeOption(themeId, opt);

    const runWidget = async (action: "open" | "close", kind: string) => {
        const error = await invokeWidget(action, kind as WidgetKind);
        if (!error) return;
        await dialog.notify({
            title: action === "open" ? t.widget.openFailed : t.widget.closeFailed,
            message: error === "popupBlocked" ? t.widget.popupBlocked : error,
        });
    };

    const handleWidgetOpen = (kind: string) => { void runWidget("open", kind); };
    const handleWidgetClose = (kind: string) => { void runWidget("close", kind); };

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
                setNameStatus({ type: "error", msg: data.message ?? t.account.genericError });
            } else {
                setUser({ ...user!, name: data.user.name });
                setNameStatus({ type: "success", msg: t.account.nameChanged });
            }
        } catch {
            setNameStatus({ type: "error", msg: t.account.connectError });
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
        if (pwForm.next !== pwForm.confirm) { setPwStatus({ type: "error", msg: t.account.passwordMismatch }); return; }
        if (pwForm.next.length < 8)         { setPwStatus({ type: "error", msg: t.account.passwordTooShort }); return; }
        setPwPending(true); setPwStatus(null);
        try {
            const res = await authFetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPwStatus({ type: "error", msg: data.message ?? t.account.genericError });
            } else {
                setPwStatus({ type: "success", msg: t.account.passwordChanged });
                setPwForm({ current: "", next: "", confirm: "" });
            }
        } catch {
            setPwStatus({ type: "error", msg: t.account.connectError });
        } finally {
            setPwPending(false);
        }
    };

    const [deleteConfirm, setDeleteConfirm] = React.useState("");
    const [deletePassword, setDeletePassword] = React.useState("");
    const [deleteStatus, setDeleteStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [deletePending, setDeletePending] = React.useState(false);
    const [showDeleteForm, setShowDeleteForm] = React.useState(false);

    const deleteKeyword = t.account.deleteKeyword;

    const handleDelete = async () => {
        if (deleteConfirm !== deleteKeyword) {
            setDeleteStatus({ type: "error", msg: t.account.typeExactly(deleteKeyword) });
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
                setDeleteStatus({ type: "error", msg: data.message ?? t.account.genericError });
            } else {
                await logout();
                // 라우트 이름은 /signIn 이다. /login 으로 보내면 탈퇴 직후 404 가 뜬다.
                router.push("/signIn");
            }
        } catch {
            setDeleteStatus({ type: "error", msg: t.account.connectError });
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
        themes: listThemes(),
        themeOptions,
        onThemeOptionChange: handleThemeOptionChange,
        fontKey,
        onFontChange: setFont,
        fontSizeKey,
        onFontSizeChange: setFontSize,
        fontWeightKey,
        onFontWeightChange: setFontWeight,
        widgetList: WIDGET_LIST,
        onWidgetOpen: handleWidgetOpen,
        onWidgetClose: handleWidgetClose,
        autostart,
        onAutostartToggle: handleAutostartToggle,
        showWidgets,
        showAutostart,
        onCheckUpdate: handleCheckUpdate,
        updateChecking,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "",
        releaseNotes: RELEASE_NOTES,
        locale,
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

    return <SettingsView {...themeProps} />;
}
