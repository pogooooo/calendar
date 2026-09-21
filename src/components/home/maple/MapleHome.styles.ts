/**
 * Maple 의 홈 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 마름모·✦ 는 잎·문장 마스크로, 실선은 먹으로.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialHome.styles";
import { withAlpha } from "@/styles/color";
import { crest, leafBullet, shortRule } from "@/styles/maple/ink";

export * from "../celestial/CelestialHome.styles";

/** 카드 틀: 먹선 하나에 안쪽 옅은 선 */
export const Card = styled(C.Card)`
    border-color: ${(p) => withAlpha(p.theme.colors.text, 0.35)};

    &::before {
        border-color: ${(p) => withAlpha(p.theme.colors.text, 0.12)};
    }
`;

export const ArchFoot = styled(C.ArchFoot)`
    border-top-color: ${(p) => withAlpha(p.theme.colors.text, 0.28)};

    .center {
        letter-spacing: 0.08em;
        font-size: 0.86rem;
    }

    .center i {
        ${crest("11px")}
        color: ${(p) => p.theme.colors.primary};
        font-size: 0;
    }
`;

export const SectionHead = styled(C.SectionHead)`
    letter-spacing: 0.1em;
    font-size: 0.8rem;

    .hd {
        ${leafBullet(false, "11px")}
        color: ${(p) => p.theme.colors.primary};
    }

    .hr {
        background: ${(p) => withAlpha(p.theme.colors.text, 0.22)};
    }
`;

/** 빠른 추가의 카테고리 점 → 잎 (색은 인라인 style 로 온다) */
export const QuickForm = styled(C.QuickForm)`
    .dot {
        ${leafBullet(true, "12px")}
        border-radius: 0;
    }
`;

export const Mark = styled(C.Mark)`
    ${(p) => leafBullet(p.$on, "12px")}
    color: ${(p) => p.theme.colors.primary};
    opacity: ${(p) => (p.$on ? 1 : 0.85)};
`;

export const Row = styled(C.Row)`
    border-bottom-color: ${(p) => withAlpha(p.theme.colors.text, 0.14)};
`;

export const Pillar = styled(C.Pillar)`
    border-left-color: ${(p) => withAlpha(p.theme.colors.text, 0.22)};

    @media (max-width: 900px) {
        border-top-color: ${(p) => withAlpha(p.theme.colors.text, 0.22)};
    }
`;

/** 기둥 위의 ✦ → 씨앗 셋이 달린 짧은 먹선 */
export const Crest = styled(C.Crest)`
    font-size: 0;
    ${shortRule("16px")}
    color: ${(p) => p.theme.colors.text};
    opacity: 0.8;
`;

export const PillarHead = styled(C.PillarHead)`
    letter-spacing: 0.1em;
    font-size: 0.8rem;

    .idx {
        border-color: ${(p) => withAlpha(p.theme.colors.text, 0.35)};
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.66rem;
        letter-spacing: 0.08em;
    }

    .rule {
        background: ${(p) => withAlpha(p.theme.colors.text, 0.22)};
    }

    &:hover .rule { background: ${(p) => p.theme.colors.primary}; }
`;

/** 챌린지 이레 칸: 잎 */
export const Slot = styled(C.Slot)`
    ${(p) => leafBullet(p.$on, "11px")}
    color: ${(p) => p.theme.colors.primary};
    opacity: ${(p) => (p.$on ? 1 : p.$today ? 0.9 : 0.55)};
    ${(p) => p.$today && !p.$on && css`filter: drop-shadow(0 0 2px ${withAlpha(p.theme.colors.primary, 0.6)});`}

    &:hover { box-shadow: none; opacity: 1; }

    @media (max-width: 768px) {
        width: auto;
        height: 30px;
        mask: none;
        -webkit-mask: none;
        background-color: transparent;
        filter: none;

        &::after {
            ${(p) => leafBullet(p.$on, "13px")}
            background-color: ${(p) => p.theme.colors.primary};
            opacity: ${(p) => (p.$on ? 1 : p.$today ? 0.9 : 0.55)};
        }
    }
`;

/** 기념일 줄의 ✦ → 잎 문장 */
export const AnniversaryRow = styled(C.AnniversaryRow)`
    border-bottom-color: ${(p) => withAlpha(p.theme.colors.text, 0.14)};

    .star {
        ${crest("11px")}
        font-size: 0;
        color: ${(p) => p.theme.colors.primary};
    }

    em {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.78rem;
        letter-spacing: 0.04em;
    }
`;

export const ProjectRow = styled(C.ProjectRow)`
    border-bottom-color: ${(p) => withAlpha(p.theme.colors.text, 0.14)};
`;

export const ChallengeRow = styled(C.ChallengeRow)`
    border-bottom-color: ${(p) => withAlpha(p.theme.colors.text, 0.14)};
`;
