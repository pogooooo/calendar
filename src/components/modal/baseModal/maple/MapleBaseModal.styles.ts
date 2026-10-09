/**
 * Maple 의 창 틀 — 종이 한 장 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 테두리 대신 먹 하이라인 두 겹(색인 카드의 괘선). 폰에서는 아래에서 올라오는 시트 — 위 가장자리를 찢은 종이(J6).
 */
import styled from "styled-components";
import type { MotionProps } from "framer-motion";
import * as C from "../celestial/CelestialBaseModal.styles";
import { withAlpha } from "@/styles/color";
import { hair, tornTop } from "@/styles/maple/ink";

export * from "../celestial/CelestialBaseModal.styles";

type ModalMotion = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;

/**
 * BaseModal 이 받아 쓰는 몸짓(데스크톱 창) — 가운데서 커지는 기본 몸짓 대신 종이 한 장을 책상에 내려놓듯:
 * 살짝 기운 채 아래에서 내려앉아 바로 서고, 닫을 때는 반대로 기울며 들려 나간다. 폰 창은 뼈대의 올라오는 시트(위가 찢긴 종이)
 */
export const modalMotion: { desktop: ModalMotion } = {
    desktop: {
        initial: { opacity: 0, y: 26, rotate: -1.4, scale: 0.985 },
        animate: { opacity: 1, y: 0, rotate: 0, scale: 1 },
        exit: { opacity: 0, y: 12, rotate: 0.9, scale: 0.99, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
        transition: { default: { type: "spring", damping: 22, stiffness: 260 }, opacity: { duration: 0.18 } },
    },
};

export const Overlay = styled(C.Overlay)`
    background-color: ${(p) => withAlpha(p.theme.mode === "dark" ? "#000000" : "#3B2A20", p.theme.mode === "dark" ? 0.6 : 0.35)};
`;

export const Container = styled(C.Container)`
    border-color: ${(p) => hair(p.theme, 0.5)};
    border-radius: 2px;
    box-shadow: 0 0 0 4px ${(p) => p.theme.colors.surface}, 0 0 0 5px ${(p) => hair(p.theme, 0.16)}, 0 18px 40px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.55 : 0.25)};

    @media (max-width: 768px) {
        border-radius: 0;
        border-top: none;
        box-shadow: none;
        padding-top: 8px;
        ${tornTop("26px")}
    }
`;
