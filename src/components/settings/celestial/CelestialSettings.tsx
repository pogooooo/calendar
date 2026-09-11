"use client";

import * as React from "react";
import LocaleSelect from "@/components/LocaleSelect";
import TimezoneSelect from "@/components/TimezoneSelect";
import * as S from "./CelestialSettings.styles";
import * as L from "./CelestialSettings.layout";
import WidgetPreview from "./WidgetPreview";
import StarField from "./StarField";
import type { SettingsThemeProps } from "../SettingsPage";
import { FONT_OPTIONS, ensureFontLoaded } from "@/lib/fonts";
import { FONT_SIZE_OPTIONS, FONT_WEIGHT_OPTIONS } from "@/styles/GlobalTypography";

/**
 * 설정은 판(pane) 넷으로 나뉜다. 예전에는 여덟 조각이 세로로 이어져 있어
 * 오른쪽에 목차를 따로 둬야 했는데, 목차가 필요했다는 것 자체가 화면이
 * 너무 길다는 뜻이었다. 왼쪽 성좌가 곧 목차다.
 */
type TabId = "look" | "widget" | "system" | "account";

/**
 * 성좌 좌표. 일직선이 아니라 좌우로 꺾여야 별자리로 읽힌다.
 * 판이 몇 개인지는 환경에 따라 달라지므로(폰에서는 위젯 판이 빠진다)
 * 자리마다 x 를 미리 정해 두고 순서대로 꽂는다.
 */
const MARK_X = [30, 51, 26, 47];
const MARK_Y0 = 67;
const MARK_DY = 74;

const ROMAN = ["I", "II", "III", "IV"];

/** 축소판 달력 한 판. 오늘 하루와 일정 사흘이 들어간다. */
const CELL_PLAN = [
    "", "", "event", "", "", "", "",
    "", "today", "", "event", "", "", "",
    "", "", "", "", "event", "", "",
] as const;

