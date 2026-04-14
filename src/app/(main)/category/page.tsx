"use client";

import React, { useEffect, useState } from "react";
import useCategoryStore from "@/store/useCategoryStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import styled from "styled-components";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import CategoryAddModal from "@/components/modal/categoryAddModal/CategoryAddModal";

export default function CategoryPage() {
    const { categories, fetchCategories, deleteCategory, updateCategory, addCategory } = useCategoryStore();
    const authFetch = useAuthFetch();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'todos'>('info');
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteError, setInviteError] = useState("");
    const [kickTarget, setKickTarget] = useState<{ id: string, name: string } | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchCategories(authFetch);
    }, []);

    useEffect(() => {
        setActiveTab('info');
    }, [selectedCategoryId]);

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    useEffect(() => {
        if (selectedCategory) {
            setEditName(selectedCategory.name);
            setEditColor(selectedCategory.color);
            setEditDescription(selectedCategory.description || "");
        }
    }, [selectedCategory?.id, selectedCategory?.name, selectedCategory?.color, selectedCategory?.description]);

    const openInviteModal = () => {
        setInviteEmail("");
        setInviteError("");
        setIsInviteModalOpen(true);
    };

    const closeInviteModal = () => setIsInviteModalOpen(false);
    const closeKickModal = () => setKickTarget(null);

    const handleAddCategorySubmit = async (data: { name: string; color: string; description: string }) => {
        await addCategory(authFetch, data);
        fetchCategories(authFetch);
    };

    const handleInviteSubmit = async () => {
        if (!selectedCategory) return;
        setInviteError("");

        const email = inviteEmail.trim();
        if (!email) {
            setInviteError("이메일을 입력해주세요.");
            return;
        }
        if (selectedCategory.participants?.some(p => p.email === email)) {
            setInviteError("이미 참여 중인 멤버입니다.");
            return;
        }

        try {
            const res = await authFetch('/api/category', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedCategory.id, addParticipantEmail: email }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setInviteError(errorData.message || "초대에 실패했습니다.");
                return;
            }

            closeInviteModal();
            fetchCategories(authFetch);
        } catch (err) {
            setInviteError("서버 오류가 발생했습니다.");
        }
    };

    const handleKickSubmit = async () => {
        if (!selectedCategory || !kickTarget) return;

        try {
            const res = await authFetch('/api/category', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedCategory.id, removeParticipantId: kickTarget.id }),
            });

            if (res.ok) {
                closeKickModal();
                fetchCategories(authFetch);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDescriptionBlur = async () => {
        if (!selectedCategory) return;
        const trimmedDesc = editDescription.trim();

        if (trimmedDesc === (selectedCategory.description || "")) return;

        await useCategoryStore.getState().updateCategory(authFetch, selectedCategory.id, { description: trimmedDesc });
    };

    const handleNameBlur = async () => {
        if (!selectedCategory) return;
        const trimmedName = editName.trim();
        if (trimmedName === "" || trimmedName === selectedCategory.name) {
            setEditName(selectedCategory.name);
            return;
        }
        await useCategoryStore.getState().updateCategory(authFetch, selectedCategory.id, { name: trimmedName });
    };

    const handleColorBlur = async () => {
        if (!selectedCategory) return;
        if (editColor === selectedCategory.color) return;
        await useCategoryStore.getState().updateCategory(authFetch, selectedCategory.id, { color: editColor });
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
            await deleteCategory(authFetch, categoryId);
            if (selectedCategoryId === categoryId) {
                setSelectedCategoryId(null);
            }
        }
    };

    return (
        <CategoryWrapper>
            <SidebarContainer>
                <div className="sidebar-header">
                    <h2>카테고리</h2>
                    <AddCategoryBtn onClick={() => setIsAddModalOpen(true)}>+</AddCategoryBtn>
                </div>
                <CategoryList>
                    {categories.map((cat) => (
                        <CategoryItem $color={cat.color} key={cat.id} $isSelected={selectedCategoryId === cat.id} onClick={() => setSelectedCategoryId(cat.id)}>
                            <div className="color-indicator" />
                            <span>{cat.name}</span>
                        </CategoryItem>
                    ))}
                </CategoryList>
            </SidebarContainer>

            <ContentContainer>
                {selectedCategory ? (
                    <DetailInfo>
                        <CategoryTitleWrapper $color={editColor}>
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
                        </CategoryTitleWrapper>

                        <DetailHeader $activeTab={activeTab}>
                            <button onClick={() => setActiveTab('info')} className="info-tab">상세 정보</button>
                            <button onClick={() => setActiveTab('todos')} className="todo-tab">할 일 목록</button>
                        </DetailHeader>

                        {activeTab === 'info' ? (
                            <InfoContainer>
                                <PropertiesCard>
                                    <PropertyRow>
                                        <div className="prop-label">생성자</div>
                                        <div className="prop-value">{selectedCategory.creatorName || '알 수 없음'}</div>
                                    </PropertyRow>
                                    <PropertyRow>
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
                                    </PropertyRow>
                                </PropertiesCard>

                                <ParticipantSection>
                                    <div className="header">
                                        <h3>멤버 목록</h3>
                                        <SecondaryButton $width={100} $height={32} onClick={openInviteModal}>+ 초대하기</SecondaryButton>
                                    </div>

                                    {selectedCategory.participants && selectedCategory.participants.length > 0 ? (
                                        <ParticipantTable>
                                            <TableHeader>
                                                <div className="col-name">이름</div>
                                                <div className="col-email">이메일</div>
                                                <div className="col-action"></div>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedCategory.participants.map(participant => (
                                                    <TableRow key={participant.id}>
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
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </ParticipantTable>
                                    ) : (
                                        <div className="empty-state">
                                            <p>참여 중인 멤버가 없습니다.</p>
                                        </div>
                                    )}
                                </ParticipantSection>

                                <ActionFooter>
                                    <SecondaryButton $height={36} $width={140} $variant="danger" onClick={() => handleDelete(selectedCategory.id)}>
                                        이 카테고리 삭제
                                    </SecondaryButton>
                                </ActionFooter>
                            </InfoContainer>
                        ) : (
                            <div style={{ padding: '20px' }}>
                                <h3>할 일 목록</h3>
                                <p style={{ color: '#888', marginTop: '10px' }}>준비 중인 기능입니다.</p>
                            </div>
                        )}
                    </DetailInfo>
                ) : (
                    <EmptyStateContainer>
                        <p>왼쪽 목록에서 카테고리를 선택하거나 새 카테고리를 추가해보세요.</p>
                    </EmptyStateContainer>
                )}
            </ContentContainer>

            {isInviteModalOpen && (
                <ModalOverlay onClick={closeInviteModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
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
                    </ModalContent>
                </ModalOverlay>
            )}

            {kickTarget && (
                <ModalOverlay onClick={closeKickModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>멤버 추방</h3>
                        <p>정말 <strong>{kickTarget.name}</strong>님을 이 카테고리에서 추방하시겠습니까?</p>
                        <div className="modal-actions">
                            <SecondaryButton $width={80} $height={36} onClick={closeKickModal}>취소</SecondaryButton>
                            <SecondaryButton $width={80} $height={36} $variant="danger" onClick={handleKickSubmit}>추방하기</SecondaryButton>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            <CategoryAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCategorySubmit}
            />

        </CategoryWrapper>
    );
}

const CategoryWrapper = styled.div`
    display: flex;
    height: calc(100vh - 80px);
    max-width: 1200px;
    margin: 0 auto;
    background-color: ${(props) => props.theme.colors.surface};
`;

const SidebarContainer = styled.div`
    width: 280px;
    min-width: 280px;
    border-right: 1px solid ${(props) => props.theme.colors.accent};
    display: flex;
    flex-direction: column;
    padding: 20px 0;

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px 20px 20px;

        h2 {
            font-size: ${(props) => props.theme.fontSizes.h4};
            color: ${(props) => props.theme.colors.textSecondary};
            font-weight: 600;
            margin: 0;
        }
    }
`;

const AddCategoryBtn = styled.button`
    background: transparent;
    font-size: 1.5rem;
    line-height: 1;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    transition: all 0.2s;
    border-color: ${(props) => props.theme.colors.primary};

    &:hover {
        color: ${(props) => props.theme.colors.text};
        border-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 10px 3px ${(props) => props.theme.colors.accent};
    }
`;

const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    padding: 5px 10px 0 10px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.accent};
        border-radius: 3px;
    }
`;

const CategoryItem = styled.div<{ $color: string; $isSelected: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 4px;
    border-radius: 8px;
    cursor: pointer;
    background-color: transparent;
    border: 1px solid ${(props) => props.$isSelected ? props.theme.colors.primary : 'transparent'};
    box-shadow: ${(props) => props.$isSelected ? `0 0 10px ${props.theme.colors.primary}` : 'none'};
    color: ${(props) => props.$isSelected ? props.theme.colors.text : props.theme.colors.textSecondary};
    font-weight: ${(props) => props.$isSelected ? '600' : '400'};
    transition: all 0.2s;

    &:hover {
        border-color: ${(props) => props.$isSelected ? props.theme.colors.primary : props.theme.colors.accent};
        box-shadow: ${(props) => props.$isSelected ? `0 0 10px ${props.theme.colors.primary}` : `0 0 8px ${props.theme.colors.accent}`};
    }

    .color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${(props) => props.$color};
        margin-right: 12px;
        box-shadow: 0 0 0 2px ${(props) => props.theme.colors.surface}, 0 0 0 3px ${(props) => props.$isSelected ? props.$color : 'transparent'};
    }

    span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};
`;

const EmptyStateContainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: ${(props) => props.theme.fontSizes.body};
`;

const DetailInfo = styled.div`
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
`;

const CategoryTitleWrapper = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 40px;
    
    .color-picker-container {
        position: relative;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        
        .color-input {
            position: absolute;
            top: -10px;
            left: -10px;
            width: 52px;
            height: 52px;
            border: none;
            cursor: pointer;
            padding: 0;
            background-color: ${(props) => props.$color};
        }
    }
    
    .title-input {
        font-size: ${(props) => props.theme.fontSizes.h1};
        font-weight: bold;
        color: ${(props) => props.theme.colors.text};
        background: transparent;
        border: none;
        outline: none;
        width: 100%;
        padding: 4px 0;
        border-bottom: 2px solid transparent;
        transition: border-color 0.2s;
        
        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
            opacity: 0.5;
        }

        &:hover, &:focus {
            border-bottom: 2px solid ${(props) => props.theme.colors.accent};
        }
    }
`;

const DetailHeader = styled.div<{ $activeTab: string }>`
    display: flex;
    gap: 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    margin-bottom: 30px;
    
    button {
        background: transparent;
        border: none;
        padding: 12px 4px;
        font-size: ${(props) => props.theme.fontSizes.body};
        font-weight: 500;
        cursor: pointer;
        position: relative;
        color: ${(props) => props.theme.colors.textSecondary};
        transition: color 0.2s;
        
        &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: transparent;
            transition: background-color 0.2s;
        }
        
        &:hover {
            color: ${(props) => props.theme.colors.text};
        }
    }
    
    .info-tab {
        color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : ''};
        &::after {
            background-color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : 'transparent'};
        }
    }
    
    .todo-tab {
        color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : ''};
        &::after {
            background-color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : 'transparent'};
        }
    }
`;

const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;
`;

const PropertiesCard = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.accent};
    border-radius: 12px;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.surface};
`;

const PropertyRow = styled.div`
    display: flex;
    min-height: 52px;

    &:not(:last-child) {
        border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    }

    .prop-label {
        width: 140px;
        display: flex;
        align-items: center;
        padding: 16px 20px;
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.textSecondary};
        background-color: ${(props) => props.theme.colors.surface};
        border-right: 1px solid ${(props) => props.theme.colors.accent};
        flex-shrink: 0;
        font-weight: 500;
    }

    .prop-value {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: ${(props) => props.theme.colors.text};
        font-size: 0.95rem;
        line-height: 1.5;

        .desc-textarea {
            width: 100%;
            background: transparent;
            border: none;
            outline: none;
            color: inherit;
            font-size: inherit;
            font-family: inherit;
            resize: vertical;
            line-height: 1.6;
            min-height: 44px;
            padding: 4px 0;
            
            &::placeholder {
                color: ${(props) => props.theme.colors.textSecondary};
                opacity: 0.6;
            }

            &::-webkit-scrollbar {
                width: 6px;
            }
            &::-webkit-scrollbar-thumb {
                background-color: ${(props) => props.theme.colors.accent};
                border-radius: 3px;
            }
        }
    }
`;

const ParticipantSection = styled.div`
    display: flex;
    flex-direction: column;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
            font-size: ${(props) => props.theme.fontSizes.h4};
            color: ${(props) => props.theme.colors.text};
            font-weight: 600;
            margin: 0;
        }
    }

    .empty-state {
        padding: 40px 20px;
        text-align: center;
        background-color: ${(props) => props.theme.colors.surface};
        border: 1px dashed ${(props) => props.theme.colors.accent};
        border-radius: 12px;

        p {
            color: ${(props) => props.theme.colors.textSecondary};
            font-size: 0.95rem;
            margin: 0;
        }
    }
`;

const ParticipantTable = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.accent};
    border-radius: 12px;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.surface};
