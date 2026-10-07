/**
 * 설정 화면의 뼈대. 폼 요소(FormInput, FormButton …)는 예전 그대로
 * SettingsView.styles.ts 를 쓰고, 여기에는 판 넷으로 나뉜 새 틀만 둔다.
 */
import styled, { css, keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { celestial_star } from "@/styles/celestial_theme";

const hair = (a: number) => css`${(p) => p.theme.colors.primary}${a}`;

/**
 * 스크롤은 바깥(레이아웃의 MainContent) 하나만 쓴다.
 *
 * 예전에는 여기서 100vh 로 높이를 잡고 안쪽 Pane 을 따로 굴렸는데,
 * MainContent 의 padding 만큼 삐져나가 스크롤바가 두 개 보였다.
 * 높이를 맞추려 해도 중간 래퍼들 때문에 백분율이 풀리지 않는다.
 * 그래서 높이를 잡지 않고 흐르게 두고, 성좌 내비만 sticky 로 붙여 둔다.
 */
export const Shell = styled.div`
    position: relative;
    width: 100%;
    background-color: transparent;
`;

export const Frame = styled.div`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    align-items: start;

    ${MOBILE} {
        grid-template-columns: 1fr;
    }
`;

/* ── 성좌 내비 ───────────────────────────────────────────────────────── */

/** 판을 굴려도 제자리에 남아야 목차 노릇을 한다. */
export const Constellation = styled.nav`
    position: sticky;
    top: 0;
    align-self: start;
    border-right: 1px solid ${hair(26)};

    ${MOBILE} {
        position: static;
        border-right: none;
        border-bottom: 1px solid ${hair(26)};
        overflow-x: auto;
    }
`;

export const ConstellationArt = styled.svg`
    position: absolute;
    left: 0;
    top: 0;
    width: 210px;
    height: 340px;
    pointer-events: none;
    overflow: visible;

    polyline { stroke: ${hair(26)}; }
    circle { fill: ${hair(44)}; }

    ${MOBILE} { display: none; }
`;

export const TabList = styled.div`
    position: relative;
    padding-top: 30px;

    /* 폰에서는 넷이 폭을 나눠 갖는다. 가로로 흘리면 마지막 탭이 잘린 채 보이고,
       손가락으로 옆으로 밀 수 있다는 걸 알아채기 어렵다. */
    ${MOBILE} {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        padding: 0;
    }
`;

export const TabButton = styled.button<{ $active: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 74px;
    padding: 0 16px 0 70px;
    background: none;
    border: none;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    transition: color 0.22s ease;

    &:hover { color: ${(p) => p.theme.colors.text}; }

    .lbl {
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 0.92rem;
        letter-spacing: 3px;
        ${(p) => p.$active && css`text-shadow: 0 0 10px ${p.theme.colors.primary}77;`}
    }

    .cnt {
        margin-left: auto;
        font-size: 0.66rem;
        font-variant-numeric: tabular-nums;
        color: ${hair(66)};
    }

    ${MOBILE} {
        width: auto;
        height: 52px;
        padding: 0 6px;
        gap: 5px;
        justify-content: center;
        white-space: nowrap;
        min-width: 0;

        .lbl { font-size: 0.8rem; letter-spacing: 1.5px; }
        .cnt { margin-left: 0; font-size: 0.6rem; }
    }
`;

const twinkle = keyframes`
    0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
    50%      { filter: drop-shadow(0 0 11px currentColor); }
`;

/** 표지별. 성좌 좌표에 맞춰 단추와 따로 놓는다. */
export const Mark = styled.span<{ $x: number; $y: number; $on: boolean }>`
    position: absolute;
    left: ${(p) => p.$x}px;
    top: ${(p) => p.$y}px;
    z-index: 2;
    width: 10px;
    height: 10px;
    pointer-events: none;
    clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
    transition: transform 0.32s ease, background-color 0.32s ease;

    background-color: ${(p) => (p.$on ? p.theme.colors.primary : `${p.theme.colors.primary}44`)};
    transform: translate(-50%, -50%) scale(${(p) => (p.$on ? 1.25 : 0.55)});
    ${(p) => p.$on && css`
        color: ${p.theme.colors.primary}77;
        animation: ${twinkle} 2.8s ease-in-out infinite;
    `}

    ${MOBILE} { display: none; }
`;

/* ── 판 ──────────────────────────────────────────────────────────────── */

export const Pane = styled.div`
    min-width: 0;
`;

export const PaneHeader = styled.header`
    position: relative;
    overflow: hidden;
    padding: 42px 40px 30px;
    border-bottom: 1px solid ${hair(26)};

    ${MOBILE} { padding: 26px 20px 22px; }
`;

export const Orbit = styled.svg`
    position: absolute;
    right: -70px;
    top: -78px;
    width: 300px;
    height: 300px;
    opacity: 0.42;
    pointer-events: none;
    stroke: ${(p) => p.theme.colors.primary};

    .pip { fill: ${(p) => p.theme.colors.primary}; stroke: none; }
    ${MOBILE} { display: none; }
`;

export const Eyebrow = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 0.64rem;
    letter-spacing: 3px;
    color: ${(p) => p.theme.colors.primary};

    &::after {
        content: "";
        width: 54px;
        height: 1px;
        background-color: ${hair(66)};
    }
`;

export const PaneTitle = styled.h1`
    position: relative;
    margin: 0 0 12px;
    font-family: ${(p) => p.theme.fonts.display};
    font-weight: 400;
    font-size: 2.6rem;
    letter-spacing: 12px;
    line-height: 1.05;
    color: ${(p) => p.theme.colors.text};

    ${MOBILE} { font-size: 1.6rem; letter-spacing: 6px; }
`;

export const PaneNote = styled.p`
    position: relative;
    margin: 0;
    max-width: 48ch;
    font-size: 0.82rem;
    line-height: 1.65;
    color: ${(p) => p.theme.colors.textSecondary};
`;

const paneBodyIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const PaneBody = styled.div`
    padding: 30px 40px 60px;
    ${MOBILE} { padding: 22px 20px 48px; }

    /* 판을 갈아 끼울 때 내용이 아래에서 올라온다.
       key 가 판마다 달라야 다시 재생된다 (SettingsView 에서 붙인다). */
    @media (prefers-reduced-motion: no-preference) {
        animation: ${paneBodyIn} 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
`;

export const Block = styled.section`
    margin-bottom: 40px;
    &:last-child { margin-bottom: 0; }
`;

export const BlockHead = styled.div<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 16px;

    h2 {
        margin: 0;
        font-family: ${(p) => p.theme.fonts.display};
        font-weight: 400;
        font-size: 0.84rem;
        letter-spacing: 3.5px;
        color: ${(p) => (p.$danger ? p.theme.colors.error : p.theme.colors.text)};
    }

    &::after {
        content: "";
        flex: 1;
        height: 1px;
        background-color: ${(p) => (p.$danger ? `${p.theme.colors.error}44` : `${p.theme.colors.primary}26`)};
    }
`;

export const DangerBlock = styled(Block)`
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid ${(p) => p.theme.colors.error}4D;
`;

export const RowNote = styled.div`
    margin-top: 2px;
    font-size: 0.74rem;
    color: ${(p) => p.theme.colors.textSecondary};
`;

/** 고른 것을 알리는 표지. 화면 어디서나 이것 하나로 통일한다. */
export const Star = styled.span<{ $on: boolean; $small?: boolean }>`
    ${celestial_star}
    flex: none;
    ${(p) => p.$small && css`width: 5px; height: 5px;`}
    visibility: ${(p) => (p.$on ? "visible" : "hidden")};
`;

/* ── 테마 고르기: 갈래 진열장 + 고른 갈래의 무대 (parts/ThemePicker) ────────
   갈래 × 벌마다 큰 카드를 내던 예전 판은 갈래가 늘수록 끝없이 길어졌다.
   갈래는 작은 타일 하나씩, 벌(밝게·어둡게)은 아래 무대에서 고른다. */

export const ThemeGallery = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(146px, 1fr));
    gap: 12px;
    margin-bottom: 14px;

    /* 폰: 옆으로 밀어 보는 띠 — 갈래가 많아도 한 줄 */
    ${MOBILE} {
        grid-auto-flow: column;
        grid-template-columns: none;
        grid-auto-columns: minmax(128px, 42%);
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 6px;
        & > * { scroll-snap-align: start; }
    }
`;

export const FamilyTile = styled.button<{ $selected: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    text-align: left;
    font-family: inherit;
    color: inherit;
    background: none;
    cursor: pointer;
    border: 1px solid ${(p) => (p.$selected ? p.theme.colors.primary : `${p.theme.colors.primary}26`)};
    transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;

    &:hover { border-color: ${(p) => p.theme.colors.primary}; transform: translateY(-2px); }
    ${(p) => p.$selected && css`
        box-shadow: 0 0 0 1px ${p.theme.colors.primary}, 0 0 22px ${p.theme.colors.primary}12;
        &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 26px;
            height: 26px;
            z-index: 2;
            pointer-events: none;
            background: linear-gradient(315deg, transparent 49%, ${p.theme.colors.primary} 50%, transparent 51%);
        }
    `}
`;

export const FamilyFoot = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border-top: 1px solid ${hair(26)};
`;

export const FamilyName = styled.span`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 0.78rem;
    letter-spacing: 2px;
    color: ${(p) => p.theme.colors.text};
`;

/** 이 갈래가 가진 벌의 수 — 채운 것이 지금 벌 */
export const VariantDots = styled.span`
    display: flex;
    gap: 5px;
    flex: none;

    i {
        width: 5px;
        height: 5px;
        transform: rotate(45deg);
        border: 1px solid ${hair(99)};
    }
    i.on { background-color: ${(p) => p.theme.colors.primary}; border-color: ${(p) => p.theme.colors.primary}; }
`;

const stageIn = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
`;

/** 고른 갈래의 무대 — 큰 축소판 옆에 이름·설명·벌 고르기 */
export const ThemeStage = styled.div`
    display: grid;
    grid-template-columns: minmax(200px, 300px) minmax(0, 1fr);
    gap: 22px;
    align-items: center;
    padding: 16px;
    margin-bottom: 18px;
    border: 1px solid ${hair(26)};

    @media (prefers-reduced-motion: no-preference) {
        animation: ${stageIn} 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    ${MOBILE} { grid-template-columns: 1fr; gap: 14px; padding: 12px; }
`;

export const StageThumb = styled.div`
    overflow: hidden;
    border: 1px solid ${hair(26)};
`;

export const StageInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
`;

export const StageName = styled.h3`
    margin: 0;
    font-family: ${(p) => p.theme.fonts.display};
    font-weight: 400;
    font-size: 1.45rem;
    letter-spacing: 6px;
    color: ${(p) => p.theme.colors.text};
`;

export const StageDesc = styled.p`
    margin: 0 0 4px;
    max-width: 46ch;
    font-size: 0.8rem;
    line-height: 1.6;
    color: ${(p) => p.theme.colors.textSecondary};
`;

/** 추상적인 막대 대신 앱 화면 축소판을 보여준다. 고르기 전에 결과가 보이도록. */
export const Mini = styled.div<{ $bg: string; $h?: number }>`
    display: grid;
    grid-template-columns: 26% 1fr;
    height: ${(p) => p.$h ?? 152}px;
    /* 색 하나일 수도, 무늬를 겹친 그림일 수도 있다 (바다의 물) */
    background: ${(p) => p.$bg};
`;

/** 갈래가 미리보기 그림을 가진 경우(Maple 의 E5) 축소판 대신 그 그림 */
export const MiniImage = styled.img<{ $h?: number }>`
    display: block;
    width: 100%;
    height: ${(p) => p.$h ?? 152}px;
    object-fit: cover;
    object-position: center;
`;

export const MiniRail = styled.div<{ $bg: string }>`
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px 7px;
    background: ${(p) => p.$bg};
    border-right: 1px solid ${hair(44)};

    i { display: block; height: 3px; border-radius: 1px; }
`;

export const MiniBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 11px;

    .title { height: 6px; width: 38%; }
    .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .week b { display: block; height: 3px; }
    .grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 1fr; gap: 4px; flex: 1; }
    .grid span { border-radius: 1px; }
`;

/* ── 분절 ────────────────────────────────────────────────────────────── */

export const SegRow = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    ${MOBILE} { flex-direction: column; align-items: stretch; gap: 8px; }
`;

export const SegLabel = styled.span`
    min-width: 62px;
    font-size: 0.76rem;
    letter-spacing: 1px;
    color: ${(p) => p.theme.colors.textSecondary};
`;

export const SegGroup = styled.div`
    display: flex;
    border: 1px solid ${hair(26)};

    ${MOBILE} { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; }
`;

export const Seg = styled.button<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 15px;
    font-family: inherit;
    font-size: 0.75rem;
    background: none;
    border: none;
    border-right: 1px solid ${hair(26)};
    cursor: pointer;
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    background-color: ${(p) => (p.$selected ? `${p.theme.colors.primary}12` : "transparent")};
    transition: color 0.18s ease, background-color 0.18s ease;

    &:last-child { border-right: none; }
    &:hover { color: ${(p) => p.theme.colors.primary}; }

    em {
        font-style: normal;
        font-size: 0.66rem;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    ${MOBILE} { min-height: 46px; justify-content: center; padding: 0 6px; }
`;

/* ── 폰트 ────────────────────────────────────────────────────────────── */

const cornerAccent = css`
    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        pointer-events: none;
        background: linear-gradient(315deg, transparent 49%, ${(p) => p.theme.colors.primary} 50%, transparent 51%);
    }
`;

export const FontGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(206px, 1fr));
    gap: 12px;

    ${MOBILE} { grid-template-columns: 1fr; }
`;

export const FontCard = styled.button<{ $selected: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 15px;
    text-align: left;
    font-family: inherit;
    color: inherit;
    background-color: ${(p) => (p.$selected ? `${p.theme.colors.primary}12` : "transparent")};
    border: 1px solid ${(p) => (p.$selected ? p.theme.colors.primary : `${p.theme.colors.primary}26`)};
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover { border-color: ${(p) => p.theme.colors.primary}; }
    ${(p) => p.$selected && cornerAccent}
`;

export const FontPreview = styled.div<{ $family: string }>`
    font-family: ${(p) => p.$family};
    font-size: 1.02rem;
    line-height: 1.45;
    color: ${(p) => p.theme.colors.text};

    /* 문장 끝의 작은 표식 — 글은 번역표에, 표식은 갈래의 말에 */
    &::after {
        content: " ✦";
        color: ${(p) => p.theme.colors.primary};
        font-size: 0.8em;
    }
`;

export const CardFoot = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
`;

export const CardName = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-family: ${(p) => p.theme.fonts.display};
    font-weight: 400;
    font-size: 0.82rem;
    letter-spacing: 1.5px;
    color: ${(p) => p.theme.colors.text};
`;

/* ── 위젯 ────────────────────────────────────────────────────────────── */

export const WidgetGallery = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
    gap: 14px;

    ${MOBILE} { grid-template-columns: 1fr; }
`;

export const WidgetCard = styled.article`
    display: flex;
    flex-direction: column;
    border: 1px solid ${hair(26)};
    transition: border-color 0.2s ease;

    &:hover { border-color: ${(p) => p.theme.colors.primary}; }
`;

/** 미리보기가 카드의 주인공이다. */
export const WidgetFrame = styled.div`
    padding: 12px 13px;
    background-color: ${(p) => p.theme.colors.primary}0F;
    border-bottom: 1px solid ${hair(26)};

    svg { height: 80px; border: none; }
`;

export const WidgetBody = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 12px 13px 13px;
`;

export const WidgetDesc = styled.p`
    margin: 0;
    font-size: 0.72rem;
    line-height: 1.5;
    color: ${(p) => p.theme.colors.textSecondary};
`;

export const WidgetActions = styled.div`
    display: flex;
    gap: 7px;
    margin-top: auto;
    padding-top: 11px;

    & > button { flex: 1; min-width: 0; padding: 5px 0; font-size: 0.72rem; }
`;

/* ── 정보 탭: 패치 노트 ────────────────────────────────────────────────── */
export const NoteList = styled.ol`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

export const Note = styled.li<{ $current: boolean }>`
    position: relative;
    padding-left: 18px;
    border-left: 1px solid ${(p) => (p.$current ? p.theme.colors.primary : `${p.theme.colors.primary}33`)};

    ul {
        margin: 8px 0 0;
        padding-left: 18px;
        list-style: disc;
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.86rem;
        line-height: 1.55;
        color: ${(p) => p.theme.colors.text};
        max-width: 64ch;
    }
    li::marker { color: ${(p) => p.theme.colors.primary}; }
`;

export const NoteHead = styled.div`
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;

    .ver {
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 0.86rem;
        letter-spacing: 2px;
        color: ${(p) => p.theme.colors.text};
    }
    .date {
        font-size: 0.72rem;
        color: ${(p) => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }
    em {
        font-style: normal;
        font-size: 0.64rem;
        letter-spacing: 1.5px;
        padding: 1px 7px;
        border: 1px solid ${(p) => p.theme.colors.primary}66;
        color: ${(p) => p.theme.colors.primary};
    }
`;
