"use client";

import * as GemS from "./gem/GemTodoModal.styles";
import * as React from "react";
import { TodoModalThemeProps } from "./TodoModal";
import { X, MapPin, Repeat, AlignLeft, Clock, FolderKanban } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import DateTimePicker from "@/components/input/dateTimePicker/DateTimePicker";
import Select from "@/components/input/select/Select";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialTodoModal.styles";
import * as MapleS from "./maple/MapleTodoModal.styles";
import * as OceanS from './ocean/OceanTodoModal.styles';
import useMobilePresentation from '@/hooks/useMobilePresentation';
import useSettingStore from '@/store/useSettingStore';
import { MobileFormDetails } from './MobileFormDetails.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export default function TodoModalView({
    isOpen, onClose, todo, categories,
    title, setTitle, categoryId, setCategoryId, memo, setMemo,
    startAt, setStartAt, endAt, setEndAt, isAllDay, setIsAllDay, location, setLocation,
    repeat, setRepeat, repeatEndType, setRepeatEndType, repeatEndDate, setRepeatEndDate, repeatCount, setRepeatCount,
    repeatEndOptions, projectId, setProjectId, projectOptions,
    handleDateChange, handleSubmit, handleDelete, isSaving, submitError
}: TodoModalThemeProps) {
    const S = usePickTheme(STYLES);
    const t = useT();
    const mobile = useMobilePresentation();
    const english = useSettingStore(s=>s.locale)==='en';
    const projectField = !todo && projectOptions.length > 0 ? (
        <S.FieldRow>
            <label><FolderKanban size={16} /> {t.project.inProject}</label>
            <div style={{ flex: 1, minWidth: 0, maxWidth:mobile?undefined:'220px' }}>
                <Select value={projectId} onChange={setProjectId}
                    options={[{ value: "", label: t.project.noProject }, ...projectOptions]}
                    ariaLabel={t.project.inProject} />
            </div>
        </S.FieldRow>
    ) : null;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="420px" ariaLabel={todo ? t.todo.update : t.todo.newTodo}>
            <S.FormWrapper onSubmit={handleSubmit} aria-busy={isSaving} data-todo-form data-mobile-todo={mobile || undefined}>
                <MobileFormDetails />
                <S.Header>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={todo?.title || t.todo.newTodo}
                        aria-label={todo ? t.todo.update : t.todo.newTodo}
                        data-autofocus
                        required
                        readOnly={isSaving}
                        className="title-input"
                    />
                    <button type="button" className="close-btn" onClick={onClose} aria-label={t.widgetShell.close}>
                        <X size={22} />
                    </button>
                </S.Header>

                <S.ScrollBody inert={isSaving || undefined}>
                    <div style={{ marginBottom: '8px', padding: '0 8px' }}>
                        <Select
                            value={categoryId}
                            onChange={setCategoryId}
                            options={categories.map(c => ({ value: c.id, label: c.name, color: c.color }))}
                            placeholder={t.todo.categorySelect}
                            ariaLabel={t.todo.categorySelect}
                        />
                    </div>

                    {!mobile && projectField}

                    <S.FieldRow>
                        <label><Clock size={16} /> {t.todo.allDay}</label>
                        <S.ToggleSwitch>
                            <input type="checkbox" aria-label={t.todo.allDay} checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
                            <span className="slider"></span>
                        </S.ToggleSwitch>
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>{t.todo.startTime}</label>
                        <DateTimePicker
                            ariaLabel={t.todo.startTime}
                            mode={isAllDay ? "date" : "datetime"}
                            value={isAllDay ? startAt.slice(0, 10) : startAt}
                            onChange={(v) => handleDateChange(setStartAt, startAt, v)}
                            range={{
                                start: startAt, end: endAt, edge: "start",
                                onRangeChange: (s, e) => {
                                    handleDateChange(setStartAt, startAt, s);
                                    handleDateChange(setEndAt, endAt, e);
                                },
                            }}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>{t.todo.endTime}</label>
                        <DateTimePicker
                            ariaLabel={t.todo.endTime}
                            mode={isAllDay ? "date" : "datetime"}
                            value={isAllDay ? endAt.slice(0, 10) : endAt}
                            onChange={(v) => handleDateChange(setEndAt, endAt, v)}
                            range={{
                                start: startAt, end: endAt, edge: "end",
                                onRangeChange: (s, e) => {
                                    handleDateChange(setStartAt, startAt, s);
                                    handleDateChange(setEndAt, endAt, e);
                                },
                            }}
                        />
                    </S.FieldRow>

                    <details className="todo-extra" open={mobile ? undefined : true}>
                    <summary hidden={!mobile}>{english ? 'More options' : '상세 설정'}<span>{english ? 'Project · location · repeat · notes' : '프로젝트 · 장소 · 반복 · 메모'}</span></summary>
                    {mobile && projectField}
                    {projectId ? (
                        <S.FieldRow>
                            <label style={{ minWidth: 0, fontSize: '0.8rem' }}>{t.project.projectTaskHint}</label>
                        </S.FieldRow>
                    ) : (<>
                    <S.FieldRow>
                        <label><MapPin size={16} /> {t.todo.location}</label>
                        <input
                            type="text"
                            aria-label={t.todo.location}
                            placeholder={t.todo.locationPlaceholder}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </S.FieldRow>

                    <S.RepeatRow>
                        <div className="repeat-header">
                            <label><Repeat size={16} /> {t.todo.repeatCycle}</label>
                            <div className="repeat-input-group">
                                <input
                                    type="number"
                                    aria-label={t.todo.repeatCycle}
                                    min="0"
                                    value={repeat === 0 ? "" : repeat}
                                    onChange={(e) => setRepeat(Number(e.target.value))}
                                    placeholder="0"
                                />
                                <span>{t.todo.perNDays}</span>
                            </div>
                        </div>

                        {repeat > 0 && (
                            <S.RepeatConditionBox>
                                <div className="condition-title">{t.todo.repeatEndCond}</div>

                                <Select
                                    value={repeatEndType}
                                    onChange={(v) => setRepeatEndType(v as 'never' | 'until' | 'count')}
                                    options={repeatEndOptions.map(o => ({ value: o.value, label: o.label }))}
                                    ariaLabel={t.todo.repeatEndCond}
                                />

                                {repeatEndType === 'until' && (
                                    <DateTimePicker
                                        mode="date"
                                        value={repeatEndDate}
                                        onChange={setRepeatEndDate}
                                    />
                                )}

                                {repeatEndType === 'count' && (
                                    <div className="count-input-group">
                                        <input
                                            type="number"
                                            min="1"
                                            max="999"
                                            value={repeatCount}
                                            onChange={(e) => setRepeatCount(Number(e.target.value))}
                                            placeholder={t.todo.countPlaceholder}
                                            required
                                        />
                                        <span>{t.todo.timesRepeat}</span>
                                    </div>
                                )}
                            </S.RepeatConditionBox>
                        )}
                    </S.RepeatRow>
                    </>)}

                    <S.MemoRow>
                        <label><AlignLeft size={16} /> {t.todo.notes}</label>
                        <textarea
                            aria-label={t.todo.notes}
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder={t.todo.notesPlaceholder}
                        />
                    </S.MemoRow>
                    </details>
                </S.ScrollBody>

                <S.Footer className="todo-footer">
                    <div className="todo-save-state" role={submitError ? 'alert' : 'status'}>{submitError || (isSaving ? t.account.saving : '')}</div>
                    {todo && (
                        <SecondaryButton type="button" onClick={handleDelete} $width="70px" $height="36px" $variant="danger">
                            {t.todo.delete}
                        </SecondaryButton>
                    )}
                    <SecondaryButton type="submit" disabled={isSaving} $width="110px" $height="44px" $variant="primary">
                        {isSaving ? t.account.saving : todo ? t.todo.update : t.todo.save}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </BaseModal>
    );
}
