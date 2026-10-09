"use client";

import * as React from "react";
import LocaleSelect from "@/components/LocaleSelect";
import TimezoneSelect from "@/components/TimezoneSelect";
import WidgetPreview from "./celestial/WidgetPreview";
import Backdrop from "./parts/Backdrop";
import ThemePicker from "./parts/ThemePicker";
import type { SettingsThemeProps } from "./SettingsPage";
import { FONT_OPTIONS, ensureFontLoaded } from "@/lib/fonts";
import { FONT_SIZE_OPTIONS, FONT_WEIGHT_OPTIONS } from "@/styles/GlobalTypography";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSettings.styles";
import * as MapleS from "./maple/MapleSettings.styles";
import * as CelestialLS from "./celestial/CelestialSettings.layout";
import * as MapleLS from "./maple/MapleSettings.layout";
import * as OceanS from './ocean/OceanSettings.styles';
import * as OceanLS from './ocean/OceanSettings.layout';
import useSettingStore from '@/store/useSettingStore';
import ThemeShop from '@/components/billing/ThemeShop';
import { Armillary, MoonDisc, Orbit, Star4, Star8, SunMoon } from '@/components/ornament/celestial/CelestialOrnaments';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };
const LAYOUTS: ThemeImpls<typeof CelestialLS> = { celestial: CelestialLS, maple: MapleLS, ocean: OceanLS };

/**
 * 설정은 판(pane) 넷으로 나뉜다. 예전에는 여덟 조각이 세로로 이어져 있어
 * 오른쪽에 목차를 따로 둬야 했는데, 목차가 필요했다는 것 자체가 화면이
 * 너무 길다는 뜻이었다. 왼쪽 성좌가 곧 목차다.
 */
type TabId = "look" | "widget" | "system" | "account" | "about";

/**
 * 목차의 축. 표지별은 모두 이 세로 금선에 꿰인다 — 비스듬히 꺾인 성좌선 대신 곧은 축과 고리·구슬
 * (Celestial 의 문양은 직선·달·별·혼천의만 쓴다. 이 그림은 Celestial 만 보이고 Maple·Ocean 은 감춘다).
 * 판이 몇 개인지는 환경에 따라 달라지므로(폰에서는 위젯 판이 빠진다) 자리마다 y 를 순서대로 꽂는다.
 */
const MARK_X = 38;
const MARK_Y0 = 67;
const MARK_DY = 74;

const ROMAN = ["I", "II", "III", "IV"];

