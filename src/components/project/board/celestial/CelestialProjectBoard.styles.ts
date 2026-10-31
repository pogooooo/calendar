/**
 * ProjectBoardView 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { css } from "styled-components";
import { celestialOnly } from "@/styles/celestial/ornaments";
import { TOUCH, MOBILE } from "@/styles/breakpoints";
import { SectionWrapper, SectionTitle } from "@/components/project/celestial/section";
export { SectionWrapper, SectionTitle };

export const BoardGrid = styled.div`
    display: flex;
    flex: 1;
    overflow-x: auto;
    background: transparent;

    /* 폰에서는 고른 칸 하나만 그린다 — 옆으로 미는 화면이 없다 */
    ${MOBILE} {
        overflow-x: hidden;
    }
`;

/* 폰에서만 보이는 칸 고르개: 진행 전 · 진행 중 · 완료 */
export const ColumnPicker = styled.div`
    display: none;

    ${MOBILE} {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        padding: 8px 10px 4px;
        flex-shrink: 0;
    }
`;

export const ColumnPick = styled.button<{ $on: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 38px;
    ${MOBILE} { min-height:44px; font-family:${p => p.theme.fonts.body}; font-size:.82rem; letter-spacing:0; }
    padding: 6px 4px;
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.74rem;
    letter-spacing: 1px;
    color: ${(props) => (props.$on ? props.theme.colors.primary : props.theme.colors.textSecondary)};
    background: ${(props) => (props.$on ? `${props.theme.colors.primary}14` : "transparent")};
    border: 1px solid ${(props) => props.theme.colors.primary}${(props) => (props.$on ? "" : "33")};
    box-shadow: ${(props) => (props.$on ? `0 0 6px ${props.theme.colors.primary}44` : "none")};
    cursor: pointer;

    em {
        font-style: normal;
        font-size: 0.68rem;
        font-variant-numeric: tabular-nums;
        opacity: 0.8;
    }
`;

export const ColumnEmpty = styled.div`
    padding: 18px 12px;
    text-align: center;
    font-size: 0.78rem;
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: 0.8;
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

    /* 고른 한 칸이 화면을 다 쓴다 */
    ${MOBILE} {
        flex: 1;
        min-width: 0;
        border-right: none;
    }
`;

export const ColumnHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;

    /* 폰에서는 이름표가 위에 따로 있어 이 줄에는 "추가" 만 남는다 */
    ${MOBILE} {
        padding: 4px 12px 8px;
        justify-content: flex-end;
        border-bottom: none;
    }
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
    ${MOBILE} { flex:none; overflow:visible; padding:8px 10px 12px; }
`;

export const CardBox = styled.div<{ $isLocked?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: ${(props) => props.theme.colors.primary}0D;
    border: 1px solid ${(props) => props.theme.colors.primary}33;
    border-radius: 2px;
    padding: 8px 10px;
    cursor: pointer;
    opacity: ${(props) => props.$isLocked ? 0.6 : 1};
    transition: background-color 0.2s, border-color 0.2s;
    ${MOBILE} { min-height:86px; padding:12px; gap:10px; }

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}80;
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}40;

        .action-group {
            opacity: 1;
            pointer-events: auto;
        }
    }

    /* 자판으로 카드·옮기기 단추에 닿으면 올렸을 때처럼 단추가 보인다 (예전엔 초점이 보이지 않는 단추에 갔다) */
    &:focus-within .action-group {
        opacity: 1;
        pointer-events: auto;
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
    ${MOBILE} { font-size:.92rem; line-height:1.45; }
`;

export const PriorityTag = styled.span<{ $priority: string }>`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.66rem;
    padding: 0;
    border: none;
    white-space: nowrap;

    &::before {
        content: "";
        width: 5px;
        height: 5px;
        flex-shrink: 0;
        transform: rotate(45deg);
        background: currentColor;
    }

    color: ${(props) =>
            props.$priority === 'high' ? props.theme.colors.error :
                    props.$priority === 'low' ? props.theme.colors.textSecondary :
                            props.theme.colors.primary};
    border-color: ${(props) =>
            props.$priority === 'high' ? props.theme.colors.error :
                    props.$priority === 'low' ? props.theme.colors.textSecondary :
                            props.theme.colors.primary};

    /* Celestial: 마름모 대신 둥근 점 */
    ${celestialOnly(css`
        &::before { border-radius: 50%; transform: none; }
    `)}
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
        min-height: 44px;
    }
`;
