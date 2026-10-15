/**
 * MapleEmptyArt 의 모양 — 글 위 가운데의 작은 동그라미 하나(단풍 붉음을 옅게), 안에 선 아이콘.
 * 글보다 앞서지 않게 작고 옅게.
 */
import styled from "styled-components";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export const Art = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    border-radius: 50%;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.14 : 0.08)};
    color: ${(p) => p.theme.colors.primary};

    /* 감싸는 쪽의 svg 규칙(크기·옅게)에 끌려가지 않게 */
    && svg {
        display: block;
        width: 24px;
        height: 24px;
        color: inherit;
        opacity: 0.9;
    }

    ${MOBILE} {
        width: 48px;
        height: 48px;
        margin-bottom: 10px;

        && svg { width: 22px; height: 22px; }
    }
`;
