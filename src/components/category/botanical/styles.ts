import styled from "styled-components";

export const CategoryWrapper = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    background-color: ${(props) => props.theme.colors.background};
    font-family: ${(props) => props.theme.fonts.body};
`;

export const SidebarContainer = styled.div`
    width: 250px;
    min-width: 250px;
    border-right: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-direction: column;
    position: relative;

    .sidebar-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 10px;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
    }

    &::after {
        content: "";
        position: absolute;
        bottom: 20px;
        right: 10px;
        width: 60px;
        height: 80px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 80' fill='none'%3E%3Cpath d='M30 5 C30 5 10 20 10 40 C10 60 30 75 30 75 C30 75 50 60 50 40 C50 20 30 5 30 5Z' stroke='%23C9B59C' strokeWidth='1'/%3E%3Cpath d='M30 5 L30 75' stroke='%23C9B59C' strokeWidth='0.6'/%3E%3C/svg%3E") no-repeat center;
        opacity: 0.06;
        pointer-events: none;
    }
`;

export const AddCategoryBtn = styled.button`
    background: transparent;
    font-size: 1.3rem;
    color: ${(props) => props.theme.colors.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px;
    transition: all 0.2s ease;
    line-height: 0;
    padding-bottom: 2px;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}18;
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    padding: 8px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const CategoryItem = styled.div<{ $color: string; $isSelected: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 2px;
    border-radius: 8px;
    cursor: pointer;
    background-color: ${(props) => props.$isSelected ? props.theme.colors.primary + '18' : 'transparent'};
    border: 1px solid ${(props) => props.$isSelected ? props.theme.colors.border : 'transparent'};
    border-bottom: 1px dashed ${(props) => props.theme.colors.border}66;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
    }

    .color-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background-color: ${(props) => props.$color};
        margin-right: 10px;
        flex-shrink: 0;
    }

    .cat-name {
        font-size: 0.85rem;
        color: ${(props) => props.$isSelected ? props.theme.colors.text : props.theme.colors.textSecondary};
        font-weight: ${(props) => props.$isSelected ? '500' : '400'};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
    }
`;

export const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.background};
`;

export const EmptyStateContainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.9rem;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const DetailInfo = styled.div`
    padding: 30px 40px;
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
`;

export const CategoryTitleWrapper = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};

    .color-picker-container {
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 0 2px ${(props) => props.theme.colors.surface}, 0 0 0 3px ${(props) => props.$color}80;
        flex-shrink: 0;

        .color-input {
            position: absolute;
            top: -5px; left: -5px;
            width: 34px; height: 34px;
            border: none;
            cursor: pointer;
            padding: 0;
        }
    }

    .title-input {
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 1.5rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.text};
        background: transparent;
        border: none;
        outline: none;
        width: 100%;
        line-height: 1;
        padding: 4px 0;
        letter-spacing: 0;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}80;
        }
    }
`;

export const DetailHeader = styled.div<{ $activeTab: string }>`
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    button {
        background: transparent;
        border: none;
        padding: 6px 8px;
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.95rem;
        cursor: pointer;
        color: ${(props) => props.theme.colors.textSecondary};
        transition: all 0.2s ease;
        border-bottom: 2px solid transparent;

        &:hover { color: ${(props) => props.theme.colors.primary}; }
    }

    .info-tab {
        color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : ''};
        border-bottom-color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : 'transparent'};
    }

    .todo-tab {
        color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : ''};
        border-bottom-color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : 'transparent'};
    }
`;

export const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const PropertiesCard = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.surface};
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(217, 207, 199, 0.3);
`;

export const PropertyRow = styled.div`
    display: flex;
    align-items: stretch;
    min-height: 48px;

    &:not(:last-child) {
        border-bottom: 1px solid ${(props) => props.theme.colors.border}40;
    }

    .prop-label {
        width: 120px;
        display: flex;
        align-items: flex-start;
        padding: 14px 16px;
        font-size: 0.85rem;
        color: ${(props) => props.theme.colors.textSecondary};
        border-right: 1px solid ${(props) => props.theme.colors.border}40;
        flex-shrink: 0;
        background-color: ${(props) => props.theme.colors.background};
    }

    .prop-value {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 8px 16px;
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.85rem;
        color: ${(props) => props.theme.colors.text};

        .desc-textarea {
            width: 100%;
            background: transparent;
            border: none;
            outline: none;
            color: inherit;
            font-family: inherit;
            font-size: inherit;
            resize: vertical;
            line-height: 1.5;
            padding: 6px 0;

            &::placeholder {
                color: ${(props) => props.theme.colors.textSecondary}66;
            }
        }
    }
`;

export const ParticipantSection = styled.div`
    display: flex;
    flex-direction: column;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};

        h3 {
            font-size: 0.95rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 500;
            margin: 0;
        }
    }

    .empty-state {
        padding: 30px;
        text-align: center;
        border: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 8px;

        p {
            color: ${(props) => props.theme.colors.textSecondary};
            font-size: 0.85rem;
            margin: 0;
        }
    }
`;

