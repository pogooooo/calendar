/**
 * Maple 의 홈 — 펼친 다이어리 배치는 별도 JSX 에, 공용 행과 단추의 모양은 여기에 둔다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 마름모·✦ 는 잎·문장 마스크로, 실선은 먹으로.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialHome.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, leafBullet, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialHome.styles";

/** 해시계는 도감에 붙인 도판 한 장 — 넓은 화면에서도 띠처럼 늘어나지 않는다 */
export const ArchWrap = styled(C.ArchWrap)`
    max-width: 560px;
    margin: 0 auto;
    width: 100%;
`;

/* ── 보는 날 옮기기 ────────────────────────────────────────────────── */

export const NavButton = styled(C.NavButton)`
    color: ${(p) => p.theme.colors.text};
    opacity: 0.8;

    &:hover { filter: none; opacity: 1; }
    &:focus-visible { outline-color: ${(p) => hair(p.theme, 0.7)}; }
`;

export const DayPick = styled(C.DayPick)`
    button {
        ${stampButton("default")}
        font-size: 0.88rem;
        letter-spacing: 0.04em;
    }
`;

export const DayLabel = styled(C.DayLabel)`
    /* 날짜에 한글(월·일)이 섞이므로 제목 글꼴로 — Cormorant 는 숫자만 있어 글자마다 크기가 튄다 */
    b {
        font-size: 0.98rem;
        letter-spacing: 0.06em;
    }

    em {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.72rem;
        letter-spacing: 0.18em;
    }
`;

export const TodayButton = styled(C.TodayButton)`
    ${stampButton("default")}
    padding: 3px 12px;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    color: ${(p) => p.theme.colors.text};

    &:hover:not(:disabled) { box-shadow: none; }
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
    @media(max-width:768px) { .center { font-size:.7rem; letter-spacing:.04em; } }
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
