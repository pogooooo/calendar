"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
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

const NAV_SECTIONS = [
    { id: "sec-appearance", label: "Appearance" },
    { id: "sec-widgets",    label: "위젯" },
    { id: "sec-account-info", label: "계정 정보" },
    { id: "sec-name", label: "이름 변경" },
    { id: "sec-password", label: "비밀번호 변경" },
    { id: "sec-delete", label: "회원 탈퇴" },
] as const;

type WidgetKind = "daily" | "weekly" | "monthly";

const WIDGET_LIST: { kind: WidgetKind; label: string; desc: string }[] = [
    { kind: "daily",   label: "일간 캘린더",  desc: "오늘의 일정 타임라인" },
    { kind: "weekly",  label: "주간 캘린더",  desc: "이번 주 7일 일정" },
    { kind: "monthly", label: "월간 캘린더",  desc: "월간 일정 그리드" },
];

async function invokeWidget(action: "open" | "close", kind: WidgetKind) {
    if (typeof window === "undefined") return;

    // Tauri v2 환경 감지
    const isTauri = "__TAURI_INTERNALS__" in window;

    console.log("[Widget] isTauri:", isTauri, "action:", action, "kind:", kind);

    if (isTauri) {
        try {
            const { invoke } = await import("@tauri-apps/api/core");
            const cmd = action === "open" ? "open_widget" : "close_widget";
            console.log("[Widget] invoking:", cmd);
            const result = await invoke(cmd, { kind });
            console.log("[Widget] invoke result:", result);
        } catch (err) {
            console.error("[Widget] invoke 실패:", err);
        }
    } else {
        // 브라우저 모드 — 팝업으로 미리보기
        if (action === "open") {
            window.open(`/widget/${kind}`, `widget_${kind}`,
                "width=400,height=520,menubar=no,toolbar=no,location=no");
        }
    }
}

