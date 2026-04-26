import styled, { css } from "styled-components";

export const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 0 10px;
`;

export const Header = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
`;

export const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
`;

export const TitleText = styled.span`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
`;

export const CategoryTag = styled.div<{ $color: string }>`
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    color: ${(props) => props.$color};
    border: 1px solid ${(props) => props.$color};
    background-color: transparent;
    white-space: nowrap;
`;

export const HeaderLine = styled.hr`
    flex: 0.8;
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.primary};
    margin: 0;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

export const TabContainer = styled.div`
    display: flex;
    gap: 10px;
    width: 100%;
    margin-bottom: 10px;
    overflow-x: auto;
    padding-bottom: 5px;
`;

export const Tab = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    background: ${(props) => props.$active ? `${props.theme.colors.primary}22` : 'transparent'};
    border: 1px solid ${(props) => props.$active ? props.theme.colors.primary : `${props.theme.colors.primary}40`};
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const TabText = styled.span`
    color: ${(props) => props.theme.colors.text};
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.85rem;
`;

export const ContentLayout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
`;

export const Resizer = styled.div`
    height: 12px;
    cursor: row-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0;
    &::after {
        content: '';
        width: 60px;
        height: 4px;
        background-color: ${(props) => props.theme.colors.primary}40;
        border-radius: 2px;
        transition: background-color 0.2s;
    }
    &:hover::after, &:active::after {
        background-color: ${(props) => props.theme.colors.primary};
    }
`;

export const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 150px;
    overflow: hidden;
    border: 1px solid ${(props) => props.theme.colors.primary};
    background: ${(props) => props.theme.colors.surface};
    border-radius: 4px;
`;

export const SectionTitle = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.9rem;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 8px 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}55;
    background: ${(props) => props.theme.colors.primary}11;
`;

export const BoardGrid = styled.div`
    display: flex;
    flex: 1;
    overflow-x: auto;
    background: transparent;
`;

export const BoardColumn = styled.div`
    flex: 1;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${(props) => props.theme.colors.primary}40;
    &:last-child {
        border-right: none;
    }
`;

export const ColumnHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
`;

export const ColumnTitle = styled.span`
    font-size: 0.8rem;
    color: ${(props) => props.theme.colors.textSecondary};
    font-family: ${(props) => props.theme.fonts.celestial};
`;

export const AddSquareButton = styled.button`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}80;
    color: ${(props) => props.theme.colors.primary};
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background: ${(props) => props.theme.colors.primary}22;
    }
`;

export const CardList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const CardBox = styled.div<{ $isLocked?: boolean }>`
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    background: transparent;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    opacity: ${(props) => props.$isLocked ? 0.5 : 1};
    transition: all 0.2s;
    &:hover {
        background: ${(props) => props.theme.colors.primary}1A;
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

// ✨ 중요도 태그 스타일 (Title 영역에 들어맞게 조정)
export const PriorityTag = styled.span<{ $priority: string }>`
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 2px;
    border: 1px solid;
    ${(props) => {
        if (props.$priority === 'high') return css`color: #ef4444; border-color: #ef4444;`;
        if (props.$priority === 'low') return css`color: #94a3b8; border-color: #94a3b8;`;
        return css`color: ${props.theme.colors.primary}; border-color: ${props.theme.colors.primary};`;
    }}
`;

export const CardTitle = styled.div`
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    line-height: 1.3;
`;

export const LockedTag = styled.span`
    font-size: 0.65rem;
    color: ${(props) => props.theme.colors.textSecondary};
    border: 1px solid;
    padding: 1px 4px;
    border-radius: 2px;
`;

export const CardAssignees = styled.div`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
    margin-top: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px dashed ${(props) => props.theme.colors.primary}33;
`;

export const CardDate = styled.span`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const CardActionGroup = styled.div`
    display: flex;
    gap: 6px;
`;

export const CardMoveButton = styled.button`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background: ${(props) => props.theme.colors.primary}33;
    }
`;

