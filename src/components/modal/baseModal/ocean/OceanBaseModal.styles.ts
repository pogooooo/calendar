/**
 * 바다의 창 틀 — 가운데 뜨는 상자(Celestial 금빛 실선 상자, Maple 종이 한 장) 대신 **오른쪽에서 밀려 들어오는 유리 시트**.
 *   데스크톱: 창 높이를 다 쓰는 440px 시트가 오른쪽 가장자리에서 10px 떨어져 뜬다(모서리 24px). 뒤 화면은 옅게 어두워지고
 *     흐려진다. 들고 날 때 오른쪽으로 미끄러진다. 서식 창들은 시트 높이를 다 채운다(머리는 위, 몸통이 굴러가고, 단추 줄은 바닥 —
 *     oceanLayer 의 sheetFill). 키 작은 창(520px 이하)은 뼈대의 "한 덩어리로 굴리고 단추 줄은 붙는다"를 그대로 쓴다.
 *   빠른 이동(Ctrl+K)만은 명령 창이라 화면 위쪽 가운데에 그대로 — 살짝 떠오르며 나타난다.
 *   폰: 아래에서 올라오는 시트 — 위 모서리 24px (몸짓은 뼈대의 것)
 *
 * 움직임은 BaseModal 이 갈래에서 받는 값(modalMotion)이 --enter·--veil(0→1)을 움직이고, 모양은 여기 CSS 가 그 값으로 정한다
 * (시트는 옆으로, 명령 창은 위로). 장막은 투명도(opacity)가 아니라 색·흐림 값으로 나타난다 — 투명도가 움직이는 막 안에서는
 * 시트의 흐림(backdrop-filter)이 뒤 화면을 못 보고 막 색만 흐린다. 같은 까닭으로 막의 흐림도 ::before 가 맡는다(oceanLayer.veil).
 */
import styled from "styled-components";
import type { MotionProps } from "framer-motion";
import * as C from "../celestial/CelestialBaseModal.styles";
import { hairline } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { SHEET, sheetGlass, veil } from "./oceanLayer";

export * from "../celestial/CelestialBaseModal.styles";

type ModalMotion = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

/** BaseModal 이 받아 쓰는 몸짓 — 데스크톱 창은 --enter, 장막은 --veil 을 0↔1 로 (폰 창은 뼈대의 올라오는 몸짓) */
export const modalMotion: { desktop: ModalMotion; overlay: ModalMotion } = {
    desktop: {
        initial: { "--enter": 0 },
        animate: { "--enter": 1 },
        exit: { "--enter": 0, transition: { duration: 0.22, ease: EASE_IN } },
        transition: { duration: 0.42, ease: EASE_OUT },
    },
    overlay: {
        initial: { "--veil": 0 },
        animate: { "--veil": 1 },
        exit: { "--veil": 0, transition: { duration: 0.22, ease: "easeIn" } },
        transition: { duration: 0.3, ease: "easeOut" },
    },
};

/** 명령 창(빠른 이동)인가 — 결과 목록이 늘 들어 있다 */
const PALETTE = ":has(#quick-navigation-results)";

export const Overlay = styled(C.Overlay)`
    ${veil}

    ${SHEET} {
        /* 시트 — 오른쪽 가장자리에 붙여 세로로 다 채운다 */
        &:not(${PALETTE}) {
            justify-content: flex-end;
            align-items: stretch;
            padding: 10px;
        }
        /* 데스크톱 앱은 맨 위 제목 줄(36px, 창 단추) 밑에서 시작한다 */
        html:has([data-tauri-drag-region]) &:not(${PALETTE}) { padding-top: 46px; }
        /* 명령 창은 가운데가 아니라 위쪽에 — 결과가 늘고 줄어도 입력줄이 제자리에 있다 */
        &${PALETTE} {
            align-items: flex-start;
            padding-top: 14vh;
        }
    }
`;

export const Container = styled(C.Container)`
    ${sheetGlass}
    border-radius: 16px;

    ${SHEET} {
        &:not(${PALETTE}) {
            width: min(440px, 100%);
            max-width: none;
            max-height: none;
            border-radius: 24px;
            /* 오른쪽 밖(시트 폭 + 여백)에서 미끄러져 들어온다 */
            transform: translateX(calc((1 - var(--enter, 1)) * (100% + 16px)));
        }
        &${PALETTE} {
            border-radius: 16px;
            opacity: var(--enter, 1);
            transform: translateY(calc((1 - var(--enter, 1)) * 8px)) scale(calc(0.985 + 0.015 * var(--enter, 1)));
        }
        /* 움직임을 끈 사람에게는 미끄러지지 않고 제자리에 (위 두 규칙과 같은 모양이어야 세기에서 이긴다 — :has(#…) 는 id 세기) */
        html[data-theme-motion="off"] &:not(${PALETTE}),
        html[data-theme-motion="off"] &${PALETTE} { transform: none; opacity: 1; }
    }

    ${MOBILE} {
        border: none;
        border-top: 1px solid ${(p) => hairline(p.theme, true)};
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -12px 40px -16px ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(18, 33, 32, 0.28)")};
    }
`;
