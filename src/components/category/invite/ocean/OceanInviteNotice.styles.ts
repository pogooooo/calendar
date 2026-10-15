/**
 * 카테고리 초대 알림(받는 사람)의 모양 — 업데이트 알림과 같은 쪽지를 쓰되 자리만 다르다(둘이 함께 떠도 겹치지 않게):
 * 데스크톱은 오른쪽 위(제목 줄 아래), 폰은 아래 탭바 위.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled from "styled-components";
import * as U from "@/components/update/ocean/OceanUpdateNotice.styles";
import { MOBILE, TAB_BAR_HEIGHT, SAFE_B } from "@/styles/breakpoints";

export * from "@/components/update/ocean/OceanUpdateNotice.styles";

export const Panel = styled(U.Panel)`
    top: 52px;
    bottom: auto;
    z-index: 600;

    ${MOBILE} {
        top: auto;
        bottom: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B} + 14px);
        left: 12px;
        right: 12px;
        width: auto;
    }
`;
