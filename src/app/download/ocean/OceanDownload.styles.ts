/**
 * 바다의 내려받기·소개 화면 — 물빛 바탕 위에 글과 판만. 별 하늘·금빛 쓸림(Celestial), 잎·도장(Maple) 없이.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 * 짜임도 Celestial(왼쪽 글·오른쪽 그림, 같은 판 넷, 표 한 장)과 다르다 — 같은 JSX 를 CSS 로만 다시 앉힌다:
 *   길잡이: 위에 떠 있는 유리 알약 하나(내려도 따라온다).
 *   머리: 가운데 정렬 — 아주 큰 기울인 세리프 "Cronos", 한 줄 소개, 단추 둘. 그 아래 앱 화면을 닮은 판(OceanHeroScene)을
 *         물 위에 띄운 제품 사진처럼 크게.
 *   기능: 벤토 — 넓은 판(그림 왼쪽·글 오른쪽)과 좁은 판이 엇갈린다.
 *   내려받기: 운영체제마다 유리 타일 한 장(이름·설명·크기·받기 단추).
 *   꼬리: 가운데 상표와 링크.
 * 움직임은 한 번씩만(떠오르기·올리면 색 바뀜). 끝없이 도는 것은 없다(내려받는 중 표시도 몇 바퀴 돌고 멈춘다).
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialDownload.styles";
import { withAlpha } from "@/styles/color";
import { EASE, MONO, R, SERIF, calm, focusRing, hairline, ink, label, seaButton, seaChip, surface } from "@/styles/ocean/water";

export * from "../celestial/CelestialDownload.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 기울인 세리프 상표 — 글자는 CRONOS 로 들어오지만 Cronos 로 */
const wordmark = css`
    font-family: ${SERIF};
    font-style: italic;
    font-weight: 400;
    text-transform: lowercase;
    &::first-letter { text-transform: uppercase; }
`;

export const Page = styled(C.Page)`
    background: transparent;
    /* hidden 은 이 상자를 스크롤 상자로 만들어 위에 뜬 길잡이(sticky)가 붙지 못한다 — 잘라내기만 */
    overflow-x: clip;
    color: ${(p) => p.theme.colors.text};
`;

/** 읽는 자리 — 맨 위 2px 청록 선 (빛무리 없음) */
export const ProgressBar = styled(C.ProgressBar)`
    background: ${(p) => p.theme.colors.primary};
    box-shadow: none;
`;

/** 별 하늘은 없다 — 바다는 바탕이 맡는다 */
export const Sky = styled(C.Sky)`
    display: none;
`;

export const Nav = styled(C.Nav)`
    /* 위에 떠 있는 유리 알약 — 내려도 따라온다 */
    ${surface("float")}
    position: sticky;
    top: 14px;
    z-index: 5;
    max-width: 820px;
    margin: 14px auto 0;
    padding: 7px 7px 7px 22px;
    border-radius: 999px;

    @media (max-width: 880px) { margin: 10px 12px 0; }
`

export const NavBrand = styled(C.NavBrand)`
    ${wordmark}
    font-size: 1.6rem;
    letter-spacing: -0.01em;
    line-height: 1;
`;

export const NavLink = styled(C.NavLink)`
    font-size: 0.86rem;
    letter-spacing: 0;
    &:hover { color: ${(p) => p.theme.colors.text}; }
`;

export const NavCta = styled(C.NavCta)`
    ${seaButton("default")}
    height: 36px;
    padding: 0 14px;
    gap: 7px;
    border-radius: 999px;
    font-size: 0.84rem;
    letter-spacing: -0.005em;
`

export const Hero = styled(C.Hero)`
    /* 가운데 한 줄기: 글 → 단추 → 그 아래 큰 판 */
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 64px;
    padding: 96px 28px 112px;

    @media (max-width: 900px) { padding: 56px 20px 72px; gap: 44px; }
`

const arrive = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
`;

export const HeroText = styled(C.HeroText)`
    flex: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    & > * { animation: ${arrive} 0.5s ${EASE} both; ${calm} }
    & > *:nth-child(2) { animation-delay: 0.06s; }
    & > *:nth-child(3) { animation-delay: 0.12s; }
    & > *:nth-child(4) { animation-delay: 0.18s; }
    & > *:nth-child(5) { animation-delay: 0.24s; }
`

/** 아주 큰 기울인 세리프 한 단어 */
export const Brand = styled(C.Brand)`
    ${wordmark}
    font-size: 8rem;
    line-height: 0.9;
    letter-spacing: -0.035em;
    color: ${(p) => p.theme.colors.text};
    animation: ${arrive} 0.5s ${EASE} both;
    ${calm}

    @media (max-width: 720px) {
        font-size: 4.6rem;
        letter-spacing: -0.03em;
    }
