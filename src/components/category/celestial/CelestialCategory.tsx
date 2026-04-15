"use client";

import React from "react";
import * as S from "./styles";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import { CategoryThemeProps } from "../CategoryPage";

export default function CelestialCategory(props: CategoryThemeProps) {

    const {
        categories, selectedCategory, selectedCategoryId, setSelectedCategoryId,
        activeTab, setActiveTab, editName, setEditName, editColor, setEditColor,
        editDescription, setEditDescription, handleNameBlur, handleColorBlur,
        handleDescriptionBlur, handleNameKeyDown, handleDelete, categoryTodos,
        handleEditTodo, toggleTodo, deleteTodo, authFetch,
        openInviteModal, closeInviteModal, isInviteModalOpen, inviteEmail,
        setInviteEmail, handleInviteSubmit, inviteError,
        kickTarget, setKickTarget, closeKickModal, handleKickSubmit,
        setIsAddModalOpen
    } = props;

    return (
        <S.CategoryWrapper>
            <S.SidebarContainer>
                <div className="sidebar-header">
                    <h2>카테고리</h2>
                    <S.AddCategoryBtn onClick={() => setIsAddModalOpen(true)}>+</S.AddCategoryBtn>
                </div>
                <S.CategoryList>
                    {categories.map((cat) => (
                        <S.CategoryItem
                            key={cat.id}
                            $color={cat.color}
                            $isSelected={selectedCategoryId === cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                        >
                            <div className="color-indicator" />
                            <span>{cat.name}</span>
                        </S.CategoryItem>
                    ))}
                </S.CategoryList>
            </S.SidebarContainer>

            <S.ContentContainer>
                {selectedCategory ? (
                    <S.DetailInfo>
                        <S.CategoryTitleWrapper $color={editColor}>
                            <div className="color-picker-container">
                                <input
                                    type="color"
                                    className="color-input"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    onBlur={handleColorBlur}
                                />
                            </div>
                            <input
                                value={editName}
                                className="title-input"
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleNameBlur}
                                onKeyDown={handleNameKeyDown}
                                placeholder="카테고리 이름을 입력하세요"
                            />
                        </S.CategoryTitleWrapper>

                        <S.DetailHeader $activeTab={activeTab}>
                            <button onClick={() => setActiveTab('info')} className="info-tab">상세 정보</button>
                            <button onClick={() => setActiveTab('todos')} className="todo-tab">할 일 목록</button>
                        </S.DetailHeader>

                        {activeTab === 'info' ? (
                            <S.InfoContainer>
                                <S.PropertiesCard>
                                    <S.PropertyRow>
                                        <div className="prop-label">생성자</div>
                                        <div className="prop-value">{selectedCategory.creatorName || '알 수 없음'}</div>
                                    </S.PropertyRow>
                                    <S.PropertyRow>
                                        <div className="prop-label">설명</div>
                                        <div className="prop-value">
                                            <textarea
                                                className="desc-textarea"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                onBlur={handleDescriptionBlur}
                                                placeholder="설명을 추가하여 이 카테고리의 목적을 알려주세요."
                                                rows={2}
                                            />
                                        </div>
                                    </S.PropertyRow>
                                </S.PropertiesCard>

                                <S.ParticipantSection>
                                    <div className="header">
                                        <h3>멤버 목록</h3>
                                        <SecondaryButton $width={100} $height={32} onClick={openInviteModal}>+ 초대하기</SecondaryButton>
                                    </div>

                                    {selectedCategory.participants && selectedCategory.participants.length > 0 ? (
                                        <S.ParticipantTable>
                                            <S.TableHeader>
                                                <div className="col-name">이름</div>
                                                <div className="col-email">이메일</div>
                                                <div className="col-action"></div>
                                            </S.TableHeader>
                                            <S.TableBody>
                                                {selectedCategory.participants.map((participant: any) => (
                                                    <S.TableRow key={participant.id}>
                                                        <div className="col-name">
                                                            <div className="avatar">{participant.name.charAt(0)}</div>
                                                            <span>{participant.name}</span>
                                                        </div>
                                                        <div className="col-email">{participant.email}</div>
                                                        <div className="col-action">
                                                            {participant.id !== selectedCategory.creatorId && (
                                                                <button
                                                                    type="button"
                                                                    className="remove-btn"
                                                                    onClick={() => setKickTarget({id: participant.id, name: participant.name})}
                                                                >
                                                                    추방
                                                                </button>
                                                            )}
                                                        </div>
                                                    </S.TableRow>
                                                ))}
                                            </S.TableBody>
                                        </S.ParticipantTable>
                                    ) : (
                                        <div className="empty-state">
                                            <p>참여 중인 멤버가 없습니다.</p>
                                        </div>
                                    )}
                                </S.ParticipantSection>

                                <S.ActionFooter>
                                    <SecondaryButton $height={36} $width={140} $variant="danger" onClick={() => handleDelete(selectedCategory.id)}>
                                        이 카테고리 삭제
                                    </SecondaryButton>
                                </S.ActionFooter>
                            </S.InfoContainer>
                        ) : (
                            <S.TodoListContainer>
                                <div className="header">
                                    <h3>할 일 목록 ({categoryTodos.length})</h3>
                                </div>

                                {categoryTodos.length > 0 ? (
                                    <S.TodoGrid>
                                        {categoryTodos.map(todo => (
                                            <S.TodoCard key={todo.id} $isDone={todo.check === 'done'} $color={selectedCategory.color}>
                                                <div className="todo-info" onClick={() => handleEditTodo(todo)}>
                                                    <span className="title">{todo.title}</span>
                                                    <span className="date">
                                                        {todo.startAt ? new Date(todo.startAt as string).toLocaleDateString() : '날짜 없음'}
                                                        {todo.repeat > 0 && ` (↻ ${todo.repeat}일마다 반복)`}
                                                    </span>
                                                </div>
                                                <div className="todo-actions">
                                                    <SecondaryButton
                                                        $width={60}
                                                        $height={32}
                                                        $variant={todo.check === 'done' ? 'default' : 'primary'}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTodo(authFetch, todo.id);
                                                        }}
                                                    >
                                                        {todo.check === 'done' ? '취소' : '완료'}
                                                    </SecondaryButton>
                                                    <SecondaryButton
                                                        $width={60}
                                                        $height={32}
                                                        $variant="danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("정말 이 할 일을 삭제하시겠습니까?")) {
                                                                deleteTodo(authFetch, todo.id);
                                                            }
                                                        }}
                                                    >
                                                        삭제
                                                    </SecondaryButton>
                                                </div>
                                            </S.TodoCard>
                                        ))}
                                    </S.TodoGrid>
                                ) : (
                                    <S.ParticipantSection>
                                        <div className="empty-state">
                                            <p>이 카테고리에 등록된 할 일이 없습니다.</p>
                                        </div>
                                    </S.ParticipantSection>
                                )}
                            </S.TodoListContainer>
                        )}
                    </S.DetailInfo>
                ) : (
                    <S.EmptyStateContainer>
                        <p>왼쪽 목록에서 카테고리를 선택하거나 새 카테고리를 추가해보세요.</p>
                    </S.EmptyStateContainer>
                )}
            </S.ContentContainer>

            {isInviteModalOpen && (
                <S.ModalOverlay onClick={closeInviteModal}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>팀원 초대하기</h3>
                        <p>초대할 멤버의 이메일을 정확히 입력해주세요.</p>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInviteSubmit()}
                            autoFocus
                        />
                        {inviteError && <InlineError>{inviteError}</InlineError>}
                        <div className="modal-actions">
                            <SecondaryButton $width={80} $height={36} onClick={closeInviteModal}>취소</SecondaryButton>
                            <SecondaryButton $width={80} $height={36} $variant="primary" onClick={handleInviteSubmit}>초대</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}

            {kickTarget && (
                <S.ModalOverlay onClick={closeKickModal}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>멤버 추방</h3>
                        <p>정말 <strong>{kickTarget.name}</strong>님을 이 카테고리에서 추방하시겠습니까?</p>
                        <div className="modal-actions">
                            <SecondaryButton $width={80} $height={36} onClick={closeKickModal}>취소</SecondaryButton>
                            <SecondaryButton $width={80} $height={36} $variant="danger" onClick={handleKickSubmit}>추방하기</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </S.CategoryWrapper>
    );
}