`;

const TableHeader = styled.div`
    display: flex;
    align-items: center;
    background-color: ${(props) => props.theme.colors.surface};
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    padding: 12px 20px;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.textSecondary};

    .col-name { flex: 1; }
    .col-email { flex: 1.5; }
    .col-action { width: 60px; text-align: center; }
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableRow = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    font-size: 0.95rem;
    color: ${(props) => props.theme.colors.text};
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    transition: background-color 0.15s;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: ${(props) => props.theme.colors.accent}22;
    }

    .col-name {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;

        .avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: ${(props) => props.theme.colors.primary}1A;
            color: ${(props) => props.theme.colors.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 600;
            flex-shrink: 0;
        }

        span {
            font-weight: 500;
        }
    }

    .col-email {
        flex: 1.5;
        color: ${(props) => props.theme.colors.textSecondary};
        font-size: 0.9rem;
    }

    .col-action {
        width: 60px;
        display: flex;
        justify-content: center;

        .remove-btn {
            background-color: transparent;
            color: ${(props) => props.theme.colors.textSecondary};
            border: none;
            padding: 6px 12px;
            font-size: 0.85rem;
            cursor: pointer;
            border-radius: 6px;
            opacity: 0;
            transition: all 0.2s;

            &:hover {
                color: ${(props) => props.theme.colors.error};
                background-color: ${(props) => props.theme.colors.error}1A;
            }
        }
    }

    &:hover .remove-btn {
        opacity: 1;
    }