export default function SettingsView({
    currentTheme, onThemeChange,
    themes, themeOptions, onThemeOptionChange,
    fontKey, onFontChange,
    fontSizeKey, onFontSizeChange,
    fontWeightKey, onFontWeightChange,
    widgetList,
    onWidgetOpen, onWidgetClose,
    autostart, onAutostartToggle,
    showWidgets, showAutostart, onCheckUpdate, updateChecking, appVersion, releaseNotes, locale,
    user, t,
    newName, onNewNameChange, onNameSave, namePending, nameStatus,
    pwForm, onPwFormChange, onPasswordSave, pwPending, pwStatus,
    deleteConfirm, onDeleteConfirmChange,
    deletePassword, onDeletePasswordChange,
    deleteKeyword, deleteStatus, deletePending,
    showDeleteForm, onShowDeleteForm, onDelete, onDeleteCancel,
}: SettingsThemeProps) {
    const S = usePickTheme(STYLES);
    const L = usePickTheme(LAYOUTS);
    const [tab, setTab] = React.useState<TabId>("look");
    const motion = useSettingStore(s => s.motion);
    const setMotion = useSettingStore(s => s.setMotion);

    React.useEffect(() => {
        FONT_OPTIONS.forEach(ensureFontLoaded);
    }, []);

    const TABS: { id: TabId; label: string; note: string; count: string }[] = [
        { id: "look",    label: t.settings.appearance,  note: t.settings.appearanceNote,  count: "2" },
        ...(showWidgets
            ? [{ id: "widget" as TabId, label: t.settings.widgets, note: t.widget.desc, count: String(widgetList.length) }]
            : []),
        { id: "system",  label: t.settings.system,      note: t.settings.systemNote,      count: showAutostart ? "3" : "2" },
        { id: "account", label: t.settings.account,     note: user?.email ?? "",          count: "4" },
        { id: "about",   label: t.settings.about,       note: t.settings.aboutNote,       count: String(releaseNotes.length) },
    ];

    const TAB_MARKS = TABS.map((x, i) => ({
        id: x.id,
        x: MARK_X,
        y: MARK_Y0 + i * MARK_DY,
    }));
    const lastMarkY = TAB_MARKS[TAB_MARKS.length - 1].y;

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

    return (
        <L.Shell>
            <Backdrop />

            <L.Frame>
                <L.Constellation>
                    <L.ConstellationArt viewBox="0 0 210 340" aria-hidden="true">
                        {/* 곧은 축 — 위는 반달, 아래는 점으로 끝난다. 곁에 가는 줄이 나란히 */}
                        <line className="hair" x1={MARK_X} y1={23} x2={MARK_X} y2={lastMarkY + 34} />
                        <MoonDisc cx={MARK_X} cy={15} r={5} phase={0.25} />
                        <circle className="fill" cx={MARK_X} cy={lastMarkY + 37} r={1.6} />
                        <line className="hair" x1={MARK_X - 18} y1={44} x2={MARK_X - 18} y2={lastMarkY - 16} />
                        <circle className="fill" cx={MARK_X - 18} cy={44} r={1.2} />
                        <circle className="fill" cx={MARK_X - 18} cy={lastMarkY - 16} r={1.2} />
                        {/* 표지별마다 점선 고리, 그 사이엔 작은 구슬 */}
                        {TAB_MARKS.map((m) => <circle key={m.id} className="hair dash" cx={MARK_X} cy={m.y} r={12} />)}
                        {TAB_MARKS.slice(1).map((m, i) => (
                            <circle key={m.id} className="line" cx={MARK_X} cy={(TAB_MARKS[i].y + m.y) / 2} r={2.4} />
                        ))}
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
                        {/* 판 머리의 천체 — 판마다 다른 하나(혼천의·해와 달·달의 궤도·보름·팔각별) */}
                        <L.Orbit viewBox="0 0 200 200" aria-hidden="true">
                            <circle className="hair" cx="100" cy="100" r="96" />
                            <circle className="hair dash" cx="100" cy="100" r="88" />
                            {tab === "look" && <>
                                <Orbit cx={100} cy={100} r={76} at={250} size={3.2} spin />
                                <Armillary cx={100} cy={100} r={50} axis={1.4} />
                            </>}
                            {tab === "widget" && <>
                                <Orbit cx={100} cy={100} r={76} at={200} size={2.6} hollow spin />
                                <SunMoon cx={100} cy={100} r={62} rays={40} />
                            </>}
                            {tab === "system" && <>
                                <Orbit cx={100} cy={100} r={76} at={230} size={3} spin />
                                <Orbit cx={100} cy={100} r={52} at={300} size={2.2} hollow spin />
                                <MoonDisc cx={100} cy={100} r={24} phase={0.62} />
                            </>}
                            {tab === "account" && <>
                                <Orbit cx={100} cy={100} r={76} at={210} size={3} spin />
                                <MoonDisc cx={100} cy={100} r={30} phase={0.5} />
                                <circle className="hair" cx="100" cy="100" r="40" />
                            </>}
                            {tab === "about" && <>
                                <Orbit cx={100} cy={100} r={76} at={240} size={3} spin />
                                <circle className="line dash" cx="100" cy="100" r="50" />
                                <Star8 cx={100} cy={100} r={34} />
                            </>}
                            <Star4 cx={22} cy={150} r={6} />
                        </L.Orbit>
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
                                    <ThemePicker
                                        L={L}
                                        themes={themes}
                                        currentTheme={currentTheme}
                                        themeOptions={themeOptions}
                                        onThemeChange={onThemeChange}
                                        onThemeOptionChange={onThemeOptionChange}
                                        optionLabels={optionLabels}
                                        label={t.settings.theme}
                                        variantLabel={locale === 'ko' ? '밝기' : 'Variant'}
                                    />
                                    <ThemeShop locale={locale} />
                                </L.Block>

                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.font}</h2></L.BlockHead>

                                    <L.SegRow>
                                        <L.SegLabel>{locale === 'ko' ? '테마 애니메이션' : 'Theme animation'}</L.SegLabel>
                                        <L.SegGroup role="group" aria-label={locale === 'ko' ? '테마 애니메이션' : 'Theme animation'}>
                                            {(['full', 'gentle', 'off'] as const).map((value, i) => <L.Seg
                                                key={value} type="button" $selected={motion === value}
                                                aria-pressed={motion === value} onClick={() => setMotion(value)}
                                            >{(locale === 'ko' ? ['풍성하게', '잔잔하게', '끄기'] : ['Full', 'Gentle', 'Off'])[i]}</L.Seg>)}
                                        </L.SegGroup>
                                    </L.SegRow>

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
                            </>
                        )}

                        {/* ── 정보 ──────────────────────────────────────────── */}
                        {tab === "about" && (
                            <>
                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.currentVersion}</h2></L.BlockHead>
                                    <S.InfoRow>
                                        <div>
                                            <S.InfoValue>CRONOS v{appVersion}</S.InfoValue>
                                            {/* 업데이트는 설치한 앱에만 있다. 결과를 말로 돌려줘야 "안 되는 건가" 하고 넘기지 않는다. */}
                                            {showAutostart && <L.RowNote>{t.update.checkDesc}</L.RowNote>}
                                        </div>
                                        {showAutostart && (
                                            <S.FormButton onClick={onCheckUpdate} disabled={updateChecking}>
                                                {updateChecking ? t.update.checking : t.update.check}
                                            </S.FormButton>
                                        )}
                                    </S.InfoRow>
                                </L.Block>

                                <L.Block>
                                    <L.BlockHead><h2>{t.settings.releaseNotes}</h2></L.BlockHead>
                                    <L.NoteList>
                                        {releaseNotes.map((n) => (
                                            <L.Note key={n.version} $current={n.version === appVersion}>
                                                <L.NoteHead>
                                                    <span className="ver">v{n.version}</span>
                                                    <span className="date">{n.date}</span>
                                                    {n.version === appVersion && <em>{t.settings.thisVersion}</em>}
                                                </L.NoteHead>
                                                <ul>
                                                    {n.notes[locale].map((line, i) => <li key={i}>{line}</li>)}
                                                </ul>
                                            </L.Note>
                                        ))}
                                    </L.NoteList>
                                </L.Block>
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
