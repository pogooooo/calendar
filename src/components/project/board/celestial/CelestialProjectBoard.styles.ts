/**
 * ProjectBoardView 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import { TOUCH, MOBILE } from "@/styles/breakpoints";
import { SectionWrapper, SectionTitle } from "@/components/project/celestial/section";
export { SectionWrapper, SectionTitle };

export const BoardGrid = styled.div`
    display: flex;
    flex: 1;
    overflow-x: auto;
    background: transparent;

    /* 폰에서는 세 칸을 나란히 보여줄 폭이 없다. 한 칸씩 옆으로 넘긴다. */
    ${MOBILE} {
        scroll-snap-type: x mandatory;
        overscroll-behavior-x: contain;
    }
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

    ${MOBILE} {
        flex: 0 0 88%;
        min-width: 0;
        scroll-snap-align: start;
    }
`;

export const ColumnHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;

    ${MOBILE} { padding: 10px 12px; }
`;

export const ColumnTitle = styled.span`
    font-size: 0.8rem;
    color: ${(props) => props.theme.colors.textSecondary};
    font-family: ${(props) => props.theme.fonts.display};
`;

export const AddTaskButton = styled.button`
    flex: 0 0 auto;
    padding: 4px 10px;
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}66;
    color: ${(props) => props.theme.colors.primary};
    font-family: inherit;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}44;
    }

    ${MOBILE} {
        padding: 8px 14px;
        min-height: 34px;
        font-size: 0.75rem;

        &:active { background-color: ${(props) => props.theme.colors.primary}1F; }
    }
`;

export const CardList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const CardBox = styled.div<{ $isLocked?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.border};
    padding: 8px 10px;
    cursor: pointer;
    opacity: ${(props) => props.$isLocked ? 0.6 : 1};
    transition: background-color 0.2s, border-color 0.2s;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}80;
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}40;

        .action-group {
            opacity: 1;
            pointer-events: auto;
        }
    }
`;

export const CardMain = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
`;

export const CardTitle = styled.div<{ $isDone?: boolean }>`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-family: ${(props) => props.theme.fonts.body};
    font-size: ${(props) => props.theme.fontSizes.caption};
    font-weight: ${(props) => props.theme.fontWeights.medium};
    color: ${(props) => props.$isDone ? props.theme.colors.textSecondary : props.theme.colors.text};
    text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};
    line-height: 1.2;

    .title-text {
        flex: 1;
        word-break: keep-all;
    }
`;

export const PriorityTag = styled.span<{ $priority: string }>`
    font-size: 0.65rem;
    padding: 1px 4px;
    border: 1px solid;
    white-space: nowrap;
    color: ${(props) =>
            props.$priority === 'high' ? props.theme.colors.error :
                    props.$priority === 'low' ? props.theme.colors.textSecondary :
                            props.theme.colors.primary};
    border-color: ${(props) =>
            props.$priority === 'high' ? props.theme.colors.error :
                    props.$priority === 'low' ? props.theme.colors.textSecondary :
                            props.theme.colors.primary};
`;

export const LockedTag = styled.span`
    font-size: 0.65rem;
    color: ${(props) => props.theme.colors.textSecondary};
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.textSecondary};
    padding: 1px 4px;
    white-space: nowrap;
`;

export const CardMeta = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
`;

export const CardDate = styled.span`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const CardAssignees = styled.div`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    border-left: 1px solid ${(props) => props.theme.colors.border};
    padding-left: 8px;
`;

export const CardActionGroup = styled.div`
    display: flex;
    gap: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;

    ${TOUCH} {
        opacity: 1;
        pointer-events: auto;
    }
`;

export const CardMoveButton = styled.button`
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    font-size: 0.65rem;
    padding: 2px 6px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap;

    &:hover {
        box-shadow: 0 0 5px ${(props) => props.theme.colors.primary}66;
    }

    /* 33x22 는 손가락으로 못 누른다. */
    ${MOBILE} {
        font-size: 0.72rem;
        padding: 7px 12px;
        min-height: 34px;
    }
`;