`

export const Tagline = styled(C.Tagline)`
    margin-top: 18px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.35;
    color: ${(p) => p.theme.colors.text};

    @media (max-width: 720px) { font-size: 1.2rem; }
`;

export const Lead = styled(C.Lead)`
    margin: 14px auto 0;
    max-width: 520px;
    font-size: 0.98rem;
    line-height: 1.7;
    letter-spacing: -0.005em;
`

export const DownloadNotice = styled(C.DownloadNotice)`
    max-width: 470px;
    margin-top: 18px;
    padding: 12px 14px;
    border-left: none;
    border-radius: 10px;
    border: 1px solid ${(p) => withAlpha(p.theme.colors.error, 0.25)};
    background: ${(p) => withAlpha(p.theme.colors.error, dark(p) ? 0.12 : 0.07)};
    font-size: 0.86rem;
`;

export const CtaRow = styled(C.CtaRow)`
    justify-content: center;
    gap: 10px;
    margin-top: 32px;
`

/** 단추 — 끌려오는 움직임(magnetic)은 쓰지 않는다. 누르면 살짝 눌린다 */
const cta = css`
    height: 46px;
    padding: 0 20px;
    gap: 8px;
    font-size: 0.94rem;
    letter-spacing: -0.005em;
    overflow: visible;
    transform: none;
    .arrow { transition: transform 0.15s ease; }
    &:hover:not(:disabled) .arrow { transform: translateX(3px); }
    &::after { display: none; }
`;

export const PrimaryCta = styled(C.PrimaryCta)`
    ${seaButton("primary")}
    ${cta}
`;

export const GhostCta = styled(C.GhostCta)`
    ${seaButton("default")}
    ${cta}
`;

/** 단추 속 판 정보 — 세로 머리카락 선 뒤의 작은 고정폭 글씨 */
export const CtaMeta = styled(C.CtaMeta)`
    margin-left: 4px;
    padding-left: 12px;
    border-left: 1px solid ${(p) => (dark(p) ? "rgba(6, 17, 15, 0.25)" : "rgba(255, 255, 255, 0.35)")};
    font-family: ${MONO};
    font-size: 0.72rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: inherit;
    opacity: 0.8;
`;

/** 오른쪽 그림 자리 — 앱 화면을 닮은 판(OceanHeroScene). 불러오는 동안의 별 고리(Celestial)는 숨긴다 */
/** 단추 아래의 큰 판 — 앱 화면을 닮은 판(OceanHeroScene)을 물 위에 띄운 제품 사진처럼. 불러오는 동안의 별 고리(Celestial)는 숨긴다 */
export const HeroArt = styled(C.HeroArt)`
    width: min(660px, 100%);
    height: 430px;
    animation: none;

    & > svg { display: none; }

    /* 판 아래 물에 드리운 그늘 */
    &::after {
        content: "";
        position: absolute;
        left: 12%;
        right: 12%;
        bottom: -34px;
        height: 46px;
        border-radius: 50%;
        background: ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.45)" : "rgba(6, 60, 66, 0.22)")};
        filter: blur(18px);
        pointer-events: none;
        z-index: -1;
    }

    @media (max-width: 860px) { display: block; height: 340px; }
    @media (max-width: 520px) { height: 280px; }
`

export const RevealBox = styled(C.RevealBox)`
    :where(html:not([data-theme-motion="off"])) & {
        transform: ${(p) => (p.$shown ? "none" : "translateY(10px)")};
        transition: opacity 0.5s ease, transform 0.5s ${EASE};
        transition-delay: ${(p) => p.$delay}ms;
    }
`;

export const Section = styled(C.Section)`
    padding-bottom: 96px;
`;

/** 마디 제목 — 굵은 본문 글꼴, 옆의 선 없음 */
/** 마디 제목 — 굵은 본문 글꼴, 가운데, 옆의 선 없음 */
export const SectionTitle = styled(C.SectionTitle)`
    justify-content: center;
    text-align: center;
    margin-bottom: 28px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: -0.03em;

    &::after { display: none; }
`

export const Char = styled(C.Char)`
    :where(html:not([data-theme-motion="off"])) & {
        transform: ${(p) => (p.$shown ? "none" : "translateY(6px)")};
        filter: none;
        transition: opacity 0.4s ease, transform 0.4s ${EASE};
    }
