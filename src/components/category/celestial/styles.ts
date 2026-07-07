import styled from "styled-components";

export const CategoryWrapper = styled.div`
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: ${(props) => props.theme.colors.background};
    font-family: ${(props) => props.theme.fonts.celestial};
`;

export const CenterWrapper = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    max-width: 1100px;
    gap: 24px;
    padding: 0 24px;
`;

export const SidebarContainer = styled.div`
    width: 250px;
    min-width: 250px;
    border-right: 1px solid ${(props) => props.theme.colors.primary}55;
    display: flex;
    flex-direction: column;

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;

        h2 {
            font-family: ${(props) => props.theme.fonts.celestial};
            font-size: 0.9rem;
            letter-spacing: 2px;
            color: ${(props) => props.theme.colors.textSecondary};
            font-weight: 400;
            margin: 0;
        }
    }
`;

export const AddCategoryBtn = styled.button`
    background: transparent;
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    transition: all 0.2s;
    line-height: 0;
    padding-bottom: 2px;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    padding: 6px 0;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const CategoryItem = styled.div<{ $color: string; $isSelected: boolean }>`
    display: flex;
    align-items: center;
    padding: 9px 14px;
    cursor: pointer;
    border-left: 2px solid ${(props) => props.$isSelected ? props.theme.colors.primary : 'transparent'};
    background-color: ${(props) => props.$isSelected ? props.theme.colors.primary + '1A' : 'transparent'};
    transition: all 0.15s;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;
    }

    .color-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${(props) => props.$color};
        margin-right: 10px;
        flex-shrink: 0;
    }

    .cat-name {
        font-size: 0.85rem;
        color: ${(props) => props.$isSelected ? props.theme.colors.primary : props.theme.colors.text};
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

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const EmptyStateContainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.9rem;
    font-family: ${(props) => props.theme.fonts.celestial};
    letter-spacing: 1px;
`;

export const DetailInfo = styled.div`
    padding: 24px 32px;
`;

export const CategoryTitleWrapper = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};

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
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 1.5rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.text};
        background: transparent;
        border: none;
        outline: none;
        width: 100%;
        line-height: 1;
        padding: 4px 0;
        letter-spacing: 2px;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}80;
        }
    }
`;

export const DetailHeader = styled.div<{ $activeTab: string }>`
    display: flex;
    border: 1px solid ${(props) => props.theme.colors.primary};
    margin-bottom: 24px;
    width: fit-content;

    button {
        background: transparent;
        border: none;
        padding: 6px 20px;
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.85rem;
        letter-spacing: 1.5px;
        cursor: pointer;
        transition: all 0.15s;

        &:not(:last-child) {
            border-right: 1px solid ${(props) => props.theme.colors.primary};
        }
    }

    .info-tab {
        background: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.surface : props.theme.colors.primary};
    }

    .todo-tab {
        background: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.surface : props.theme.colors.primary};
    }

    button:hover {
        background: ${(props) => props.theme.colors.primary}22;
        color: ${(props) => props.theme.colors.primary};
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
    border: 1px solid ${(props) => props.theme.colors.primary};
    background-color: transparent;
`;

export const PropertyRow = styled.div`
    display: flex;
    align-items: stretch;
    min-height: 48px;

    &:not(:last-child) {
        border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
    }

    .prop-label {
        width: 120px;
        display: flex;
        align-items: flex-start;
        padding: 14px 16px;
        font-size: 0.85rem;
        color: ${(props) => props.theme.colors.textSecondary};
        border-right: 1px solid ${(props) => props.theme.colors.primary}33;
        flex-shrink: 0;
        font-family: ${(props) => props.theme.fonts.celestial};
        letter-spacing: 0.3px;
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

            &::-webkit-scrollbar { width: 4px; }
            &::-webkit-scrollbar-thumb {
                background-color: ${(props) => props.theme.colors.primary}80;
                border-radius: 2px;
            }
            &::-webkit-scrollbar-track { background: transparent; }
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
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};

        h3 {
            font-family: ${(props) => props.theme.fonts.celestial};
            font-size: 0.9rem;
            letter-spacing: 1.5px;
            color: ${(props) => props.theme.colors.textSecondary};
            font-weight: 400;
            margin: 0;
        }
    }

    .empty-state {
        padding: 30px;
        text-align: center;
        border: 1px solid ${(props) => props.theme.colors.primary}55;

        p {
            color: ${(props) => props.theme.colors.textSecondary};
            font-size: 0.85rem;
            margin: 0;
            font-family: ${(props) => props.theme.fonts.celestial};
            letter-spacing: 0.5px;
        }
    }
`;

export const ParticipantTable = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
`;

export const TableHeader = styled.div`
    display: flex;
    align-items: center;
    background-color: ${(props) => props.theme.colors.primary}11;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}55;
    padding: 8px 16px;
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 0.5px;
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
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}22;
    transition: background-color 0.15s;

    &:last-child { border-bottom: none; }
    &:hover { background-color: ${(props) => props.theme.colors.primary}0D; }

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
            background-color: ${(props) => props.theme.colors.primary}22;
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
            transition: all 0.2s;

            &:hover {
                color: ${(props) => props.theme.colors.error};
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

export const TodoListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    .header {
        display: flex;
        align-items: center;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};
        padding-bottom: 8px;

        h3 {
            font-family: ${(props) => props.theme.fonts.celestial};
            font-size: 0.9rem;
            letter-spacing: 1.5px;
            color: ${(props) => props.theme.colors.textSecondary};
            font-weight: 400;
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
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    background-color: transparent;
    transition: all 0.15s;
    cursor: pointer;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;
        border-color: ${(props) => props.theme.colors.primary};

        .delete-btn { opacity: 1; }
    }

    .check-btn {
        width: 16px;
        height: 16px;
        border: 1px solid ${(props) => props.theme.colors.primary};
        background-color: ${(props) => props.$isDone ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.theme.colors.surface};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s;
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
            font-family: ${(props) => props.theme.fonts.celestial};
            font-size: 0.75rem;
            letter-spacing: 0.3px;
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
        transition: all 0.2s;
        flex-shrink: 0;

        &:hover {
            color: ${(props) => props.theme.colors.error};
        }
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 5px;
    width: 380px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    font-family: ${(props) => props.theme.fonts.celestial};

    .modal-header {
        padding: 16px 24px;
        background-color: ${(props) => props.theme.colors.primary}0D;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;

        h3 {
            margin: 0;
            font-size: 1rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 400;
            letter-spacing: 1.5px;
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
            padding: 9px 12px;
            background: transparent;
            border: 1px solid ${(props) => props.theme.colors.primary};
            outline: none;
            font-size: 0.9rem;
            font-family: ${(props) => props.theme.fonts.body};
            color: ${(props) => props.theme.colors.text};
            transition: all 0.2s;
            box-sizing: border-box;

            &::placeholder {
                color: ${(props) => props.theme.colors.textSecondary}66;
            }

            &:focus {
                box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}30;
            }
        }
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 24px;
        border-top: 1px solid ${(props) => props.theme.colors.primary}40;
    }
`;
