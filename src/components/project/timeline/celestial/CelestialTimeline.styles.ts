import styled from "styled-components";

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

export const TimelineContent = styled.div`
    display: flex;
    flex-direction: column;
    min-width: max-content; /* 내부 컨텐츠 크기에 맞게 부모를 강제로 늘려 스크롤 생성 */
    min-height: 100%;
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
    border-right: 1px dashed ${(props) => props.theme.colors.primary}22;
    background-color: ${(props) => props.$isToday ? props.theme.colors.primary + '11' : 'transparent'};
`;

export const DateCell = styled.div<{ $isToday?: boolean }>`
    width: 48px;
    min-width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed ${(props) => props.theme.colors.primary}22;
    background-color: ${(props) => props.$isToday ? props.theme.colors.primary + '11' : 'transparent'};
`;

export const DateNumber = styled.span<{ $isToday?: boolean }>`
    font-size: 0.7rem;
    color: ${(props) => props.$isToday ? props.theme.colors.primary : props.theme.colors.textSecondary};
    font-weight: ${(props) => props.$isToday ? 'bold' : 'normal'};
    ${(props) => props.$isToday && `
        filter: drop-shadow(0 0 4px ${props.theme.colors.primary}80);
    `}
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

export const TaskNode = styled.div<{ $left: number; $top: number; $width: number; $status?: string; $isDragging?: boolean }>`
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
    
    cursor: ${(props) => props.$isDragging ? 'grabbing' : 'grab'};
    z-index: ${(props) => props.$isDragging ? 10 : 3};
    opacity: ${(props) => props.$isDragging ? 0.8 : 1};
    box-shadow: ${(props) => props.$isDragging ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'};
    transition: ${(props) => props.$isDragging ? 'none' : 'box-shadow 0.2s, background 0.2s, left 0.1s ease-out'};

    &:hover {
        background: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.surface};
        text-decoration: none;
    }
`;

export const TaskNodeText = styled.span`
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: visible;
    user-select: none;
`;

export const TaskResizeHandle = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    transition: background-color 0.2s;
    border-radius: 0 4px 4px 0;

    &:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
`;