"use client";

import * as React from "react";
import { TodoModalThemeProps } from "../TodoModal";
import * as S from "./CelestialTodoModal.styles";
import { X, ChevronDown, ChevronUp, MapPin, Repeat, AlignLeft, Clock } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";

export default function CelestialTodoModal({
                                               isOpen, onClose, todo, categories,
                                               title, setTitle, categoryId, setCategoryId, memo, setMemo,
                                               startAt, setStartAt, endAt, setEndAt, isAllDay, setIsAllDay, location, setLocation,
                                               repeat, setRepeat, repeatEndType, setRepeatEndType, repeatEndDate, setRepeatEndDate, repeatCount, setRepeatCount,
                                               isCategoryOpen, setIsCategoryOpen, isRepeatEndOpen, setIsRepeatEndOpen,
                                               selectedCategory, repeatEndOptions, selectedRepeatEndLabel,
                                               handleDateChange, handleSubmit, handleDelete
                                           }: TodoModalThemeProps) {


    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="420px">
            <S.FormWrapper onSubmit={handleSubmit}>
                <S.Header>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={todo?.title || "새로운 할 일"}
                        required
                        className="title-input"
                        autoFocus
                    />
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={22} />
                    </button>
                </S.Header>

                <S.ScrollBody>
                    <S.DropdownContainer onClick={(e) => e.stopPropagation()} style={{ marginBottom: '8px', padding: '0 8px' }}>
                        <S.DropdownHeader onClick={() => {
                            setIsCategoryOpen(!isCategoryOpen);
                            setIsRepeatEndOpen(false);
                        }}>
                            <div className="content-wrapper">
                                <S.ColorDot $color={selectedCategory?.color || "#e0e0e0"} />
                                <span className={!selectedCategory ? "placeholder" : ""}>
                                    {selectedCategory ? selectedCategory.name : "카테고리 선택"}
                                </span>
                            </div>
                            {isCategoryOpen ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
                        </S.DropdownHeader>

                        {isCategoryOpen && (
                            <S.DropdownList>
                                {categories.map((cat) => (
                                    <S.DropdownItem
                                        key={cat.id}
                                        onClick={() => {
                                            setCategoryId(cat.id);
                                            setIsCategoryOpen(false);
                                        }}
                                    >
                                        <S.ColorDot $color={cat.color} />
                                        <span>{cat.name}</span>
                                    </S.DropdownItem>
                                ))}
                            </S.DropdownList>
                        )}
                    </S.DropdownContainer>

                    <S.FieldRow>
                        <label><Clock size={16} /> 하루 종일</label>
                        <S.ToggleSwitch>
                            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
                            <span className="slider"></span>
                        </S.ToggleSwitch>
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>시작 시간</label>
                        <input
                            type={isAllDay ? "date" : "datetime-local"}
                            value={isAllDay ? startAt.slice(0, 10) : startAt}
                            onChange={(e) => handleDateChange(setStartAt, startAt, e.target.value)}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>종료 시간</label>
                        <input
                            type={isAllDay ? "date" : "datetime-local"}
                            value={isAllDay ? endAt.slice(0, 10) : endAt}
                            onChange={(e) => handleDateChange(setEndAt, endAt, e.target.value)}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <label><MapPin size={16} /> 장소</label>
                        <input
                            type="text"
                            placeholder="장소를 입력하세요"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </S.FieldRow>

                    <S.RepeatRow>
                        <div className="repeat-header">
                            <label><Repeat size={16} /> 반복 주기</label>
                            <div className="repeat-input-group">
                                <input
                                    type="number"
                                    min="0"
                                    value={repeat === 0 ? "" : repeat}
                                    onChange={(e) => setRepeat(Number(e.target.value))}
                                    placeholder="0"
                                />
                                <span>일마다</span>
                            </div>
                        </div>

                        {repeat > 0 && (
                            <S.RepeatConditionBox>
                                <div className="condition-title">반복 종료 조건</div>

                                <S.DropdownContainer onClick={(e) => e.stopPropagation()}>
                                    <S.DropdownHeader onClick={() => {
                                        setIsRepeatEndOpen(!isRepeatEndOpen);
                                        setIsCategoryOpen(false);
                                    }}>
                                        <div className="content-wrapper">
                                            <span>{selectedRepeatEndLabel}</span>
                                        </div>
                                        {isRepeatEndOpen ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
                                    </S.DropdownHeader>

                                    {isRepeatEndOpen && (
                                        <S.DropdownList>
                                            {repeatEndOptions.map(opt => (
                                                <S.DropdownItem
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setRepeatEndType(opt.value as any);
                                                        setIsRepeatEndOpen(false);
                                                    }}
                                                >
                                                    {opt.label}
                                                </S.DropdownItem>
                                            ))}
                                        </S.DropdownList>
                                    )}
                                </S.DropdownContainer>

                                {repeatEndType === 'until' && (
                                    <input
                                        type="date"
                                        value={repeatEndDate}
                                        onChange={(e) => setRepeatEndDate(e.target.value)}
                                        required
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
                                            placeholder="횟수"
                                            required
                                        />
                                        <span>회 반복 후 종료</span>
                                    </div>
                                )}
                            </S.RepeatConditionBox>
                        )}
                    </S.RepeatRow>

                    <S.MemoRow>
                        <label><AlignLeft size={16} /> 메모</label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="할 일에 대한 설명이나 메모를 남겨보세요."
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    {todo && (
                        <SecondaryButton type="button" onClick={handleDelete} $width="70px" $height="36px" $variant="danger">
                            삭제
                        </SecondaryButton>
                    )}
                    <SecondaryButton type="submit" $width="90px" $height="36px" $variant="primary">
                        {todo ? "수정하기" : "저장하기"}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}