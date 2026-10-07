/**
 * 바다의 창 틀 — 금빛 실선 상자(Celestial), 종이 한 장(Maple) 대신 **장식 없는 흰 판**.
 *   바탕: 옅게 어두워지는 장막 + 약한 흐림 / 판: surface("float"), 모서리 16px, 선은 머리카락 하나, 그림자는 멀고 옅게
 *   몸짓은 뼈대(framer-motion)의 것 그대로 — 살짝 커지며 떠오르고, 닫히면 가라앉는다
 *   빠른 이동(Ctrl+K)은 명령 창처럼 화면 위쪽 1/7 자리에 뜬다
 *   폰: 아래에서 올라오는 시트 — 위 모서리만 16px
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialBaseModal.styles";
import { hairline, surface } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { veil } from "./oceanLayer";

export * from "../celestial/CelestialBaseModal.styles";

export const Overlay = styled(C.Overlay)`
    ${veil}

    /* 명령 창(빠른 이동)은 가운데가 아니라 위쪽에 — 결과가 늘고 줄어도 입력줄이 제자리에 있다 */
    @media (min-width: 769px) {
        &:has(#quick-navigation-results) {
            align-items: flex-start;
            padding-top: 14vh;
        }
    }
`;

export const Container = styled(C.Container)`
    ${surface("float")}
    border-radius: 16px;

    ${MOBILE} {
        border: none;
        border-top: 1px solid ${(p) => hairline(p.theme, true)};
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -12px 40px -16px ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(18, 33, 32, 0.28)")};
    }
`;