export default function CelestialSettings({
    currentTheme, onThemeChange,
    themes, themeOptions, onThemeOptionChange,
    fontKey, onFontChange,
    fontSizeKey, onFontSizeChange,
    fontWeightKey, onFontWeightChange,
    widgetList,
    onWidgetOpen, onWidgetClose,
    autostart, onAutostartToggle,
    showWidgets, showAutostart, onCheckUpdate, updateChecking,
    user, t,
    newName, onNewNameChange, onNameSave, namePending, nameStatus,
    pwForm, onPwFormChange, onPasswordSave, pwPending, pwStatus,
    deleteConfirm, onDeleteConfirmChange,
    deletePassword, onDeletePasswordChange,
    deleteKeyword, deleteStatus, deletePending,
    showDeleteForm, onShowDeleteForm, onDelete, onDeleteCancel,
}: SettingsThemeProps) {
    const [tab, setTab] = React.useState<TabId>("look");

    React.useEffect(() => {
        FONT_OPTIONS.forEach(ensureFontLoaded);
    }, []);

    const TABS: { id: TabId; label: string; note: string; count: string }[] = [
        { id: "look",    label: t.settings.appearance,  note: t.settings.appearanceNote,  count: "2" },
        ...(showWidgets
            ? [{ id: "widget" as TabId, label: t.settings.widgets, note: t.widget.desc, count: String(widgetList.length) }]
            : []),
        { id: "system",  label: t.settings.system,      note: t.settings.systemNote,      count: showAutostart ? "4" : "2" },
        { id: "account", label: t.settings.account,     note: user?.email ?? "",          count: "4" },
    ];

    const TAB_MARKS = TABS.map((x, i) => ({
        id: x.id,
        x: MARK_X[i % MARK_X.length],
        y: MARK_Y0 + i * MARK_DY,
    }));

    // 위젯 판이 사라진 뒤에도 그 판이 골라져 있으면 빈 화면이 남는다.
    React.useEffect(() => {
        if (!TABS.some((x) => x.id === tab)) setTab("look");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showWidgets, tab]);

    const active = TABS.find((x) => x.id === tab) ?? TABS[0];
    const activeIndex = TABS.findIndex((x) => x.id === tab);

    // 위젯은 kind 마다 group 이 붙어 있다. 평평하게 늘어놓으면 그 정보가 버려진다.
    const widgetGroups = React.useMemo(() => {
        const order: string[] = [];
        const bucket = new Map<string, typeof widgetList>();
        widgetList.forEach((w) => {
            if (!bucket.has(w.group)) { bucket.set(w.group, []); order.push(w.group); }
            bucket.get(w.group)!.push(w);
        });
        return order.map((name) => ({ name, items: bucket.get(name)! }));
    }, [widgetList]);

    const optionLabels: Record<string, string> = {
        light: t.settings.lightMode,
        dark: t.settings.darkMode,
    };

    // 테마 하나가 여러 벌을 품고 있으면 조합마다 카드를 낸다.
    const themeCards = themes.flatMap((th) => {
        const opts = th.options.length > 0 ? th.options : ([""] as const);
        return opts.map((option) => ({
            theme: th,
            option: option as string,
            selected:
                currentTheme === th.id &&
                (option === "" || (themeOptions[th.id] ?? th.options[0]) === option),
        }));
    });

    return (
        <L.Shell>
            <StarField />

            <L.Frame>
                <L.Constellation>
                    <L.ConstellationArt viewBox="0 0 210 340" aria-hidden="true">
                        <polyline
                            points={TAB_MARKS.map((m) => `${m.x},${m.y}`).join(" ")}
                            fill="none" strokeWidth="1"
                        />
                        {/* 이름 없는 잔별. 성좌는 표지별만으로 이뤄지지 않는다. */}
                        <circle cx="72" cy="104" r="1.1" /><circle cx="16" cy="176" r="1.1" /><circle cx="66" cy="248" r="1.1" />
                    </L.ConstellationArt>

                    <L.TabList role="tablist" aria-orientation="vertical">
                        {TABS.map((x) => (
                            <L.TabButton
                                key={x.id}
                                role="tab"
                                type="button"
                                aria-selected={tab === x.id}
                                $active={tab === x.id}
                                onClick={() => setTab(x.id)}
                            >
                                <span className="lbl">{x.label}</span>
                                <span className="cnt">{x.count}</span>
                            </L.TabButton>
                        ))}
                        {TAB_MARKS.map((m) => (
                            <L.Mark key={m.id} $x={m.x} $y={m.y} $on={tab === m.id} aria-hidden="true" />
                        ))}
                    </L.TabList>
                </L.Constellation>

                <L.Pane>
                    <L.PaneHeader>
                        {tab === "look" && (
                            <L.Orbit viewBox="0 0 200 200" aria-hidden="true" fill="none" strokeWidth=".6">
                                <ellipse cx="100" cy="100" rx="80" ry="31" opacity=".55" />
                                <ellipse cx="100" cy="100" rx="80" ry="31" opacity=".55" transform="rotate(60 100 100)" />
                                <ellipse cx="100" cy="100" rx="80" ry="31" opacity=".55" transform="rotate(120 100 100)" />
                                <circle cx="100" cy="100" r="10" opacity=".85" />
                                <circle className="pip" cx="180" cy="100" r="3.2" />
                                <circle className="pip" cx="60" cy="31" r="2.4" />
                            </L.Orbit>
                        )}
                        <L.Eyebrow>{ROMAN[activeIndex]}</L.Eyebrow>
                        <L.PaneTitle>{active.label}</L.PaneTitle>
                        {active.note && <L.PaneNote>{active.note}</L.PaneNote>}
                    </L.PaneHeader>

                    <L.PaneBody key={tab}>
                        {/* ── 모양 ──────────────────────────────────────────── */}
                        {tab === "look" && (
                            <>
                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.theme}</h2></L.BlockHead>
                                    <L.ThemeRow>
                                        {themeCards.map(({ theme: th, option, selected }) => {
                                            const g = th.grounds[option] ?? th.grounds[th.options[0]];
                                            return (
                                                <L.ThemeCard
                                                    key={`${th.id}-${option}`}
                                                    type="button"
                                                    $selected={selected}
                                                    onClick={() => {
                                                        if (currentTheme !== th.id) onThemeChange(th.id);
                                                        onThemeOptionChange(th.id, option);
                                                    }}
                                                >
                                                    <L.Mini $bg={g.bg}>
                                                        <L.MiniRail $bg={g.rail}>
                                                            <i style={{ background: g.accent, width: "66%" }} />
                                                            <i style={{ background: g.dimInk, width: "90%" }} />
                                                            <i style={{ background: g.dimInk, width: "58%" }} />
                                                            <i style={{ background: g.dimInk, width: "78%" }} />
                                                            <i style={{ background: g.dimInk, width: "68%" }} />
                                                        </L.MiniRail>
                                                        <L.MiniBody>
                                                            <div className="title" style={{ background: g.ink }} />
                                                            <div className="week">
                                                                {Array.from({ length: 7 }, (_, i) => (
                                                                    <b key={i} style={{ background: g.dimInk }} />
                                                                ))}
                                                            </div>
                                                            <div className="grid">
                                                                {CELL_PLAN.map((kind, i) => (
                                                                    <span
                                                                        key={i}
                                                                        style={{
                                                                            background:
                                                                                kind === "today" ? g.accent
                                                                                    : kind === "event" ? g.event
                                                                                        : g.cell,
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </L.MiniBody>
                                                    </L.Mini>
                                                    <L.ThemeMeta>
                                                        <L.ThemeName>
                                                            <L.Star $on={selected} />
                                                            {th.label}{option !== th.options[0] ? ` ${optionLabels[option] ?? option}` : ""}
                                                        </L.ThemeName>
                                                        <L.ThemeDesc>{th.description}</L.ThemeDesc>
                                                    </L.ThemeMeta>
                                                </L.ThemeCard>
                                            );
                                        })}
                                    </L.ThemeRow>
                                </L.Block>

                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.font}</h2></L.BlockHead>

                                    <L.SegRow>
                                        <L.SegLabel>{t.settings.fontSize}</L.SegLabel>
                                        <L.SegGroup>
                                            {FONT_SIZE_OPTIONS.map((o) => (
                                                <L.Seg
                                                    key={o.key} type="button"
                                                    $selected={fontSizeKey === o.key}
                                                    onClick={() => onFontSizeChange(o.key)}
                                                >
                                                    <L.Star $on={fontSizeKey === o.key} $small />
                                                    {t.settings.fontSizes[o.key]}
                                                    <em>{o.px}</em>
                                                </L.Seg>
                                            ))}
                                        </L.SegGroup>
                                    </L.SegRow>

                                    <L.SegRow>
                                        <L.SegLabel>{t.settings.fontWeight}</L.SegLabel>
                                        <L.SegGroup>
                                            {FONT_WEIGHT_OPTIONS.map((o) => (
                                                <L.Seg
                                                    key={o.key} type="button"
                                                    $selected={fontWeightKey === o.key}
                                                    onClick={() => onFontWeightChange(o.key)}
                                                    style={o.weight > 0 ? { fontWeight: o.weight } : undefined}
                                                >
                                                    <L.Star $on={fontWeightKey === o.key} $small />
                                                    {t.settings.fontWeights[o.key]}
                                                </L.Seg>
                                            ))}
                                        </L.SegGroup>
                                    </L.SegRow>

                                    <L.FontGrid>
                                        {FONT_OPTIONS.map((f) => (
                                            <L.FontCard
                                                key={f.key} type="button"
                                                $selected={fontKey === f.key}
                                                onClick={() => onFontChange(f.key)}
                                            >
                                                <L.FontPreview $family={f.family}>
                                                    {t.settings.fontSample}
                                                </L.FontPreview>
                                                <L.CardFoot>
                                                    <L.Star $on={fontKey === f.key} />
                                                    <L.CardName>{t.settings.fontNames[f.key] ?? f.label}</L.CardName>
                                                </L.CardFoot>
                                            </L.FontCard>
                                        ))}
                                    </L.FontGrid>
                                </L.Block>
                            </>
                        )}

                        {/* ── 위젯 ──────────────────────────────────────────── */}
                        {tab === "widget" && widgetGroups.map(({ name, items }) => (
                            <L.Block key={name}>
                                <L.BlockHead><h2>{name}</h2></L.BlockHead>
                                <L.WidgetGallery>
                                    {items.map(({ kind, label, desc }) => (
                                        <L.WidgetCard key={kind}>
                                            <L.WidgetFrame>
                                                <WidgetPreview kind={kind} />
                                            </L.WidgetFrame>
                                            <L.WidgetBody>
                                                <L.CardName as="h4">{label}</L.CardName>
                                                <L.WidgetDesc>{desc}</L.WidgetDesc>
                                                <L.WidgetActions>
                                                    <S.FormButton $variant="primary" onClick={() => onWidgetOpen(kind)}>
                                                        {t.widget.open}
                                                    </S.FormButton>
                                                    <S.FormButton $variant="default" onClick={() => onWidgetClose(kind)}>
                                                        {t.widget.close}
                                                    </S.FormButton>
                                                </L.WidgetActions>
                                            </L.WidgetBody>
                                        </L.WidgetCard>
                                    ))}
                                </L.WidgetGallery>
                            </L.Block>
                        ))}

                        {/* ── 시스템 ────────────────────────────────────────── */}
                        {tab === "system" && (
                            <>
                                {/* 자동 시작은 창을 띄우는 OS 에만 있다. 폰에서는 눌러도 아무 일이 없다. */}
                                {showAutostart && (
                                    <S.InfoRow>
                                        <div>
                                            <S.InfoValue>{t.system.autostart}</S.InfoValue>
                                            <L.RowNote>{t.system.autostartDesc}</L.RowNote>
                                        </div>
                                        <S.FormButton
                                            $variant={autostart ? "primary" : "default"}
                                            onClick={onAutostartToggle}
                                        >
                                            {autostart ? "ON" : "OFF"}
                                        </S.FormButton>
                                    </S.InfoRow>
                                )}
                                <S.InfoRow style={showAutostart ? { marginTop: 16 } : undefined}>
                                    <div>
                                        <S.InfoValue>{t.system.language}</S.InfoValue>
                                        <L.RowNote>{t.system.languageDesc}</L.RowNote>
                                    </div>
                                    <LocaleSelect />
                                </S.InfoRow>
                                <S.InfoRow style={{ marginTop: 16 }}>
                                    <div>
                                        <S.InfoValue>{t.system.timezone}</S.InfoValue>
                                        <L.RowNote>{t.system.timezoneDesc}</L.RowNote>
                                    </div>
                                    <TimezoneSelect />
                                </S.InfoRow>
                                {/* 업데이트는 설치한 앱에만 있다. 결과를 말로 돌려줘야 "안 되는 건가" 하고 넘기지 않는다. */}
                                {showAutostart && (
                                    <S.InfoRow style={{ marginTop: 16 }}>
                                        <div>
                                            <S.InfoValue>{t.update.title}</S.InfoValue>
                                            <L.RowNote>{t.update.checkDesc}</L.RowNote>
                                        </div>
                                        <S.FormButton onClick={onCheckUpdate} disabled={updateChecking}>
                                            {updateChecking ? t.update.checking : t.update.check}
                                        </S.FormButton>
                                    </S.InfoRow>
                                )}
                            </>
                        )}

                        {/* ── 계정 ──────────────────────────────────────────── */}
                        {tab === "account" && (
                            <>
                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.accountInfo}</h2></L.BlockHead>
                                    <S.InfoRow>
                                        <S.InfoLabel>{t.account.email}</S.InfoLabel>
                                        <S.InfoValue>{user?.email ?? "—"}</S.InfoValue>
                                    </S.InfoRow>
                                    <S.InfoRow>
                                        <S.InfoLabel>{t.account.name}</S.InfoLabel>
                                        <S.InfoValue>{user?.name ?? "—"}</S.InfoValue>
                                    </S.InfoRow>
                                </L.Block>

                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.changeName}</h2></L.BlockHead>
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
                                </L.Block>

                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.changePassword}</h2></L.BlockHead>
                                    <S.FormRow>
                                        <S.FormLabel>{t.account.currentPassword}</S.FormLabel>
                                        <S.FormInput
                                            type="password" value={pwForm.current}
                                            onChange={(e) => onPwFormChange("current", e.target.value)}
                                            placeholder={t.account.currentPassword}
                                            autoComplete="current-password"
                                        />
                                    </S.FormRow>
                                    <S.FormRow>
                                        <S.FormLabel>{t.account.newPassword}</S.FormLabel>
                                        <S.FormInput
                                            type="password" value={pwForm.next}
                                            onChange={(e) => onPwFormChange("next", e.target.value)}
                                            placeholder={t.account.newPasswordPlaceholder}
                                            autoComplete="new-password"
                                        />
                                    </S.FormRow>
                                    <S.FormRow>
                                        <S.FormLabel>{t.account.confirmPassword}</S.FormLabel>
                                        <S.FormInput
                                            type="password" value={pwForm.confirm}
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
                                </L.Block>

                                <L.DangerBlock>
                                    <L.BlockHead $danger><h2>{t.settings.deleteAccount}</h2></L.BlockHead>
                                    {!showDeleteForm ? (
                                        <>
                                            <S.WarningText>{t.account.deleteWarning}</S.WarningText>
                                            <S.FormButton $variant="danger" onClick={() => onShowDeleteForm(true)}>
                                                {t.account.proceed}
                                            </S.FormButton>
                                        </>
                                    ) : (
                                        <>
                                            <S.WarningText>{t.account.deleteInstructions}</S.WarningText>
                                            <S.FormRow>
                                                <S.FormLabel>{t.account.passwordConfirm}</S.FormLabel>
                                                <S.FormInput
                                                    type="password" value={deletePassword}
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
                                </L.DangerBlock>
                            </>
                        )}
                    </L.PaneBody>
                </L.Pane>
            </L.Frame>
        </L.Shell>
    );
}
