/**
 * Maple 의 홈 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 마름모·✦ 는 잎·문장 마스크로, 실선은 먹으로.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialHome.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, leafBullet, shortRule, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialHome.styles";

/** 본문(달 눈금·두 쪽)은 색인 오른쪽으로 */
export const Main = styled(C.Main)`
    order: 2;
`;

/** 해시계는 도감에 붙인 도판 한 장 — 넓은 화면에서도 띠처럼 늘어나지 않는다 */
export const ArchWrap = styled(C.ArchWrap)`
    max-width: 560px;
    margin: 0 auto;
    width: 100%;
`;

/** 두 쪽 사이의 접힌 자국 — 도감을 펼친 자리 */
export const Lists = styled(C.Lists)`
    position: relative;

    @media (min-width: 901px) {
        &::before {
            content: "";
            position: absolute;
            top: 6px;
            bottom: 6px;
            left: 50%;
            width: 3px;
            margin-left: -1.5px;
            background: linear-gradient(
                to right,
                transparent,
                ${(p) => hair(p.theme, 0.16)} 35%,
                ${(p) => hair(p.theme, 0.28)} 50%,
                ${(p) => hair(p.theme, 0.16)} 65%,
                transparent
            );
            pointer-events: none;
        }
    }
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

/* ── 짜임부터 다르다 ─────────────────────────────────────────────
   Celestial 은 "본문 + 오른쪽 기둥" 이다. Maple 은 펼친 도감이라 왼쪽이 색인(기둥),
   오른쪽이 본문(달 눈금과 두 쪽)이고 그 사이에 접힌 자국이 지난다. 화면 코드는 그대로 두고
   자리만 바꾼다 — 갈래가 짜임까지 바꿔도 JSX 는 하나다. */

/** 카드 틀: 먹선 하나에 안쪽 옅은 선 */
export const Card = styled(C.Card)`
    border-color: ${(p) => withAlpha(p.theme.colors.text, 0.35)};
    /* 색인이 왼쪽, 본문이 오른쪽 */
    grid-template-columns: 232px 1fr;

    &::before {
        border-color: ${(p) => withAlpha(p.theme.colors.text, 0.12)};
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
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

/** 색인: 펼친 도감의 왼쪽 첫 장. 선도 왼쪽이 아니라 오른쪽에 선다 */
export const Pillar = styled(C.Pillar)`
    order: 1;
    border-left: none;
    border-right: 1px solid ${(p) => withAlpha(p.theme.colors.text, 0.22)};

    @media (max-width: 900px) {
        order: 2;
        border-right: none;
        border-top: 1px solid ${(p) => withAlpha(p.theme.colors.text, 0.22)};
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
