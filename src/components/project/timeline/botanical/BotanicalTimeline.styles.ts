import styled from "styled-components";

export const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 150px;
    overflow: hidden;
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.surface};
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(217, 207, 199, 0.3);
`;

export const SectionTitle = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: 0.9rem;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 8px 12px;
    border-bottom: 1px dashed ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
    border-radius: 10px 10px 0 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50% 50% 50% 0;
        background: ${(props) => props.theme.colors.primary}80;
        transform: rotate(-45deg);
        flex-shrink: 0;
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
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const TimelineContent = styled.div`
    display: flex;
    flex-direction: column;
    min-width: max-content;
    min-height: 100%;
`;

export const TimelineDateHeader = styled.div`
    display: flex;
    height: 36px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}55;
    position: sticky;
    top: 0;
    background: ${(props) => props.theme.colors.surface};
    z-index: 5;
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

export const TimelineVerticalLine = styled.div<{ $isToday?: boolean }>`
    width: 48px;
    min-width: 48px;
    border-right: 1px dashed ${(props) => props.theme.colors.border}44;
    background-color: ${(props) => props.$isToday ? props.theme.colors.primary + '0E' : 'transparent'};
`;

export const TimelineLeafNode = styled.div`
    width: 12px;
    height: 16px;
    border-radius: 0 50% 0 50%;
    border: 1.5px solid ${(props) => props.theme.colors.primary};
    transform: rotate(-45deg);
    flex-shrink: 0;
    background: ${(props) => props.theme.colors.background};
    position: relative;
    z-index: 1;
`;

export const DateCell = styled.div<{ $isToday?: boolean }>`
    width: 48px;
    min-width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid ${(props) => props.theme.colors.border}44;
    background-color: ${(props) => props.$isToday ? props.theme.colors.primary + '0E' : 'transparent'};
`;

export const DateNumber = styled.span<{ $isToday?: boolean }>`
    font-size: 0.7rem;
    color: ${(props) => props.$isToday ? props.theme.colors.primary : props.theme.colors.textSecondary};
    font-weight: ${(props) => props.$isToday ? '600' : 'normal'};
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
    opacity: 0.5;
`;

export const TaskNode = styled.div<{ $status?: string; $isDragging?: boolean }>`
    position: absolute;
    height: 28px;
    background: ${(props) => props.$status === 'done' ? props.theme.colors.primary + '22' : props.theme.colors.primary + 'BB'};
    border: 1px solid ${(props) => props.$status === 'done' ? props.theme.colors.primary + '44' : props.theme.colors.primary};
    border-left: 3px solid ${(props) => props.$status === 'done' ? props.theme.colors.primary + '44' : props.theme.colors.primary};
    border-radius: 0 8px 8px 0;
    color: ${(props) => props.$status === 'done' ? props.theme.colors.textSecondary : props.theme.colors.background};
    text-decoration: ${(props) => props.$status === 'done' ? 'line-through' : 'none'};
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: ${(props) => props.$isDragging ? 'grabbing' : 'grab'};
    z-index: ${(props) => props.$isDragging ? 10 : 3};
    opacity: ${(props) => props.$isDragging ? 0.85 : 1};
    box-shadow: ${(props) => props.$isDragging ? '0 4px 16px rgba(217, 207, 199, 0.5)' : 'none'};
    will-change: transform;
    transition: ${(props) => props.$isDragging ? 'none' : 'box-shadow 0.2s ease, background 0.2s ease'};

    &:hover {
        background: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.background};
        text-decoration: none;
        box-shadow: 0 2px 8px rgba(217, 207, 199, 0.4);
    }
`;

export const TaskNodeText = styled.span`
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: visible;
    user-select: none;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const TaskResizeHandle = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    transition: background-color 0.2s ease;
    border-radius: 0 6px 6px 0;

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
`;
