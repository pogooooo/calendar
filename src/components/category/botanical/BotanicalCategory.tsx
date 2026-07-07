"use client";

import React from "react";
import * as S from "./styles";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import { CategoryThemeProps } from "../CategoryPage";
import { useT } from "@/i18n/useT";

export default function BotanicalCategory(props: CategoryThemeProps) {
    const t = useT();

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
                    <h2>{t.category.title}</h2>
                    <S.AddCategoryBtn onClick={() => setIsAddModalOpen(true)}>{t.category.addCategory}</S.AddCategoryBtn>
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
                            <span className="cat-name">{cat.name}</span>
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
                                placeholder={t.category.namePlaceholder}
                            />
                        </S.CategoryTitleWrapper>

                        <S.DetailHeader $activeTab={activeTab}>
                            <button onClick={() => setActiveTab('info')} className="info-tab">{t.category.infoTab}</button>
                            <button onClick={() => setActiveTab('todos')} className="todo-tab">{t.category.todosTab}</button>
                        </S.DetailHeader>

                        {activeTab === 'info' ? (
                            <S.InfoContainer>
                                <S.PropertiesCard>
                                    <S.PropertyRow>
                                        <div className="prop-label">{t.category.creator}</div>
                                        <div className="prop-value">{selectedCategory.creatorName || t.category.unknown}</div>
                                    </S.PropertyRow>
                                    <S.PropertyRow>
                                        <div className="prop-label">{t.category.description}</div>
                                        <div className="prop-value">
                                            <textarea
                                                className="desc-textarea"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                onBlur={handleDescriptionBlur}
                                                placeholder={t.category.descriptionPlaceholder}
                                                rows={3}
                                            />
                                        </div>
                                    </S.PropertyRow>
                                </S.PropertiesCard>

                                <S.ParticipantSection>
                                    <div className="header">
                                        <h3>{t.category.members}</h3>
                                        <SecondaryButton $width={90} $height={28} onClick={openInviteModal} style={{ fontSize: '0.8rem' }}>{t.category.invite}</SecondaryButton>
                                    </div>

                                    {selectedCategory.participants && selectedCategory.participants.length > 0 ? (
                                        <S.ParticipantTable>
                                            <S.TableHeader>
                                                <div className="col-name">{t.account.name}</div>
                                                <div className="col-email">{t.account.email}</div>
                                                <div className="col-action"></div>
                                            </S.TableHeader>
                                            <S.TableBody>
                                                {selectedCategory.participants.map((participant: { id: string; name: string; email: string }) => (
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
                                                                    {t.category.kick}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </S.TableRow>
                                                ))}
                                            </S.TableBody>
                                        </S.ParticipantTable>
                                    ) : (
                                        <div className="empty-state">
                                            <p>{t.category.noMembers}</p>
                                        </div>
                                    )}
                                </S.ParticipantSection>

                                <S.ActionFooter>
                                    <SecondaryButton $height={32} $width={140} $variant="danger" onClick={() => handleDelete(selectedCategory.id)}>
                                        {t.category.deleteCategory}
                                    </SecondaryButton>
                                </S.ActionFooter>
                            </S.InfoContainer>
                        ) : (
                            <S.TodoListContainer>
                                <div className="header">
                                    <h3>{t.category.todosTab} <span>({categoryTodos.length})</span></h3>
                                </div>

                                {categoryTodos.length > 0 ? (
                                    <S.TodoGrid>
                                        {categoryTodos.map(todo => {
                                            const todayStr = new Date().toISOString().split('T')[0];
                                            const isDone = (todo.completions ?? []).some(c =>
                                                new Date(c.targetDate).toISOString().split('T')[0] === todayStr
                                            );
                                            return (
                                                <S.TodoCard key={todo.id} $isDone={isDone} onClick={() => handleEditTodo(todo)}>
                                                    <button
                                                        className="check-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTodo(authFetch, todo.id, new Date().toISOString());
                                                        }}
                                                    >
                                                        {isDone && '✓'}
                                                    </button>

                                                    <div className="todo-info">
                                                        <span className="title">{todo.title}</span>
                                                        <span className="date">
                                                            {todo.startAt ? new Date(todo.startAt as string).toLocaleDateString() : t.category.noDate}
                                                            {todo.repeat > 0 && ` (↻ ${todo.repeat}${t.todo.perNDays})`}
                                                        </span>
                                                    </div>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(t.category.deleteConfirm)) {
                                                                deleteTodo(authFetch, todo.id);
                                                            }
                                                        }}
                                                    >
                                                        {t.todo.delete}
                                                    </button>
                                                </S.TodoCard>
                                            );
                                        })}
                                    </S.TodoGrid>
                                ) : (
                                    <S.ParticipantSection>
                                        <div className="empty-state">
                                            <p>{t.category.noTodos}</p>
                                        </div>
                                    </S.ParticipantSection>
                                )}
                            </S.TodoListContainer>
                        )}
                    </S.DetailInfo>
                ) : (
                    <S.EmptyStateContainer>
                        <p>{t.category.selectOrAdd}</p>
                    </S.EmptyStateContainer>
                )}
            </S.ContentContainer>

            {isInviteModalOpen && (
                <S.ModalOverlay onClick={closeInviteModal}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t.category.inviteTitle}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{t.category.inviteHint}</p>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInviteSubmit()}
                                autoFocus
                            />
                            {inviteError && <InlineError>{inviteError}</InlineError>}
                        </div>
                        <div className="modal-actions">
                            <SecondaryButton $width={70} $height={32} onClick={closeInviteModal}>{t.category.cancel}</SecondaryButton>
                            <SecondaryButton $width={70} $height={32} $variant="primary" onClick={handleInviteSubmit}>{t.category.invite}</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}

            {kickTarget && (
                <S.ModalOverlay onClick={closeKickModal}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t.category.kickTitle}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{t.category.kickConfirm(kickTarget.name)}</p>
                        </div>
                        <div className="modal-actions">
                            <SecondaryButton $width={70} $height={32} onClick={closeKickModal}>{t.category.cancel}</SecondaryButton>
                            <SecondaryButton $width={80} $height={32} $variant="danger" onClick={handleKickSubmit}>{t.category.kick}</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </S.CategoryWrapper>
    );
}
