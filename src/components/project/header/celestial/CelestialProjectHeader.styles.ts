/**
 * ProjectHeaderView 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { gilt, sheen } from "@/styles/celestial/almanac";

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
    letter-spacing: 0.06em;
    white-space: nowrap;
`;

export const CategoryTag = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 0.74rem;
    color: ${(props) => props.theme.colors.textSecondary};
    white-space: nowrap;

    &::before {
        content: "";
        width: 6px;
        height: 6px;
        flex-shrink: 0;
        transform: rotate(45deg);
        background: ${(props) => props.$color};
    }
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
    letter-spacing: 0.04em;
    padding: 8px 18px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, box-shadow 0.2s;

    &:hover {
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}66;
    }

    /* 마지막(새 프로젝트)이 이 줄의 할 일 — 금빛으로 채운다 */
    &:last-child {
        ${gilt}
        ${sheen}
    }

    ${MOBILE} {
        padding: 10px 8px;
        font-size: 0.75rem;
        letter-spacing: 0.02em;
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
    position: relative;
    background: transparent;
    /* 상자 꼬리표가 금빛 상자 줄을 하나 더 만들었다 — 밑줄 하나와, 고른 것엔 가운데 작은 마름모 */
    border: none;
    border-bottom: 1px solid ${(props) => props.$active ? props.theme.colors.primary : `${props.theme.colors.primary}33`};
    color: ${(props) => props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};
    padding: 6px 12px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -3.5px;
        width: 6px;
        height: 6px;
        margin-left: -3px;
        background: ${(props) => props.theme.colors.primary};
        transform: rotate(45deg) scale(${(props) => (props.$active ? 1 : 0)});
        transition: transform 0.2s ease;
    }

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.text};
    }
`;

export const TabText = styled.span`
    color: inherit;
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.85rem;
    white-space: nowrap;
`;
