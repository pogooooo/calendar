import styled from "styled-components";

export const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
`;

export const DateHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;

    & > hr {
        flex: 1;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        margin: 0;
    }
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
        background-color: ${(props) => props.theme.colors.primary}55;
        border-radius: 2px;
        transition: background-color 0.2s;
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
        background-color: ${(props) => props.theme.colors.primary}55;
        border-radius: 2px;
        transition: background-color 0.2s;
    }

    &:hover .handle {
        background-color: ${(props) => props.theme.colors.primary};
    }
`;

export const TimelineSection = styled.div.attrs<{ $flex: number }>(props => ({
    style: { flex: `${props.$flex} 1 0` }
}))<{ $flex: number }>`
    flex: ${(props) => props.$flex};
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.surface};

    .timeline-header {
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.textSecondary};
        padding: 8px 15px;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};
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
            border: 1px solid ${(props) => props.theme.colors.primary};
            color: ${(props) => props.theme.colors.primary};
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transition: all 0.2s;
            &:hover { background-color: ${(props) => props.theme.colors.primary}22; }
        }
    }
`;

export const TimelineScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const ChallengeRow = styled.div<{ $isSelected: boolean, $catColor: string }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
    border-left: 4px solid ${(props) => props.$catColor};
    cursor: pointer;
    background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}1A` : 'transparent'};
    transition: background-color 0.2s;

    &:hover { background-color: ${(props) => props.theme.colors.primary}22; }

    .challenge-info {
        flex: 1;
        .title {
            font-size: 1rem;
            color: ${(props) => props.theme.colors.text};
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            .star-icon { filter: drop-shadow(0 0 3px gold); }
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
            font-family: ${(props) => props.theme.fonts.celestial};
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
            font-family: ${(props) => props.theme.fonts.celestial};
        }
    }
`;

export const ProgressBar = styled.div<{ $progress: number, $catColor: string }>`
    width: 100%;
    height: 6px;
    background-color: ${(props) => props.theme.colors.primary}33;
    border-radius: 3px;
    overflow: hidden;

    .fill {
        height: 100%;
        width: ${(props) => props.$progress}%;
        background-color: ${(props) => props.$catColor};
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
    border: 1px solid ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .card-header {
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.textSecondary};
        padding: 8px 12px;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};
        background-color: ${(props) => props.theme.colors.primary}0D;
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

        .placeholder {
            margin: auto;
            font-size: 0.85rem;
            color: ${(props) => props.theme.colors.textSecondary}80;
        }

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb {
            background-color: ${(props) => props.theme.colors.primary}80;
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
        color: ${(props) => props.theme.colors.textSecondary}80;
    }

    .detail-content {
        display: flex;
        flex-direction: column;
        gap: 12px;

        h3 { margin: 0; color: ${(props) => props.theme.colors.text}; font-size: 1.1rem; }
        p { margin: 0; color: ${(props) => props.theme.colors.textSecondary}; font-size: 0.9rem; }

        .stats {
            background-color: ${(props) => props.theme.colors.primary}0D;
            padding: 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            color: ${(props) => props.theme.colors.text};
            display: flex;
            flex-direction: column;
            gap: 8px;
            border: 1px dashed ${(props) => props.theme.colors.primary}40;
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