export default function CelestialSettings({ currentTheme, onThemeChange }: SettingsThemeProps) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const logout = useAuthStore((state) => state.logout);
    const authFetch = useAuthFetch();

    // ── active nav item 추적 ──────────────────────────────────────────────────
    const [activeId, setActiveId] = React.useState<string>("sec-appearance");

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // 가장 위쪽에 있는 visible 섹션을 active로
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
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // ── 이름 변경 ─────────────────────────────────────────────────────────────
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

    // ── 비밀번호 변경 ─────────────────────────────────────────────────────────
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

    // ── 회원 탈퇴 ─────────────────────────────────────────────────────────────
    const [deleteConfirm, setDeleteConfirm] = React.useState("");
    const [deletePassword, setDeletePassword] = React.useState("");
    const [deleteStatus, setDeleteStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [deletePending, setDeletePending] = React.useState(false);
    const [showDeleteForm, setShowDeleteForm] = React.useState(false);

    const handleDelete = async () => {
        if (deleteConfirm !== "탈퇴") { setDeleteStatus({ type: "error", msg: '"탈퇴" 를 정확히 입력해주세요.' }); return; }
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
            {/* ── 메인 콘텐츠 ─────────────────────────────────────────────── */}
            <S.MainContent>
                <S.PageHeader>
                    <span>Settings</span>
                    <hr />
                </S.PageHeader>

                {/* Appearance */}
                <S.Section id="sec-appearance">
                    <S.SectionTitle>Appearance</S.SectionTitle>
                    <S.ThemeGrid>
                        {THEMES.map((t) => {
                            const selected = currentTheme === t.id;
                            return (
                                <S.ThemeCard key={t.id} $selected={selected} onClick={() => onThemeChange(t.id)}>
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
                                        {selected && <S.CheckMark><Check size={12} strokeWidth={3} /></S.CheckMark>}
                                    </S.ThemeInfo>
                                </S.ThemeCard>
                            );
                        })}
                    </S.ThemeGrid>
                </S.Section>

                {/* 위젯 */}
                <S.Section id="sec-widgets">
                    <S.SectionTitle>위젯</S.SectionTitle>
                    <S.SectionBody>
                        <S.WarningText style={{ marginBottom: 16 }}>
                            데스크탑 위젯으로 열어 바탕화면에 캘린더를 고정할 수 있습니다.
                            Tauri 앱에서 실행 중일 때 동작합니다.
                        </S.WarningText>
                        {WIDGET_LIST.map(({ kind, label, desc }) => (
                            <S.InfoRow key={kind}>
                                <div>
                                    <S.InfoValue>{label}</S.InfoValue>
                                    <div style={{ fontSize: "0.74rem", opacity: 0.55, marginTop: 2 }}>{desc}</div>
                                </div>
                                <S.ButtonRow style={{ marginTop: 0 }}>
                                    <S.FormButton $variant="primary" onClick={() => invokeWidget("open", kind)}>
                                        열기
                                    </S.FormButton>
                                    <S.FormButton $variant="default" onClick={() => invokeWidget("close", kind)}>
                                        닫기
                                    </S.FormButton>
                                </S.ButtonRow>
                            </S.InfoRow>
                        ))}
                    </S.SectionBody>
                </S.Section>

                {/* 계정 정보 */}
                <S.Section id="sec-account-info">
                    <S.SectionTitle>계정 정보</S.SectionTitle>
                    <S.SectionBody>
                        <S.InfoRow>
                            <S.InfoLabel>이메일</S.InfoLabel>
                            <S.InfoValue>{user?.email ?? "—"}</S.InfoValue>
                        </S.InfoRow>
                        <S.InfoRow>
                            <S.InfoLabel>이름</S.InfoLabel>
                            <S.InfoValue>{user?.name ?? "—"}</S.InfoValue>
                        </S.InfoRow>
                    </S.SectionBody>
                </S.Section>

                {/* 이름 변경 */}
                <S.Section id="sec-name">
                    <S.SectionTitle>이름 변경</S.SectionTitle>
                    <S.SectionBody>
                        <S.FormRow>
                            <S.FormLabel>새 이름</S.FormLabel>
                            <S.FormInput
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="변경할 이름을 입력하세요"
                                maxLength={30}
                            />
                        </S.FormRow>
                        <S.ButtonRow>
                            <S.FormButton
                                $variant="primary"
                                onClick={handleNameSave}
                                disabled={namePending || !newName.trim() || newName.trim() === user?.name}
                            >
                                {namePending ? "저장 중..." : "저장"}
                            </S.FormButton>
                        </S.ButtonRow>
                        {nameStatus && <S.StatusMessage $type={nameStatus.type}>{nameStatus.msg}</S.StatusMessage>}
                    </S.SectionBody>
                </S.Section>

                {/* 비밀번호 변경 */}
                <S.Section id="sec-password">
                    <S.SectionTitle>비밀번호 변경</S.SectionTitle>
                    <S.SectionBody>
                        <S.FormRow>
                            <S.FormLabel>현재 비밀번호</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.current}
                                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                                placeholder="현재 비밀번호"
                                autoComplete="current-password"
                            />
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormLabel>새 비밀번호</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.next}
                                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                                placeholder="8자 이상"
                                autoComplete="new-password"
                            />
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormLabel>새 비밀번호 확인</S.FormLabel>
                            <S.FormInput
                                type="password"
                                value={pwForm.confirm}
                                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                                placeholder="새 비밀번호 재입력"
                                autoComplete="new-password"
                            />
                        </S.FormRow>
                        <S.ButtonRow>
                            <S.FormButton
                                $variant="primary"
                                onClick={handlePasswordSave}
                                disabled={pwPending || !pwForm.current || !pwForm.next || !pwForm.confirm}
                            >
                                {pwPending ? "변경 중..." : "비밀번호 변경"}
                            </S.FormButton>
                        </S.ButtonRow>
                        {pwStatus && <S.StatusMessage $type={pwStatus.type}>{pwStatus.msg}</S.StatusMessage>}
                    </S.SectionBody>
                </S.Section>

                {/* 회원 탈퇴 */}
                <S.Section id="sec-delete">
                    <S.SectionTitle>회원 탈퇴</S.SectionTitle>
                    <S.SectionBody>
                        {!showDeleteForm ? (
                            <>
                                <S.WarningText>
                                    탈퇴 시 모든 데이터(카테고리, 투두, 프로젝트, 챌린지 등)가 <strong>영구적으로 삭제</strong>됩니다.
                                    이 작업은 되돌릴 수 없습니다.
                                </S.WarningText>
                                <S.FormButton $variant="danger" onClick={() => setShowDeleteForm(true)}>
                                    탈퇴 진행
                                </S.FormButton>
                            </>
                        ) : (
                            <>
                                <S.WarningText>
                                    탈퇴를 진행하려면 비밀번호를 입력하고 아래에 <strong>탈퇴</strong>라고 입력해주세요.
                                </S.WarningText>
                                <S.FormRow>
                                    <S.FormLabel>비밀번호 확인</S.FormLabel>
                                    <S.FormInput
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="현재 비밀번호 (소셜 로그인은 비워두세요)"
                                    />
                                </S.FormRow>
                                <S.FormRow>
                                    <S.FormLabel>확인 문구 — <strong>탈퇴</strong> 라고 입력</S.FormLabel>
                                    <S.FormInput
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                        placeholder="탈퇴"
                                    />
                                </S.FormRow>
                                <S.ButtonRow>
                                    <S.FormButton
                                        $variant="default"
                                        onClick={() => { setShowDeleteForm(false); setDeleteConfirm(""); setDeletePassword(""); setDeleteStatus(null); }}
                                    >
                                        취소
                                    </S.FormButton>
                                    <S.FormButton
                                        $variant="danger"
                                        onClick={handleDelete}
                                        disabled={deletePending || deleteConfirm !== "탈퇴"}
                                    >
                                        {deletePending ? "처리 중..." : "최종 탈퇴"}
                                    </S.FormButton>
                                </S.ButtonRow>
                                {deleteStatus && <S.StatusMessage $type={deleteStatus.type}>{deleteStatus.msg}</S.StatusMessage>}
                            </>
                        )}
                    </S.SectionBody>
                </S.Section>
            </S.MainContent>

            {/* ── 우측 네비게이션 ──────────────────────────────────────────── */}
            <S.NavPanel>
                <S.NavTitle>On this page</S.NavTitle>
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
