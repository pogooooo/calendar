/**
 * 바다의 저장 실패 알림 — 붉은 실선 띠(Celestial), 종이 위 붉은 띠(Maple) 대신 **알림 토스트**:
 * 떠 있는 흰 판(12px 모서리)에 산호색 경고 아이콘 하나, 13px 글, 오른쪽에 작은 글자 단추 닫기.
 * 아래에서 살짝 떠오르며 나타난다(한 번). 데스크톱에서는 아래 가운데의 독 바로 위, 폰에서는 알약 탭바 위에 화면 폭으로.
 */
import styled, { keyframes } from "styled-components";
import * as C from "../celestial/CelestialSaveFailureNotice.styles";
import { EASE, surface } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { ghostIcon } from "@/components/modal/baseModal/ocean/oceanLayer";
import { ABOVE_DOCK } from "@/components/sideBar/ocean/oceanShell";

export * from "../celestial/CelestialSaveFailureNotice.styles";

/** 가운데 맞춤(translateX -50%)을 지키며 떠오른다 */
const toastIn = keyframes`
    from { opacity: 0; transform: translate(-50%, 8px) scale(0.98); }
    to   { opacity: 1; transform: translate(-50%, 0); }
`;
const toastInFlat = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
`;

export const Bar = styled(C.Bar)`
    ${surface("float")}
    @media (min-width: 769px) { bottom: ${ABOVE_DOCK}px; }
    gap: 10px;
    padding: 10px 8px 10px 14px;
    border-radius: 12px;
    font-family: ${(p) => p.theme.fonts.body};

    svg { width: 16px; height: 16px; stroke-width: 1.75; color: ${(p) => p.theme.colors.error}; }

    .msg {
        font-size: 0.8125rem;
        line-height: 1.5;
        color: ${(p) => p.theme.colors.text};
        b { font-weight: 600; font-variant-numeric: tabular-nums; color: ${(p) => p.theme.colors.textSecondary}; }
    }

    button {
        ${ghostIcon("24px")}
        svg { width: 14px; height: 14px; color: currentColor; }
    }

    @media (prefers-reduced-motion: no-preference) {
        animation: ${toastIn} 0.24s ${EASE} both;
    }

    ${MOBILE} {
        @media (prefers-reduced-motion: no-preference) {
            animation: ${toastInFlat} 0.24s ${EASE} both;
        }
    }
`;
