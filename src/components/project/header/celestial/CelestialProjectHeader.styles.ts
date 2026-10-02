/**
 * ProjectHeaderView 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const HeaderWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export const Header = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px 15px;
    margin-bottom: 15px;

    ${MOBILE} {
        gap: 8px 10px;
        margin-bottom: 10px;
    }
`;

export const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    min-width: 200px;

    /* 200px 을 요구하면 폰에서 단추 줄을 밀어내 두 줄로 흩어진다. */
    ${MOBILE} {
        gap: 10px;
        min-width: 0;
    }
`;

export const TitleText = styled.span`
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    white-space: nowrap;
`;

export const CategoryTag = styled.div<{ $color: string }>`
    font-size: 0.7rem;
    padding: 2px 8px;
    letter-spacing: 1px;
    color: ${(props) => props.$color};
    border: 1px solid ${(props) => props.$color};
    background-color: transparent;
    white-space: nowrap;
`;

export const HeaderLine = styled.hr`
    flex: 1;
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.primary};
    margin: 0;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
    flex-shrink: 0;
    margin-left: auto;

    ${MOBILE} {
        gap: 8px;
        width: 100%;
        & > * { flex: 1; }
    }
`;

export const HeaderActionButton = styled.button`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.8rem;
    letter-spacing: 1.5px;
    padding: 8px 18px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, box-shadow 0.2s;

    &:hover {
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}66;
    }

    ${MOBILE} {
        padding: 10px 8px;
        font-size: 0.75rem;
        letter-spacing: 1px;
    }
`;

export const TabContainer = styled.div`
    display: flex;
    gap: 10px;
    width: 100%;
    margin-bottom: 10px;
    overflow-x: auto;
    padding-bottom: 5px;

    /* 폰에서는 옆으로 미는 자리를 만들지 않는다 — 줄을 바꾸고, 많으면 두 줄까지만 보이고 그 아래로 굴린다 */
    ${MOBILE} {
        gap: 6px;
        flex-wrap: wrap;
        overflow-x: visible;
        overflow-y: auto;
        max-height: 84px;
        & > * { flex: 0 1 auto; max-width: 100%; }
    }
`;

export const Tab = styled.button.attrs({ type: 'button' })<{ $active: boolean }>`
    font: inherit;
    min-height: 36px;
    @media (max-width: 768px) { min-height: 44px; }
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid ${(props) => props.$active ? props.theme.colors.primary : `${props.theme.colors.primary}40`};
    box-shadow: ${(props) => props.$active ? `0 0 6px ${props.theme.colors.primary}55` : 'none'};
    padding: 6px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const TabText = styled.span`
    color: ${(props) => props.theme.colors.text};
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.85rem;
    white-space: nowrap;
`;
