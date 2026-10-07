/**
 * 바다의 내려받기·소개 화면 — 물빛 바탕 위에 글과 판만. 별 하늘·금빛 쓸림(Celestial), 잎·도장(Maple) 없이.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 *   머리: 아주 큰 기울인 세리프 "Cronos", 한 줄 소개, 청록 단추 하나 + 흰 단추 하나. 오른쪽엔 앱 화면을 닮은 반투명 판(OceanHeroScene).
 *   기능: 같은 크기의 판 넷(벤토), 안의 작은 그림은 납작한 칸·막대·동그라미.
 *   내려받기: 판 하나 안의 목록(줄 사이 머리카락 선) — 설정 화면 같은 짜임.
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
    padding-top: 22px;
`;

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
    font-size: 0.84rem;
    letter-spacing: -0.005em;
`;

export const Hero = styled(C.Hero)`
    gap: 56px;
    padding: 88px 28px 104px;

    @media (max-width: 900px) { padding: 56px 24px 72px; }
`;

const arrive = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
`;

export const HeroText = styled(C.HeroText)`
    & > * { animation: ${arrive} 0.5s ${EASE} both; ${calm} }
    & > *:nth-child(2) { animation-delay: 0.06s; }
    & > *:nth-child(3) { animation-delay: 0.12s; }
    & > *:nth-child(4) { animation-delay: 0.18s; }
    & > *:nth-child(5) { animation-delay: 0.24s; }
`;

/** 아주 큰 기울인 세리프 한 단어 */
export const Brand = styled(C.Brand)`
    ${wordmark}
    font-size: 6.2rem;
    line-height: 0.95;
    letter-spacing: -0.03em;
    color: ${(p) => p.theme.colors.text};
    animation: ${arrive} 0.5s ${EASE} both;
    ${calm}

    @media (max-width: 720px) {
        font-size: 4.2rem;
        letter-spacing: -0.03em;
    }
`;

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
    margin-top: 14px;
    max-width: 470px;
    font-size: 0.98rem;
    line-height: 1.7;
    letter-spacing: -0.005em;
`;

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
    gap: 10px;
    margin-top: 32px;
`;

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
export const HeroArt = styled(C.HeroArt)`
    width: 440px;
    height: 380px;
    animation: none;

    & > svg { display: none; }

    @media (max-width: 1000px) { width: 360px; height: 330px; }
`;

export const RevealBox = styled(C.RevealBox)`
    @media (prefers-reduced-motion: no-preference) {
        transform: ${(p) => (p.$shown ? "none" : "translateY(10px)")};
        transition: opacity 0.5s ease, transform 0.5s ${EASE};
        transition-delay: ${(p) => p.$delay}ms;
    }
`;

export const Section = styled(C.Section)`
    padding-bottom: 96px;
`;

/** 마디 제목 — 굵은 본문 글꼴, 옆의 선 없음 */
export const SectionTitle = styled(C.SectionTitle)`
    margin-bottom: 20px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.025em;

    &::after { display: none; }
`;

export const Char = styled(C.Char)`
    @media (prefers-reduced-motion: no-preference) {
        transform: ${(p) => (p.$shown ? "none" : "translateY(6px)")};
        filter: none;
        transition: opacity 0.4s ease, transform 0.4s ${EASE};
    }
`;

export const FeatureGrid = styled(C.FeatureGrid)`
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
`;

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
export const PlatformList = styled(C.PlatformList)`
    ${surface("panel")}
    border-radius: ${R.lg};
    overflow: hidden;
`;

export const PlatformRow = styled(C.PlatformRow)`
    grid-template-columns: minmax(150px, auto) 1fr auto 36px;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    transition: background-color 0.15s ease;
    ${focusRing}
    &:focus-visible { outline-offset: -2px; }

    &:last-child { border-bottom: none; }
    &:hover:not(:disabled) {
        box-shadow: none;
        background-color: ${(p) => ink(p.theme, dark(p) ? 0.05 : 0.03)};
        .arrow { transform: translateY(2px); }
    }

    @media (max-width: 620px) {
        grid-template-columns: auto 1fr 36px;
        padding: 14px 16px;
    }
`;

export const RowName = styled(C.RowName)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: -0.01em;
`;

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
`;

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

export const Foot = styled(C.Foot)`
    padding: 28px 28px 40px;
    border-top: 1px solid ${(p) => hairline(p.theme)};
    font-family: ${(p) => p.theme.fonts.body};
    letter-spacing: 0;

    & > span {
        ${wordmark}
        font-size: 1.35rem;
        color: ${(p) => p.theme.colors.text};
    }
`;

export const FootLinks = styled(C.FootLinks)`
    gap: 20px;

    a {
        font-size: 0.86rem;
        letter-spacing: 0;
        &:hover { color: ${(p) => p.theme.colors.text}; }
    }
`;