`;

const ActionFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid ${(props) => props.theme.colors.accent};
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    padding: 32px;
    border-radius: 16px;
    width: 420px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    @keyframes scaleUp {
        from { transform: scale(0.95) translateY(10px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
    }

    h3 { 
        margin: 0 0 8px 0; 
        font-size: ${(props) => props.theme.fontSizes.h3};
        color: ${(props) => props.theme.colors.text};
        font-weight: 600;
    }
    
    p { 
        color: ${(props) => props.theme.colors.textSecondary}; 
        font-size: 0.95rem; 
        margin: 0 0 24px 0; 
        line-height: 1.5;
    }
    
    input {
        width: 100%; 
        padding: 14px 16px; 
        margin-bottom: 12px;
        background-color: ${(props) => props.theme.colors.surface};
        border: 1px solid ${(props) => props.theme.colors.accent};
        border-radius: 8px; 
        outline: none;
        font-size: 1rem;
        color: ${(props) => props.theme.colors.text};
        transition: all 0.2s;
        
        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
            opacity: 0.5;
        }

        &:focus { 
            border-color: ${(props) => props.theme.colors.primary};
            box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}22;
        }
    }
    
    .modal-actions { 
        display: flex; 
        justify-content: flex-end; 
        gap: 12px; 
        margin-top: 32px;
    }
`;