`;

/**
 * 벤토 — 여섯 칸 바탕에 넓은 판(4칸)과 좁은 판(2칸)이 엇갈린다: [달력 ▭▭ | 보드 ▭] / [챌린지 ▭ | 위젯 ▭▭].
 * 넓은 판은 그림 왼쪽·글 오른쪽으로 눕힌다. (판은 Reveal 상자에 한 겹 싸여 들어온다)
 */
export const FeatureGrid = styled(C.FeatureGrid)`
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;

    & > * { grid-column: span 2; }
    & > :nth-child(1), & > :nth-child(4) { grid-column: span 4; }

    & > :nth-child(1) article, & > :nth-child(4) article {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
        grid-template-rows: 1fr auto auto 1fr;
        column-gap: 24px;
        align-items: center;

        & > :nth-child(1) { grid-row: 1 / -1; height: 100%; min-height: 168px; margin-bottom: 0; }
        & > :nth-child(2) { grid-row: 2; grid-column: 2; }
        & > :nth-child(3) { grid-row: 3; grid-column: 2; }
    }

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        & > * { grid-column: span 1; }
        & > :nth-child(1), & > :nth-child(4) { grid-column: span 2; }
    }

    @media (max-width: 560px) {
        grid-template-columns: minmax(0, 1fr);
        & > *, & > :nth-child(1), & > :nth-child(4) { grid-column: auto; }
        & > :nth-child(1) article, & > :nth-child(4) article {
            display: block;
            & > :nth-child(1) { height: 112px; min-height: 0; margin-bottom: 18px; }
        }
    }
`

/** 기능 판 — 같은 크기의 판 넷. 기울이는 움직임 없이, 올리면 선이 조금 진해지고 2px 뜬다 */
export const Feature = styled(C.Feature)`
    ${surface("panel")}
    padding: 14px 14px 20px;
    border-radius: ${R.lg};
    transform: translateY(var(--lift, 0px));
    transition: border-color 0.15s ease, transform 0.2s ${EASE};
    ${focusRing}

    &::after { display: none; }

    &:hover, &:focus-visible {
        --lift: -2px;
        border-color: ${(p) => ink(p.theme, dark(p) ? 0.2 : 0.16)};
        box-shadow: 0 1px 1px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.2)" : "rgba(18, 33, 32, 0.03)")}, 0 20px 44px -24px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.7)" : "rgba(18, 33, 32, 0.24)")};
    }
`;

/** 작은 그림 자리 — 판 안의 카드 한 장 */
export const FeatureVisual = styled(C.FeatureVisual)`
    ${surface("card")}
    height: 112px;
    margin-bottom: 18px;
    border-radius: ${R.md};
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
`;

export const FeatureTitle = styled(C.FeatureTitle)`
    padding: 0 6px;
    font-size: 0.98rem;
    font-weight: 650;
    letter-spacing: -0.015em;
`;

export const FeatureDesc = styled(C.FeatureDesc)`
    padding: 0 6px;
    margin-top: 6px;
    font-size: 0.84rem;
    line-height: 1.65;
`;

/** 작은 달력 — 둥근 칸, 일정 있는 날은 옅은 청록, 올리면 청록 막대가 길어진다 */
export const MiniCalendar = styled(C.MiniCalendar)`
    grid-template-columns: repeat(7, 15px);
    gap: 4px;

    .cell {
        height: 11px;
        border: 1px solid ${(p) => hairline(p.theme, true)};
        border-radius: 3px;
    }
    .cell.dot {
        border-color: transparent;
        background: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.35 : 0.22)};
    }
    .cell.dot::after { display: none; }

    .bar {
        top: 32px;
        left: 19px;
        width: 90px;
        height: 3px;
        border-radius: 2px;
        box-shadow: none;
        transition: transform 0.4s ${EASE};
    }
`;

/** 작은 보드 — 칸 셋, 올리면 청록 카드 하나가 옆 칸으로 */
export const MiniBoard = styled(C.MiniBoard)`
    gap: 7px;

    .col {
        width: 36px;
        min-height: 64px;
        padding: 5px;
        gap: 4px;
        border: 1px solid ${(p) => hairline(p.theme, true)};
        border-radius: 6px;
    }
    .col i {
        height: 7px;
        border-radius: 2px;
        background: ${(p) => ink(p.theme, dark(p) ? 0.18 : 0.12)};
    }
    .col .mover { background: ${(p) => p.theme.colors.primary}; }

    ${C.Feature}:hover .col .mover, ${C.Feature}:focus-visible .col .mover { box-shadow: none; transform: translateX(43px); }
