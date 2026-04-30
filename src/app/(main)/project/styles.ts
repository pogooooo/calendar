import styled, { css } from "styled-components";

export const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 0 10px;
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