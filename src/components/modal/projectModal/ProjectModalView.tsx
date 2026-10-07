"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import Dropdown from '@/components/dropdown/Dropdown';
import { ProjectModalProps } from "./ProjectModal";
import { UserType } from "@/store/useProjectStore";
import { CategoryType } from "@/store/useCategoryStore";
import { X, AlignLeft, Folder, Users, Calendar } from 'lucide-react';
import DateTimePicker from "@/components/input/dateTimePicker/DateTimePicker";
import { toLocalInput, fromLocalInput, todayKey } from "@/lib/localTime";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialModal.styles";
import * as MapleS from "./maple/MapleModal.styles";
import * as OceanS from './ocean/OceanModal.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

export default function ProjectModalView({
                                                  isOpen, mode, data, categories, modalCategoryParticipants,
                                                  onClose, onSave, setData, toggleParticipant, pending = false, error
                                              }: ProjectModalProps) {
    const S = usePickTheme(STYLES);
    const t = useT();
    const f = t.form;

    /* 기간 — 날짜만 (시작일 0시 ~ 마감일 23:59). 기간이 있어야 달력에 선다.
       예전에는 이 칸이 없어서, 새 프로젝트가 달력에 끝내 나타나지 않았다. */
    const scheduled = !!(data.startAt || data.endAt);
    const startKey = toLocalInput(data.startAt ?? data.endAt).slice(0, 10);
    const endKey = toLocalInput(data.endAt ?? data.startAt).slice(0, 10);
    const setScheduled = (on: boolean) => {
        const key = todayKey();
        setData(on
            ? { ...data, startAt: fromLocalInput(key, "00:00"), endAt: fromLocalInput(key, "23:59") }
            : { ...data, startAt: null, endAt: null });
    };
    const setRange = (start: string, end: string) =>
        setData({ ...data, startAt: fromLocalInput(start.slice(0, 10), "00:00"), endAt: fromLocalInput(end.slice(0, 10), "23:59") });
    const setStart = (value: string) => {
        const start = value.slice(0, 10);
        setRange(start, endKey && endKey >= start ? endKey : start);
    };
    const setEnd = (value: string) => {
        const end = value.slice(0, 10);
        setRange(startKey && startKey <= end ? startKey : end, end);
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px" ariaLabel={data.title || f.projectName}>
            <S.FormWrapper onSubmit={onSave} aria-busy={pending}>
                <S.Header>
                    <S.TitleInput
                        aria-label={f.projectName}
                        disabled={pending}
                        value={data.title || ''}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder={mode === 'add' ? f.newProjectName : f.projectName}
                        required
                        autoFocus
                    />
                    <S.CloseButton type="button" onClick={onClose} disabled={pending} aria-label={t.interaction.dismiss}>
                        <X size={22} />
                    </S.CloseButton>
                </S.Header>

                <S.ScrollBody disabled={pending}>
                    <S.FieldRow style={{ borderBottom: 'none' }}>
                        <S.FieldLabel><Folder size={16} /> {t.challenge.category}</S.FieldLabel>
                        <div style={{ width: '180px' }}>
                            <Dropdown
                                value={data.categoryId || ''}
                                onChange={(val: string) => setData({ ...data, categoryId: val })}
                                placeholder={f.choose}
                                options={categories.map((c: CategoryType) => ({
                                    label: c.name,
                                    value: c.id,
                                    color: c.color
                                }))}
                            />
                        </div>
                    </S.FieldRow>

                    <S.FieldRow>
                        <S.FieldLabel><Calendar size={16} /> {t.project.period}</S.FieldLabel>
                        <S.ToggleSwitch>
                            <input type="checkbox" aria-label={t.project.period} checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />
                            <span className="slider" />
                        </S.ToggleSwitch>
                    </S.FieldRow>

                    {scheduled && (
                        <>
                            <S.FieldRow>
                                <S.FieldLabel>{f.startDate}</S.FieldLabel>
                                <S.PickerCell>
                                    <DateTimePicker mode="date" value={startKey} onChange={setStart}
                                        range={{ start: startKey, end: endKey, edge: "start", onRangeChange: setRange }} />
                                </S.PickerCell>
                            </S.FieldRow>
                            <S.FieldRow>
                                <S.FieldLabel>{f.endDate}</S.FieldLabel>
                                <S.PickerCell>
                                    <DateTimePicker mode="date" value={endKey} onChange={setEnd}
                                        range={{ start: startKey, end: endKey, edge: "end", onRangeChange: setRange }} />
                                </S.PickerCell>
                            </S.FieldRow>
                        </>
                    )}

                    {data.categoryId && (
                        <S.ParticipantRow>
                            <S.FieldLabel><Users size={16} /> {f.participants}</S.FieldLabel>
                            <S.ParticipantPicker>
                                {modalCategoryParticipants.map((user: UserType) => (
                                    <S.ParticipantItem
                                        key={user.id}
                                        $selected={data.assignees?.some((a: UserType) => a.id === user.id) || false}
                                        aria-pressed={data.assignees?.some(a => a.id === user.id) || false}
                                        onClick={() => toggleParticipant(user)}
                                    >
                                        <S.ParticipantName>{user.name}</S.ParticipantName>
                                    </S.ParticipantItem>
                                ))}
                            </S.ParticipantPicker>
                        </S.ParticipantRow>
                    )}

                    <S.MemoRow>
                        <S.FieldLabel><AlignLeft size={16} /> {f.description}</S.FieldLabel>
                        <S.MemoTextArea
                            aria-label={f.description}
                            value={data.description || ''}
                            onChange={e => setData({ ...data, description: e.target.value })}
                            placeholder={f.projectDescPlaceholder}
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                {error && <S.ErrorMessage role="alert">{error}</S.ErrorMessage>}
                <S.Footer>
                    <SecondaryButton type="button" onClick={onClose} disabled={pending} $width="70px" $height="36px" $variant="default">
                        {f.cancel}
                    </SecondaryButton>
                    <SecondaryButton type="submit" disabled={pending} $width="110px" $height="36px" $variant="primary">
                        {pending ? t.account.saving : f.save}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </BaseModal>
    );
}
