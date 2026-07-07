import styled from "styled-components";

export const BotanicalCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const LeafAccent = styled.span`
    display: inline-block;
    width: 10px;
    height: 14px;
    border-radius: 0 50% 0 50%;
    border: 1.5px solid ${(props) => props.theme.colors.primary};
    transform: rotate(-45deg);
    flex-shrink: 0;
`;

export const TwigDivider = styled.div`
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, ${(props) => props.theme.colors.primary}60, transparent);
`;

export const DateHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: 1rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
`;

export const ContentLayout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;

    @media (min-width: 768px) {
        flex-direction: row;
    }
`;

export const HResizer = styled.div`
    width: 15px;
    cursor: col-resize;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;

    .handle {
        width: 3px;
        height: 30px;
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
        transition: background-color 0.2s ease;
    }

    &:hover .handle {
        background-color: ${(props) => props.theme.colors.primary};
    }
`;

export const VResizer = styled.div`
    height: 15px;
    cursor: row-resize;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;

    .handle {
        height: 3px;
        width: 30px;
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
        transition: background-color 0.2s ease;
    }

    &:hover .handle {
        background-color: ${(props) => props.theme.colors.primary};
    }
`;

export const TimelineSection = styled.div.attrs<{ $flex: number }>(props => ({
    style: { flex: `${props.$flex} 1 0` }
}))<{ $flex: number }>`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    background-color: ${(props) => props.theme.colors.surface};
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(217, 207, 199, 0.3);

    .timeline-header {
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.textSecondary};
        padding: 8px 15px;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
        background-color: ${(props) => props.theme.colors.background};
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .add-header-btn {
            background: transparent;
            border: 1px solid ${(props) => props.theme.colors.border};
            color: ${(props) => props.theme.colors.primary};
            border-radius: 8px;
            padding: 4px 10px;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            &:hover {
                background-color: ${(props) => props.theme.colors.primary}18;
                border-color: ${(props) => props.theme.colors.primary};
            }
        }
    }
`;

export const TimelineScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const ChallengeRow = styled.div<{ $isSelected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px dashed ${(props) => props.theme.colors.border};
    cursor: pointer;
    background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}18` : 'transparent'};
    transition: background-color 0.2s ease;
    border-radius: 0 8px 8px 0;

    &:hover { background-color: ${(props) => props.theme.colors.primary}0E; }

    .challenge-info {
        flex: 1;
        .title {
            font-size: 1rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .desc {
            font-size: 0.8rem;
            color: ${(props) => props.theme.colors.textSecondary};
            margin-top: 4px;
        }
        .meta {
            font-size: 0.75rem;
            color: ${(props) => props.theme.colors.textSecondary};
            margin-top: 6px;
            font-family: ${(props) => props.theme.fonts.body};
        }
    }

    .challenge-progress {
        width: 130px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        .count {
            font-size: 0.75rem;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    }
`;

export const ProgressBar = styled.div<{ $progress: number, $catColor: string }>`
    width: 100%;
    height: 6px;
    background-color: ${(props) => props.theme.colors.border};
    border-radius: 0 3px 3px 0;
    overflow: hidden;

    .fill {
        height: 100%;
        width: ${(props) => props.$progress}%;
        background-color: ${(props) => props.$catColor};
        border-radius: 0 4px 4px 0;
        transition: width 0.3s ease;
    }
`;

export const SideSection = styled.div.attrs<{ $flex: number }>(props => ({
    style: { flex: `${props.$flex} 1 0` }
}))<{ $flex: number }>`
    display: flex;
    flex-direction: column;
    min-height: 250px;
`;

export const BaseCard = styled.div`
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 2px 2px 8px rgba(217, 207, 199, 0.3);

    .card-header {
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.textSecondary};
        padding: 8px 12px;
        border-bottom: 1px dashed ${(props) => props.theme.colors.border};
        background-color: ${(props) => props.theme.colors.background};
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
    }
`;

export const StickerBoardCard = styled(BaseCard).attrs<{ $flex: number }>(props => ({
    style: { flex: `${props.$flex} 1 0` }
}))<{ $flex: number }>`
    min-height: 100px;

    .sticker-content {
        flex: 1;
        display: flex;
        padding: 15px;
        overflow-y: auto;
        position: relative;

        .placeholder {
            margin: auto;
            font-size: 0.85rem;
            color: ${(props) => props.theme.colors.textSecondary};
        }

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb {
            background-color: ${(props) => props.theme.colors.border};
            border-radius: 2px;
        }
    }
`;

export const StickerGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-content: flex-start;
    width: 100%;
`;

export const StickerSlot = styled.div`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;

export const TaskCard = styled(BaseCard).attrs<{ $flex: number }>(props => ({
    style: { flex: `${props.$flex} 1 0` }
}))<{ $flex: number }>`
    min-height: 100px;
    overflow-y: auto;
`;

export const DetailArea = styled.div`
    padding: 15px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .placeholder {
        margin: auto;
        font-size: 0.85rem;
        color: ${(props) => props.theme.colors.textSecondary};
    }

    .detail-content {
        display: flex;
        flex-direction: column;
        gap: 12px;

        h3 { margin: 0; color: ${(props) => props.theme.colors.text}; font-size: 1.1rem; }
        p { margin: 0; color: ${(props) => props.theme.colors.textSecondary}; font-size: 0.9rem; }

        .stats {
            background-color: ${(props) => props.theme.colors.background};
            padding: 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            color: ${(props) => props.theme.colors.text};
            display: flex;
            flex-direction: column;
            gap: 8px;
            border: 1px solid ${(props) => props.theme.colors.border};
        }

        .actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: auto;
            padding-top: 10px;

            .sub-actions {
                display: flex;
                gap: 10px;
            }
        }
    }
`;
