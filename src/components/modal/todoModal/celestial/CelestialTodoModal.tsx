"use client";

import * as React from "react";
import { TodoModalThemeProps } from "../TodoModal";
import * as S from "./CelestialTodoModal.styles";
import { X, MapPin, Repeat, AlignLeft, Clock } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import CelestialDateTimePicker from "@/components/input/dateTimePicker/CelestialDateTimePicker";
import CelestialSelect from "@/components/input/select/CelestialSelect";
import { useT } from "@/i18n/useT";

export default function CelestialTodoModal({
    isOpen, onClose, todo, categories,
    title, setTitle, categoryId, setCategoryId, memo, setMemo,
    startAt, setStartAt, endAt, setEndAt, isAllDay, setIsAllDay, location, setLocation,
    repeat, setRepeat, repeatEndType, setRepeatEndType, repeatEndDate, setRepeatEndDate, repeatCount, setRepeatCount,
    repeatEndOptions,
    handleDateChange, handleSubmit, handleDelete
}: TodoModalThemeProps) {
    const t = useT();

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="420px">
            <S.FormWrapper onSubmit={handleSubmit}>
                <S.Header>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={todo?.title || t.todo.newTodo}
                        required
                        className="title-input"
                        autoFocus
                    />
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={22} />
                    </button>
                </S.Header>

                <S.ScrollBody>
                    <div style={{ marginBottom: '8px', padding: '0 8px' }}>
                        <CelestialSelect
                            value={categoryId}
                            onChange={setCategoryId}
                            options={categories.map(c => ({ value: c.id, label: c.name, color: c.color }))}
                            placeholder={t.todo.categorySelect}
                            ariaLabel={t.todo.categorySelect}
                        />
                    </div>

                    <S.FieldRow>
                        <label><Clock size={16} /> {t.todo.allDay}</label>
                        <S.ToggleSwitch>
                            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
                            <span className="slider"></span>
                        </S.ToggleSwitch>
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>{t.todo.startTime}</label>
                        <CelestialDateTimePicker
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
                        <CelestialDateTimePicker
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

                    <S.FieldRow>
                        <label><MapPin size={16} /> {t.todo.location}</label>
                        <input
                            type="text"
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

                                <CelestialSelect
                                    value={repeatEndType}
                                    onChange={(v) => setRepeatEndType(v as 'never' | 'until' | 'count')}
                                    options={repeatEndOptions.map(o => ({ value: o.value, label: o.label }))}
                                    ariaLabel={t.todo.repeatEndCond}
                                />

                                {repeatEndType === 'until' && (
                                    <CelestialDateTimePicker
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

                    <S.MemoRow>
                        <label><AlignLeft size={16} /> {t.todo.notes}</label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder={t.todo.notesPlaceholder}
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    {todo && (
                        <SecondaryButton type="button" onClick={handleDelete} $width="70px" $height="36px" $variant="danger">
                            {t.todo.delete}
                        </SecondaryButton>
                    )}
                    <SecondaryButton type="submit" $width="90px" $height="36px" $variant="primary">
                        {todo ? t.todo.update : t.todo.save}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}