export const ParticipantTable = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px;
    overflow: hidden;
`;

export const TableHeader = styled.div`
    display: flex;
    align-items: center;
    background-color: ${(props) => props.theme.colors.background};
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding: 8px 16px;
    font-size: 0.8rem;
    color: ${(props) => props.theme.colors.textSecondary};

    .col-name { flex: 1.2; }
    .col-email { flex: 2; }
    .col-action { width: 60px; text-align: center; flex-shrink: 0; }
`;

export const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

export const TableRow = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 16px;
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.text};
    border-bottom: 1px solid ${(props) => props.theme.colors.border}33;
    transition: background-color 0.2s ease;

    &:last-child { border-bottom: none; }
    &:hover { background-color: ${(props) => props.theme.colors.primary}0E; }

    .col-name {
        flex: 1.2;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .avatar {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background-color: ${(props) => props.theme.colors.primary}18;
            color: ${(props) => props.theme.colors.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            flex-shrink: 0;
        }
    }

    .col-email {
        flex: 2;
        color: ${(props) => props.theme.colors.textSecondary};
        font-size: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 10px;
    }

    .col-action {
        width: 60px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;

        .remove-btn {
            background-color: transparent;
            color: ${(props) => props.theme.colors.textSecondary};
            border: none;
            padding: 4px 8px;
            font-size: 0.75rem;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s ease;
            border-radius: 6px;

            &:hover {
                color: ${(props) => props.theme.colors.error};
                background-color: ${(props) => props.theme.colors.error}18;
            }
        }
    }

    &:hover .remove-btn { opacity: 1; }
`;

export const ActionFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
`;

export const BotanicalDivider = styled.div`
    width: 100%;
    height: 24px;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, ${p => p.theme.colors.primary}40, transparent);
    }

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        width: 8px;
        height: 8px;
        border-radius: 50% 50% 50% 0;
        border: 1px solid ${p => p.theme.colors.primary}60;
    }
`;

export const TodoListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    .header {
        display: flex;
        align-items: center;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
        padding-bottom: 8px;

        h3 {
            font-size: 0.95rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 500;
            margin: 0;

            span {
                color: ${(props) => props.theme.colors.primary};
            }
        }
    }
`;

export const TodoGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const TodoCard = styled.div<{ $isDone: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.surface};
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
        border-color: ${(props) => props.theme.colors.primary}55;
        box-shadow: 0 2px 8px rgba(217, 207, 199, 0.4);

        .delete-btn { opacity: 1; }
    }

    .check-btn {
        width: 18px;
        height: 18px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 1px solid ${(props) => props.theme.colors.primary};
        background-color: ${(props) => props.$isDone ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.theme.colors.background};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s ease;
        font-size: 11px;
    }

    .todo-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: ${(props) => props.$isDone ? 0.5 : 1};
        text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};

        .title {
            font-size: 0.9rem;
            font-weight: 500;
            color: ${(props) => props.theme.colors.text};
            word-break: keep-all;
        }

        .date {
            font-size: 0.75rem;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    }

    .delete-btn {
        background: transparent;
        border: none;
        color: ${(props) => props.theme.colors.textSecondary};
        cursor: pointer;
        opacity: 0;
        padding: 6px 10px;
        font-size: 0.75rem;
        transition: all 0.2s ease;
        border-radius: 6px;
        flex-shrink: 0;

        &:hover {
            color: ${(props) => props.theme.colors.error};
            background-color: ${(props) => props.theme.colors.error}18;
        }
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(58, 53, 48, 0.3);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 12px;
    width: 380px;
    box-shadow: 0 10px 30px rgba(217, 207, 199, 0.4);
    font-family: ${(props) => props.theme.fonts.body};

    .modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
        background-color: ${(props) => props.theme.colors.background};
        border-radius: 12px 12px 0 0;

        h3 {
            margin: 0;
            font-size: 1.05rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 500;
        }
    }

    .modal-body {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        p {
            color: ${(props) => props.theme.colors.textSecondary};
            font-size: 0.9rem;
            margin: 0;
            line-height: 1.5;
        }

        input {
            width: 100%;
            padding: 10px 12px;
            background: ${(props) => props.theme.colors.background};
            border: 1px solid ${(props) => props.theme.colors.border};
            border-radius: 8px;
            outline: none;
            font-size: 0.9rem;
            color: ${(props) => props.theme.colors.text};
            transition: all 0.2s ease;
            box-sizing: border-box;
            font-family: inherit;

            &::placeholder {
                color: ${(props) => props.theme.colors.textSecondary}66;
            }

            &:focus {
                border-color: ${(props) => props.theme.colors.primary};
                box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}18;
            }
        }
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 24px;
        border-top: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 0 0 12px 12px;
    }
`;
