import styled from "styled-components";

export const CategoryWrapper = styled.div`
    display: flex;
    height: calc(100vh - 80px);
    max-width: 1200px;
    margin: 0 auto;
    background-color: ${(props) => props.theme.colors.surface};
`;

export const SidebarContainer = styled.div`
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

export const AddCategoryBtn = styled.button`
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

export const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    padding: 5px 10px 0 10px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.accent};
        border-radius: 3px;
    }
`;

export const CategoryItem = styled.div<{ $color: string; $isSelected: boolean }>`
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

export const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};
`;

export const EmptyStateContainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: ${(props) => props.theme.fontSizes.body};
`;

export const DetailInfo = styled.div`
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
`;

export const CategoryTitleWrapper = styled.div<{ $color: string }>`
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

export const DetailHeader = styled.div<{ $activeTab: string }>`
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
            left: 0; right: 0;
            height: 2px;
            background-color: transparent;
            transition: background-color 0.2s;
        }
        
        &:hover { color: ${(props) => props.theme.colors.text}; }
    }
    
    .info-tab {
        color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : ''};
        &::after { background-color: ${(props) => props.$activeTab === 'info' ? props.theme.colors.primary : 'transparent'}; }
    }
    
    .todo-tab {
        color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : ''};
        &::after { background-color: ${(props) => props.$activeTab === 'todos' ? props.theme.colors.primary : 'transparent'}; }
    }
`;

export const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;
`;

export const PropertiesCard = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.accent};
    border-radius: 12px;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.surface};
`;

export const PropertyRow = styled.div`
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

            &::-webkit-scrollbar { width: 6px; }
            &::-webkit-scrollbar-thumb {
                background-color: ${(props) => props.theme.colors.accent};
                border-radius: 3px;
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

export const ParticipantTable = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.accent};
    border-radius: 12px;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.surface};
`;

export const TableHeader = styled.div`
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

export const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

export const TableRow = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    font-size: 0.95rem;
    color: ${(props) => props.theme.colors.text};
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    transition: background-color 0.15s;

    &:last-child { border-bottom: none; }
    &:hover { background-color: ${(props) => props.theme.colors.accent}22; }

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

        span { font-weight: 500; }
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

    &:hover .remove-btn { opacity: 1; }
`;

export const ActionFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid ${(props) => props.theme.colors.accent};
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
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

export const TodoListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;

    .header {
        h3 {
            font-size: ${(props) => props.theme.fontSizes.h4};
            color: ${(props) => props.theme.colors.text};
            font-weight: 600;
            margin: 0 0 8px 0;
        }
    }
`;

export const TodoGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

export const TodoCard = styled.div<{ $isDone: boolean; $color: string }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.accent};
    border-radius: 12px;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }

    .todo-info {
        flex: 1;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 6px;
        opacity: ${(props) => props.$isDone ? 0.4 : 1};
        text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};

        .title {
            font-size: 1.05rem;
            font-weight: 500;
            color: ${(props) => props.theme.colors.text};
        }
        
        .date {
            font-size: 0.85rem;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    }

    .todo-actions {
        display: flex;
        gap: 8px;

        button {
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }

        .toggle-btn {
            background-color: ${(props) => props.$isDone ? props.theme.colors.accent : props.theme.colors.primary + '1A'};
            color: ${(props) => props.$isDone ? props.theme.colors.textSecondary : props.theme.colors.primary};
            
            &:hover {
                background-color: ${(props) => props.$isDone ? props.theme.colors.textSecondary + '33' : props.theme.colors.primary + '33'};
            }
        }

        .delete-btn {
            background-color: ${(props) => props.theme.colors.error}1A;
            color: ${(props) => props.theme.colors.error};

            &:hover {
                background-color: ${(props) => props.theme.colors.error}33;
            }
        }
    }
`;