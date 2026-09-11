import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 0 10px;

    /* 폰에서는 보드와 타임라인을 한 화면에 겹쳐 넣지 않고 세로로 늘어놓는다.
       그러려면 높이를 100% 로 못 박지 말고 내용만큼 자라게 둬야 한다. */
    ${MOBILE} {
        height: auto;
        min-height: 100%;
        /* main 의 아래 여백은 넘치는 내용 밑으로 따라오지 않는다. 여기서 직접 둔다. */
        padding: 0 0 16px;
    }
`;

export const ContentLayout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;

    ${MOBILE} {
        flex: none;
        gap: 12px;
    }
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

    /* 마우스로만 끄는 손잡이 */
    ${MOBILE} { display: none; }
`;