"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import useAnniversaryStore, { AnniversaryType } from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import { useT } from "@/i18n/useT";
import DateTimePicker from "@/components/input/dateTimePicker/DateTimePicker";
import { wallNow } from "@/lib/dateKey";
import AnniversaryIcon, { ANNIVERSARY_ICONS, resolveIconKey } from "@/assets/AnniversaryIcon";
import { useThemeFamily, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialAnniversary.styles";
import * as MapleS from "./maple/MapleAnniversary.styles";
import * as OceanS from './ocean/OceanAnniversary.styles';
import * as GemS from "./gem/GemAnniversary.styles";
import CelestialAnniversaryLayout from "./celestial/CelestialAnniversaryLayout";
import OceanAnniversaryLayout from "./ocean/OceanAnniversaryLayout";
import type { AnniversaryItem } from "./AnniversaryLayout.types";
import useAnniversaryFx from "@/components/fx/useAnniversaryFx";
import { nextAnniversary } from "@/lib/anniversary";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { useListMotion } from "@/hooks/useMotion";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS } satisfies ThemeImpls<typeof CelestialS>;

/** 갈래마다 제 배치 — Maple 은 Celestial 의 배치(서식 | 카드 격자)에 제 모양을 입히고, 바다는 가장 가까운 날의 큰 숫자와 물때 줄 */
const LAYOUTS = { celestial: CelestialAnniversaryLayout, maple: CelestialAnniversaryLayout, ocean: OceanAnniversaryLayout, gem: CelestialAnniversaryLayout };

type AnniversaryDraft = Omit<AnniversaryType, "id">;