`;

/** 작은 챌린지 — 별 글자 대신 동그라미 일곱. 한 날은 청록으로 찬다 (깜빡이지 않는다) */
export const MiniChallenge = styled(C.MiniChallenge)`
    gap: 6px;

    .day {
        width: 16px;
        height: 16px;
        font-size: 0;
        border-radius: 50%;
        border: 1.5px solid ${(p) => ink(p.theme, 0.25)};
        opacity: 1;
        text-shadow: none;
        animation: none;
        transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    .day.on {
        border-color: ${(p) => p.theme.colors.primary};
        background: ${(p) => p.theme.colors.primary};
        text-shadow: none;
        animation: none;
    }

    ${C.Feature}:hover .day, ${C.Feature}:focus-visible .day {
        opacity: 1;
        text-shadow: none;
        border-color: ${(p) => p.theme.colors.primary};
    }
`;

/** 작은 위젯 — 반투명 판 석 장, 올리면 펼쳐진다 */
export const MiniWidgets = styled(C.MiniWidgets)`
    width: 76px;
    height: 58px;

    .pane {
        border: 1px solid ${(p) => hairline(p.theme, true)};
        border-radius: 8px;
        background: ${(p) => (dark(p) ? "rgba(30, 42, 43, 0.92)" : "rgba(255, 255, 255, 0.92)")};
        transition: transform 0.4s ${EASE};
    }
`;

/** 내려받기 목록 — 판 하나, 줄 사이 머리카락 선 */
/** 내려받기 — 운영체제마다 유리 타일 한 장 */
export const PlatformList = styled(C.PlatformList)`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    border-top: none;

    @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: 480px) { grid-template-columns: minmax(0, 1fr); }
`

/** 타일: 위에 이름과 받기 단추, 가운데 설명, 아래 형식·크기 */
export const PlatformRow = styled(C.PlatformRow)`
    ${surface("panel")}
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto 1fr auto;
    align-items: start;
    gap: 10px 12px;
    min-height: 176px;
    padding: 18px 18px 16px;
    border-radius: ${R.lg};
    box-shadow: ${(p) => (p.$mine ? `0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.55)}` : "none")};
    transform: translateY(var(--lift, 0px));
    transition: transform 0.2s ${EASE}, border-color 0.15s ease;
    ${focusRing}

    & > :nth-child(1) { grid-row: 1; grid-column: 1; }
    & > :nth-child(2) { grid-row: 2; grid-column: 1 / -1; display: block; }
    & > :nth-child(3) { grid-row: 3; grid-column: 1; align-self: end; justify-self: start; }
    & > :nth-child(4) { grid-row: 1; grid-column: 2; }

    &:hover:not(:disabled) {
        --lift: -2px;
        box-shadow: ${(p) => (p.$mine ? `0 0 0 1.5px ${withAlpha(p.theme.colors.primary, 0.7)}, ` : "")}0 20px 44px -24px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.7)" : "rgba(18, 33, 32, 0.24)")};
        .arrow { transform: translateY(2px); }
    }

    @media (max-width: 620px) {
        grid-template-columns: minmax(0, 1fr) auto;
        min-height: 0;
        & > :nth-child(2) { display: block; }
    }
`

export const RowName = styled(C.RowName)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.15rem;
    font-weight: 650;
    letter-spacing: -0.02em;
`

export const RowMine = styled(C.RowMine)`
    ${seaChip(true)}
    padding: 2px 7px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.primary};
`;

export const RowNote = styled(C.RowNote)`
    font-size: 0.84rem;
    line-height: 1.6;
    text-align: left;
`

export const RowMeta = styled(C.RowMeta)`
    ${label}
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    text-transform: none;
`;

export const RowAction = styled(C.RowAction)`
    ${seaButton("default")}
    width: 34px;
    height: 34px;
    color: ${(p) => p.theme.colors.text};
`;

/** 내려받는 중 표시 — 끝없이 돌지 않는다 (몇 바퀴 돌고 멈춘다. 그 사이 화면은 4초 뒤 풀린다) */
const spin = keyframes`to { transform: rotate(360deg); }`;
export const Spinner = styled(C.Spinner)`
    animation: ${spin} 0.9s linear 5;
    ${calm}
`;

/** 꼬리 — 가운데 상표, 그 아래 링크 */
export const Foot = styled(C.Foot)`
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    padding: 40px 28px 48px;
    border-top: none;
    font-family: ${(p) => p.theme.fonts.body};
    letter-spacing: 0;

    & > span {
        ${wordmark}
        font-size: 2rem;
        color: ${(p) => p.theme.colors.text};
    }
`

export const FootLinks = styled(C.FootLinks)`
    gap: 20px;

    a {
        font-size: 0.86rem;
        letter-spacing: 0;
        &:hover { color: ${(p) => p.theme.colors.text}; }
    }
`;
