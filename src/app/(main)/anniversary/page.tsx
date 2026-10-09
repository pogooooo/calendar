"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import useAnniversaryStore, { AnniversaryType } from "@/store/useAnniversaryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";
import Select from "@/components/input/select/Select";
import AnniversaryIcon, { ANNIVERSARY_ICONS } from "@/assets/AnniversaryIcon";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialAnniversary.styles";
import * as MapleS from "./maple/MapleAnniversary.styles";
import * as OceanS from './ocean/OceanAnniversary.styles';
import CelestialAnniversaryLayout from "./celestial/CelestialAnniversaryLayout";
import OceanAnniversaryLayout from "./ocean/OceanAnniversaryLayout";
import type { AnniversaryItem } from "./AnniversaryLayout.types";
import useAnniversaryFx from "@/components/fx/useAnniversaryFx";
import { nextAnniversary } from "@/lib/anniversary";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { useListMotion } from "@/hooks/useMotion";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

/** 갈래마다 제 배치 — Maple 은 Celestial 의 배치(서식 | 카드 격자)에 제 모양을 입히고, 바다는 가장 가까운 날의 큰 숫자와 물때 줄 */
const LAYOUTS = { celestial: CelestialAnniversaryLayout, maple: CelestialAnniversaryLayout, ocean: OceanAnniversaryLayout };

// 윤년이 아닌 해도 있으므로 2월은 29일까지 허용한다
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default function AnniversaryPage() {
    const S = usePickTheme(STYLES);
    const Layout = usePickTheme(LAYOUTS);
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();
    const { anniversaries, fetchAnniversaries, addAnniversary, deleteAnniversary } = useAnniversaryStore();

    const [title, setTitle] = React.useState("");
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [day, setDay] = React.useState(new Date().getDate());
    const [icon, setIcon] = React.useState(ANNIVERSARY_ICONS[0].key);
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        fetchAnniversaries(authFetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || pending) return;
        setPending(true);
        const error = await addAnniversary(authFetch, { title: title.trim(), month, day, icon });
        setPending(false);
        if (error) { await dialog.notify({ title: t.alert.addFailed, message: error }); return; }
        setTitle("");
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
    const fields = (
        <>
            <S.IconRow>
                {ANNIVERSARY_ICONS.map(i => (
                    <S.IconChoice
                        key={i.key}
                        type="button"
                        title={t.anniversaryPage.iconLabels[i.key]}
                        $selected={icon === i.key}
                        onClick={() => setIcon(i.key)}
                    >
                        <AnniversaryIcon name={i.key} size={17} />
                    </S.IconChoice>
                ))}
            </S.IconRow>
            <S.FormRow>
                <S.TitleInput
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t.anniversaryPage.namePlaceholder}
                    maxLength={40}
                />
                <S.DateField>
                    <Select
                        value={String(month)}
                        onChange={v => {
                            const m = Number(v);
                            setMonth(m);
                            // 2월로 바꿨는데 31일이 선택돼 있으면 존재하지 않는 날짜가 된다
                            if (day > DAYS_IN_MONTH[m - 1]) setDay(DAYS_IN_MONTH[m - 1]);
                        }}
                        options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: t.anniversaryPage.monthOption(i + 1) }))}
                        ariaLabel={t.anniversaryPage.monthAria}
                    />
                </S.DateField>
                <S.DateField>
                    <Select
                        value={String(day)}
                        onChange={v => setDay(Number(v))}
                        options={Array.from({ length: DAYS_IN_MONTH[month - 1] }, (_, i) => ({ value: String(i + 1), label: t.anniversaryPage.dayOption(i + 1) }))}
                        ariaLabel={t.anniversaryPage.dayAria}
                    />
                </S.DateField>
                <S.AddButton type="submit" disabled={!title.trim() || pending}>
                    <Plus size={14} />
                    {t.anniversaryPage.add}
                </S.AddButton>
            </S.FormRow>
        </>
    );

    return <Layout S={S} items={items} onDelete={handleDelete} onSubmit={handleAdd} fields={fields} />;
}
