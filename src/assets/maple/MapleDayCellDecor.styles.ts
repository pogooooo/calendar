/**
 * MapleDayCellDecor 의 모양 — 그날 챌린지를 해낸 정도(1~3)를 칸 왼쪽 위의 작은 단풍잎 하나로.
 * 잎이 물드는 차례 그대로: 1단계 옅은 노랑, 2단계 호박빛, 3단계(다 해냄) 단풍 붉음.
 * (Celestial: 금빛 틀, Ocean: 칸 바닥의 청록 선. 예전 Maple 의 황토 물은 고른 날의 붉은 물과 겹쳐 어수선했다)
 * 날짜는 칸의 오른쪽 위에 있으므로 왼쪽 위가 비어 있다 — 마우스를 올리면 그 자리에 + 단추가 덮인다.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { leafChip } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export const appear = keyframes`
    from { opacity: 0; transform: scale(0.6) rotate(-20deg); }
    to { opacity: 1; transform: none; }
`;

export const Leaf = styled.span<{ $level: number }>`
    position: absolute;
    /* 날짜 줄(위 4px + 24px)의 가운데에 */
    top: 10px;
    left: 9px;
    z-index: 0;
    pointer-events: none;
    ${leafChip(5, "11px")}
    background-color: ${(p) => (p.$level >= 3
        ? p.theme.colors.primary
        : withAlpha(p.theme.colors.accent, p.$level >= 2 ? 1 : 0.5))};

    :where(html:not([data-theme-motion="off"])) & {
        animation: ${appear} 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) both;
    }

    ${MOBILE} {
        top: 10px;
        left: 5px;
        width: 8px;
        height: 8px;
    }

    /* 낮은 위젯 창은 왼쪽 위에 할 일 개수 표가 선다 — 그 옆으로 비킨다 */
    @media (max-height: 420px) {
        [data-widget] & { top: 11px; left: 23px; width: 10px; height: 10px; }
    }
`;