export const TimelineLayout = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;
`;

export const TimelineGridArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    overflow-y: auto;
    position: relative;
    &::-webkit-scrollbar { width: 4px; height: 4px; }
    &::-webkit-scrollbar-thumb { background-color: ${(props) => props.theme.colors.primary}80; }
`;

export const TimelineDateHeader = styled.div`
    display: flex;
    height: 36px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
    position: sticky;
    top: 0;
    background: ${(props) => props.theme.colors.surface};
    z-index: 5;
`;

export const DateCell = styled.div`
    width: 48px;
    min-width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed ${(props) => props.theme.colors.primary}22;
`;

export const DateNumber = styled.span`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const TimelineGraphContainer = styled.div`
    position: relative;
    min-height: 100%;
`;

export const TimelineBackground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    display: flex;
    z-index: 1;
`;

export const TimelineVerticalLine = styled.div`
    width: 48px;
    min-width: 48px;
    border-right: 1px dashed ${(props) => props.theme.colors.primary}22;
`;

export const DependencySvg = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    overflow: visible;
`;

export const DependencyLine = styled.path`
    fill: none;
    stroke: ${(props) => props.theme.colors.primary};
    stroke-width: 1.5;
    opacity: 0.8;
`;

export const TaskNode = styled.div<{ $left: number; $top: number; $width: number; $status?: string }>`
    position: absolute;
    top: ${(props) => props.$top + 10}px;
    left: ${(props) => props.$left}px;
    width: ${(props) => props.$width}px;
    height: 28px;
    background: ${(props) => props.$status === 'done' ? props.theme.colors.primary + '33' : props.theme.colors.primary + '99'};
    border: 1px solid ${(props) => props.$status === 'done' ? props.theme.colors.primary + '66' : props.theme.colors.primary};
    border-radius: 4px;
    color: ${(props) => props.$status === 'done' ? props.theme.colors.textSecondary : props.theme.colors.background};
    text-decoration: ${(props) => props.$status === 'done' ? 'line-through' : 'none'};
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: pointer;
    z-index: 3;
    transition: all 0.2s;
    &:hover {
        background: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.background};
        text-decoration: none;
    }
`;

export const TaskNodeText = styled.span`
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: visible;
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

export const ModalForm = styled.form`
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    padding: 25px;
    width: 420px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    border-radius: 4px;
`;

export const ModalHeading = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text};
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}55;
    padding-bottom: 10px;
`;

export const FormRow = styled.div`
    display: flex;
    gap: 15px;
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
`;

export const FormLabel = styled.label`
    font-size: 0.8rem;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const FormInput = styled.input`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    border-radius: 4px;
    padding: 8px;
    color: ${(props) => props.theme.colors.text};
    outline: none;
    font-size: 0.85rem;
    &:focus {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const FormSelect = styled.select`
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    border-radius: 4px;
    padding: 8px;
    color: ${(props) => props.theme.colors.text};
    outline: none;
    font-size: 0.85rem;
    &:focus {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const FormSelectMultiple = styled(FormSelect)`
    height: 75px;
`;

export const FormOption = styled.option`
    background: ${(props) => props.theme.colors.surface};
    color: ${(props) => props.theme.colors.text};
`;

export const FormTextArea = styled.textarea`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    border-radius: 4px;
    padding: 8px;
    color: ${(props) => props.theme.colors.text};
    outline: none;
    resize: none;
    height: 60px;
    font-size: 0.85rem;
    &:focus {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const FormHintText = styled.span`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
`;

// --- Custom Participant Picker Styles (아바타 이미지 제거됨) ---
export const ParticipantPicker = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    padding: 8px;
    border-radius: 4px;
    background: transparent;
    min-height: 44px;
    max-height: 100px;
    overflow-y: auto;
`;

export const ParticipantItem = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 16px;
    border: 1px solid ${(props) => props.$selected ? props.theme.colors.primary : props.theme.colors.primary + '40'};
    background: ${(props) => props.$selected ? props.theme.colors.primary + '22' : 'transparent'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const ParticipantName = styled.span`
    font-size: 0.75rem;
    color: ${(props) => props.theme.colors.text};
`;