function AnnualDatePicker({ month, day, change, disabled }: Pick<AnniversaryDraft, "month" | "day"> & {
    change: (patch: Partial<AnniversaryDraft>) => void; disabled: boolean;
}) {
    const t = useT();
    const [viewYear, setViewYear] = React.useState(() => wallNow().getFullYear());
    let year = viewYear;
    // Display February 29 in a real leap-year grid; only month and day belong to the record.
    if (month === 2 && day === 29) while (new Date(year, 2, 0).getDate() !== 29) year++;
    const value = [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
    const label = t.anniversaryPage.everyYear(month, day);
    return <DateTimePicker mode="date" value={value} disabled={disabled} ariaLabel={label} displayLabel={label}
        onChange={key => {
            const [y, m, d] = key.split("-").map(Number);
            setViewYear(y);
            change({ month: m, day: d });
        }} />;
}

export default function AnniversaryPage() {
    const family = useThemeFamily();
    const S = STYLES[family];
    const Layout = LAYOUTS[family];
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();
    const { anniversaries, fetchAnniversaries, addAnniversary, updateAnniversary, deleteAnniversary } = useAnniversaryStore();

    const [draft, setDraft] = React.useState<AnniversaryDraft>(() => {
        const today = wallNow();
        return { title: "", month: today.getMonth() + 1, day: today.getDate(), icon: ANNIVERSARY_ICONS[0].key };
    });
    const [pending, setPending] = React.useState(false);
    const [editing, setEditing] = React.useState<{ original: AnniversaryType; draft: AnniversaryDraft } | null>(null);
    const [editError, setEditError] = React.useState(false);
    const [editSaving, setEditSaving] = React.useState(false);
    const editInFlight = React.useRef(false);

    React.useEffect(() => {
        fetchAnniversaries(authFetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft.title.trim() || pending) return;
        setPending(true);
        const error = await addAnniversary(authFetch, { ...draft, title: draft.title.trim() });
        setPending(false);
        if (error) { await dialog.notify({ title: t.alert.addFailed, message: error }); return; }
        setDraft(current => ({ ...current, title: "" }));
    };

    const handleEdit = (item: AnniversaryType) => {
        setEditError(false);
        const { title, month, day, icon } = item;
        setEditing({ original: item, draft: { title, month, day, icon } });
    };

    const closeEdit = () => {
        if (!editInFlight.current) setEditing(null);
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing?.draft.title.trim() || editInFlight.current) return;
        const { original, draft: { title, month, day, icon } } = editing;
        const changes: Partial<AnniversaryDraft> = {};
        if (title.trim() !== original.title) changes.title = title.trim();
        if (month !== original.month || day !== original.day) Object.assign(changes, { month, day });
        if (icon !== original.icon) changes.icon = icon;
        if (Object.keys(changes).length === 0) { closeEdit(); return; }

        editInFlight.current = true;
        setEditSaving(true);
        setEditError(false);
        const saved = await updateAnniversary(authFetch, original.id, changes);
        editInFlight.current = false;
        setEditSaving(false);
        if (saved) setEditing(null);
        else setEditError(true);
    };

    const handleDelete = async (a: AnniversaryType) => {
        const ok = await dialog.confirmDanger({
            title: t.anniversaryPage.deleteTitle,
            message: t.anniversaryPage.deleteMessage(a.title),
        });
        if (ok) deleteAnniversary(authFetch, a.id);
    };

    /* 다음에 돌아오는 날·남은 날은 src/lib/anniversary.ts 하나로 (2월 29일은 평년에 2월 28일).
       오늘은 사용자 시간대의 날이고 자정을 넘기면 다시 셈한다 — 켜 둔 화면의 D-숫자가 어제에 머물지 않게 */
    const todayKey = useCurrentDayKey();
    const items: AnniversaryItem[] = anniversaries
        .map((a) => {
            const { date, diff } = nextAnniversary(a, new Date(`${todayKey}T00:00:00`));
            return { anniversary: a, date, diff, isToday: diff === 0 };
        })
        .sort((x, y) => x.diff - y.diff);
    // 오늘이 기념일이면 하루 한 번 갈래가 축하한다 (그 카드 자리에서)
    useAnniversaryFx(items.filter(i => i.isToday).map(i => i.anniversary.id));
    // 새로 넣은 카드는 들어오고 지운 카드는 제자리에서 빠진다 — Celestial·Maple 의 카드 격자(배치는 갈래 폴더라 모양 이름으로 찾는다).
    // 바다는 제 배치(OceanAnniversaryLayout)가 따로 한다 — 그 화면엔 이 이름이 없어 여기서는 아무 일도 없다
    useListMotion(() => document.querySelector(`${S.CardGrid}`), { exit: "auto" });

    /* 서식의 칸들 — 감싸는 서식(판·제목)은 갈래의 배치가 그린다 */
    const renderFields = (
        { title, month, day, icon }: AnniversaryDraft,
        change: (patch: Partial<AnniversaryDraft>) => void,
        isEdit: boolean,
    ) => (
        <>
            <S.IconRow>
                {ANNIVERSARY_ICONS.map(i => (
                    <S.IconChoice
                        key={i.key}
                        type="button"
                        title={t.anniversaryPage.iconLabels[i.key]}
                        $selected={resolveIconKey(icon) === i.key}
                        aria-pressed={resolveIconKey(icon) === i.key}
                        disabled={isEdit && editSaving}
                        onClick={() => change({ icon: i.key })}
                    >
                        <AnniversaryIcon name={i.key} size={17} />
                    </S.IconChoice>
                ))}
            </S.IconRow>
            <S.FormRow>
                <S.TitleInput
                    value={title}
                    onChange={e => change({ title: e.target.value })}
                    aria-label={t.anniversaryPage.nameLabel}
                    placeholder={t.anniversaryPage.namePlaceholder}
                    maxLength={40}
                    data-autofocus={isEdit || undefined}
                    disabled={isEdit && editSaving}
                />
                <S.DateField data-anniversary-date>
                    <AnnualDatePicker month={month} day={day} change={change} disabled={isEdit ? editSaving : pending} />
                </S.DateField>
                {!isEdit && <S.AddButton type="submit" disabled={!title.trim() || pending}>
                    <Plus size={14} />
                    {t.anniversaryPage.add}
                </S.AddButton>}
            </S.FormRow>
        </>
    );

    return (
        <>
            <Layout S={S} items={items} onEdit={handleEdit} onDelete={handleDelete} onSubmit={handleAdd}
                fields={renderFields(draft, patch => setDraft(current => ({ ...current, ...patch })), false)} />
            <BaseModal isOpen={editing !== null} onClose={closeEdit} maxWidth="520px" ariaLabel={t.anniversaryPage.editTitle}>
                {editing && (
                    <S.EditForm onSubmit={saveEdit} aria-busy={editSaving}>
                        <h2>{t.anniversaryPage.editTitle}</h2>
                        {renderFields(editing.draft, patch => setEditing(current =>
                            current && { ...current, draft: { ...current.draft, ...patch } }), true)}
                        {editError && <p role="alert">{t.alert.saveFailed}. {t.alert.retryLater}</p>}
                        <S.EditActions>
                            <S.AddButton type="button" disabled={editSaving} onClick={closeEdit}>{t.dialog.cancel}</S.AddButton>
                            <S.AddButton type="submit" disabled={editSaving || !editing.draft.title.trim()}>
                                {editSaving ? t.account.saving : t.account.save}
                            </S.AddButton>
                        </S.EditActions>
                    </S.EditForm>
                )}
            </BaseModal>
        </>
    );
}
