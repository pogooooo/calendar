/**
 * Maple 의 창 틀 — 깨끗한 카드 한 장 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 먹 하이라인 두 겹(색인 카드 괘선)·2px 모서리·폰의 찢은 종이 위 가장자리를 걷고,
 * 18px 모서리의 카드에 옅은 선과 깊고 부드러운 그림자. 폰에서는 위 모서리만 둥근 시트(mapleLayer).
 */
import styled from "styled-components";
import type { MotionProps } from "framer-motion";
import * as C from "../celestial/CelestialBaseModal.styles";
import { MOBILE } from "@/styles/breakpoints";
import { hair } from "@/styles/maple/ink";
import { floatLine, floatShadow, sheetShadow, veil } from "./mapleLayer";

export * from "../celestial/CelestialBaseModal.styles";

type ModalMotion = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;

/**
 * BaseModal 이 받아 쓰는 몸짓(데스크톱 창) — 살짝 아래에서 떠오르며 바로 선다. 닫을 때는 짧게 가라앉는다.
 * 예전의 "종이를 기울여 내려놓기"는 걷었다(기울임이 장식처럼 보였다). 폰 창은 뼈대의 올라오는 시트.
 */
export const modalMotion: { desktop: ModalMotion } = {
    desktop: {
        initial: { opacity: 0, y: 14, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.985, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
        transition: { default: { type: "spring", damping: 28, stiffness: 340 }, opacity: { duration: 0.16 } },
    },
};

export const Overlay = styled(C.Overlay)`${veil}`;

export const Container = styled(C.Container)`
    border: 1px solid ${(p) => floatLine(p.theme)};
    border-radius: 18px;
    box-shadow: ${(p) => floatShadow(p.theme)};
    backdrop-filter: none;

    /* 열릴 때 초점을 창에 옮겨 두는데(BaseModal), 그 초점에 붉은 테를 두르지 않는다 — 안의 칸이 제 초점을 그린다 */
    &:focus, &:focus-visible { outline: none; }

    ${MOBILE} {
        border: none;
        border-top: 1px solid ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.12 : 0.06)};
        border-radius: 20px 20px 0 0;
        box-shadow: ${(p) => sheetShadow(p.theme)};
    }
`;
