import styled from "styled-components";

export const ChallengeRecords = styled.div`
    width: 100%;
    .records-hint {
        margin: 0 0 16px;
        color: ${p => p.theme.colors.textSecondary};
        font-size: 0.8rem;
        line-height: 1.6;
    }
    .record-slot {
        flex-shrink: 0;
        min-width: 48px;
        min-height: 48px;
        border: 0;
        padding: 0;
        margin: 0 0 20px;
        font: inherit;
        color: ${p => p.theme.colors.text};
        cursor: pointer;
    }
    .record-slot:focus-visible {
        outline: 2px solid ${p => p.theme.colors.primary};
        outline-offset: 3px;
    }
    .record-slot:hover:enabled {
        box-shadow: 0 0 0 2px ${p => p.theme.colors.primary};
    }
    .record-slot:disabled { opacity: 0.45; cursor: default; }
    .record-slot[data-outline-recordable]:disabled { opacity: 1; }
    .record-date {
        position: absolute;
        top: calc(100% + 3px);
        left: 0;
        width: 100%;
        text-align: center;
        font-size: 0.7rem;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }
`;
