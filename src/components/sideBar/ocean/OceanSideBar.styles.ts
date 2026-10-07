/**
 * 바다의 겉 틀(데스크톱) — 왼쪽 사이드바 칸이 없다. 본문이 화면 폭을 다 쓰고, 그 위에 유리 조각 둘이 뜬다.
 *   아래 가운데: 독 — 44px 아이콘 단추 한 줄. 맨 앞이 빠른 이동(Ctrl K), 세로 머리카락 선 뒤로 홈·카테고리·캘린더·
 *     프로젝트·챌린지·기념일(·앱 다운로드), 다시 선 하나 뒤에 설정. 이름은 단추 위에 뜨는 작은 꼬리표(독 단추 모양 파일).
 *   왼쪽 위: 상표 칩 — 기울인 세리프 Cronos 와 사람 단추(누르면 계정 창)를 유리 한 장에. 데스크톱 앱에서는 제목 줄이
 *     상표를 이미 보이므로 사람 단추만, 제목 줄 밑에.
 * Celestial(금빛 실선 사이드바·별)·Maple(먹 색인 면)처럼 칸을 차지하지 않고, 폭 조절 손잡이도 없다.
 *
 * 뼈대(SideBar → Profile·Menu)는 그대로 두고 상자만 푼다: 껍데기(SideBarWrapper)가 곧 독이고, 안쪽 상자(Content·
 * ProfileWrapper·MenuWrapper)는 display: contents 로 풀어 단추가 독 한 줄에 선다 — 순서는 order 로 잡는다.
 * 상표와 사람 단추만 position: fixed 로 왼쪽 위에 띄운다. 그래서 독 상자에는 고정 위치의 기준이 되는 속성
 * (transform·filter·backdrop-filter·contain)을 걸지 않는다 — 유리는 ::before 가 그린다.
 * 본문이 칩·독에 가리지 않게 옆의 main(MainContent)에 --app-top-clearance·--app-dock-clearance 를 적어 준다
 * (위는 여백으로 비워 내용이 칩 밑으로 굴러가고, 아래는 스크롤 칸을 독 위에서 끊는다 — oceanShell).
 */
import styled, { keyframes } from "styled-components";
import * as C from "../celestial/CelestialSideBar.styles";
import { withAlpha } from "@/styles/color";
import { EASE, SERIF, calm, focusRing, hairline, ink, label, rise, surface } from "@/styles/ocean/water";
import { DOCK_CLEARANCE, SHELL, TITLEBAR_H, TOP_CLEARANCE, WITH_TITLEBAR, dockGlass } from "./oceanShell";

export * from "../celestial/CelestialSideBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const px = (n: number) => `${n}px`;

/** 유리는 제 투명도로만 나타난다 — 상자(부모)의 투명도가 움직이면 그 안의 흐림이 뒤 화면을 못 본다 */
const glassIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

/** 유리 한 장 — 독·칩 상자의 ::before 로 깐다 */
const pane = `
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    pointer-events: none;
`;

/* ── 독 ─────────────────────────────────────────────────────────────── */

export const SideBarWrapper = styled(C.SideBarWrapper)`
    --ocean-glass: 1;
    --chip-top: ${px(SHELL.edge)};
    position: fixed;
    z-index: 60;
    left: 0;
    right: 0;
    bottom: ${px(SHELL.edge)};
    display: flex;
    align-items: center;
    gap: 2px;
    width: max-content;
    max-width: calc(100vw - ${px(SHELL.edge * 2)});
    height: ${px(SHELL.dockH)};
    margin: 0 auto;
    padding: 0 5px;
    border-radius: 20px;
    background: none;
    color: ${(p) => p.theme.colors.text};
    contain: none;
    container-type: normal;
    transform: none;
    will-change: auto;
    transition: none;
    pointer-events: auto;

    &::before {
        ${pane}
        ${dockGlass}
        animation: ${glassIn} 0.5s ${EASE} both;
        ${calm}
    }

    /* 데스크톱 앱의 제목 줄(36px) 밑으로 */
    ${WITH_TITLEBAR} & { --chip-top: ${px(TITLEBAR_H + SHELL.edge)}; }

    /* 본문은 칩·독 자리만큼 비킨다(oceanShell 의 두 값) — 다른 갈래·폰에는 이 값이 없어 그대로 2rem */
    @media (min-width: 769px) {
        & ~ main {
            --app-top-clearance: ${px(TOP_CLEARANCE)};
            --app-dock-clearance: ${px(DOCK_CLEARANCE)};
        }
    }
`;

/** 안쪽 상자는 풀어서 단추들이 독 한 줄에 서게 */
export const Content = styled(C.Content)`
    display: contents;
`;

/** 폭 조절 손잡이 — 바다에는 칸이 없으니 없다 */
export const SidebarContour = styled(C.SidebarContour)`
    display: none;
`;

/**
 * 빠른 이동 + 화면 단추들. 빠른 이동이 맨 앞(1), 나눔선(2), 홈(3, Profile 쪽), 나머지(4), 설정(9, Profile 쪽).
 * 단추는 유리와 함께 한 번 떠오르며 들어온다 (끝없는 움직임 없음)
 */
export const MenuWrapper = styled(C.MenuWrapper)`
    display: contents;

    & > * { margin-top: 0; }
    & > button {
        order: 4;
        animation: ${rise} 0.45s ${EASE} backwards;
        ${calm}
    }
    & > button:first-of-type { order: 1; }
`;

/** 빠른 이동 뒤의 세로 머리카락 선 */
export const Divider = styled(C.Divider)`
    order: 2;
    flex: none;
    width: 1px;
    height: 22px;
    margin: 0 5px;
    background: ${(p) => hairline(p.theme, true)};
    i { display: none; }
`;

/** 상표·사람 칸은 칩으로 떠나고, 설정·홈 단추는 독에 선다 (설정은 맨 끝, 홈은 화면 단추들의 맨 앞) */
export const ProfileWrapper = styled(C.ProfileWrapper)`
    display: contents;

    & > * { margin-top: 0; }
    & > button {
        animation: ${rise} 0.45s ${EASE} backwards;
        ${calm}
    }
    & > button:nth-of-type(2) { order: 3; }
    & > button:nth-of-type(1) {
        order: 9;
        margin-left: 11px;

        /* 설정 앞의 세로 머리카락 선 (단추의 별 자리 ::before 를 빌린다) */
        &::before {
            content: "";
            display: block;
            position: absolute;
            left: -7px;
            top: 50%;
            bottom: auto;
            width: 1px;
            height: 22px;
            margin-top: -11px;
            clip-path: none;
            border-radius: 0;
            background: ${(p) => hairline(p.theme, true)};
            opacity: 1;
            transform: none;
            transition: none;
        }
    }
`;

/* ── 상표 칩 (왼쪽 위) ────────────────────────────────────────────────── */

/** 칩의 왼쪽 — 기울인 세리프 상표. 칩 유리는 옆의 사람 칸(UserWrapper)이 깔고, 상표는 그 위 왼쪽 자리에 얹힌다 */
export const LogoRow = styled(C.LogoRow)`
    position: fixed;
    z-index: 2;
    top: var(--chip-top);
    left: ${px(SHELL.edge)};
    width: ${px(SHELL.logoW)};
    height: ${px(SHELL.chipH)};
    margin: 0;
    padding: 0 0 2px 16px;
    gap: 0;
    animation: ${glassIn} 0.5s ${EASE} both;
    ${calm}

    & > hr { display: none; }
    &:hover ${C.Logo} { color: ${(p) => p.theme.colors.primary}; }

    /* 데스크톱 앱은 제목 줄이 상표를 보인다 */
    ${WITH_TITLEBAR} & { display: none; }
`;

export const Logo = styled(C.Logo)`
    font-family: ${SERIF};
    font-style: italic;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    transition: color 0.15s ease;
    /* 글자는 CRONOS 로 들어오지만 세리프 기울임에는 Cronos 가 어울린다 */
    text-transform: lowercase;
    &::first-letter { text-transform: uppercase; }
`;

/** 칩 — 유리 한 장. 왼쪽은 상표 자리로 비워 두고, 그 오른쪽에 사람 단추 */
export const UserWrapper = styled(C.UserWrapper)`
    --ocean-glass: 1;
    position: fixed;
    z-index: 1;
    top: var(--chip-top);
    left: ${px(SHELL.edge)};
    display: flex;
    align-items: center;
    height: ${px(SHELL.chipH)};
    margin: 0;
    padding: 0 4px 0 ${px(SHELL.logoW)};
    border-radius: 14px;

    /* 유리 — 칸 자체에 걸면 펼친 창(ProfilePopup)의 흐림이 이 안에 갇힌다 */
    &::before {
        ${pane}
        ${dockGlass}
        animation: ${glassIn} 0.5s ${EASE} both;
        ${calm}
    }

    /* 상표와 사람 사이의 세로 선 */
    &::after {
        content: "";
        position: absolute;
        left: ${px(SHELL.logoW - 7)};
        top: 11px;
        bottom: 11px;
        width: 1px;
        background: ${(p) => hairline(p.theme, true)};
        pointer-events: none;
    }

    ${WITH_TITLEBAR} & {
        padding-left: 4px;
        &::after { display: none; }
    }
`;

/** 사람 단추 — 24px 얼굴, 13px 이름, 작은 화살. 올리거나 펼치면 옅게 칠한다 */
export const UserClickable = styled(C.UserClickable)`
    height: 30px;
    padding: 0 8px 0 3px;
    border: none;
    border-radius: 10px;
    font-size: 0.8125rem;
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => (p.$open ? ink(p.theme, dark(p) ? 0.09 : 0.06) : "transparent")};
    transition: background-color 0.15s ease;
    animation: ${glassIn} 0.5s ${EASE} both;
    ${calm}

    &:hover { background: ${(p) => ink(p.theme, dark(p) ? 0.09 : 0.06)}; border: none; }
    &:focus-visible { border: none; }
    ${focusRing}

    & > svg { color: ${(p) => p.theme.colors.textSecondary}; }
    & > svg:first-child { width: 24px; height: 24px; }
`;

export const ProfileImage = styled(C.ProfileImage)`
    width: 24px;
    height: 24px;
`;

export const UserName = styled(C.UserName)`
    max-width: 160px;
    margin: 0 6px 0 8px;
    font-weight: 600;
    letter-spacing: -0.01em;
`;

/** 펼친 계정 창 — 칩 바로 밑에 뜨는 흰 판 */
export const ProfilePopup = styled(C.ProfilePopup)`
    ${surface("float")}
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: max-content;
    min-width: 248px;
    max-width: 300px;
    padding: 6px 0 8px;
    border-radius: 14px;
    overflow: hidden;
    color: ${(p) => p.theme.colors.text};
    &::before, &::after { display: none; }
`;

export const Sigil = styled(C.Sigil)`
    border: none;
    border-radius: 50%;
    font-weight: 600;
    color: ${(p) => (dark(p) ? "#06110F" : "#FFFFFF")};
    background: ${(p) => p.theme.colors.primary};
`;

export const SigilImage = styled(C.SigilImage)`
    border: none;
    border-radius: 50%;
`;

export const SectionLabel = styled(C.SectionLabel)`
    ${label}
`;

export const RuleLine = styled(C.RuleLine)`
    height: 1px;
    background: ${(p) => hairline(p.theme)};
`;

/** 별 대신 아무것도 — 선만 남긴다 */
export const RuleStar = styled(C.RuleStar)`
    display: none;
`;

export const PopupDivider = styled(C.PopupDivider)`
    border-top: none;
    height: 1px;
    background: ${(p) => hairline(p.theme)};
`;

/** 차림 한 줄 — 올리면 옅게 칠한다 (별·밑줄 없음) */
export const PopupItem = styled(C.PopupItem)`
    margin: 0 6px;
    width: calc(100% - 12px);
    padding: 9px 10px;
    border-radius: 8px;
    font-size: 0.86rem;
    background-image: none;
    transition: background-color 0.15s ease;
    &::before, &::after { display: none; }
    &:hover, &:focus-visible {
        background-color: ${(p) => (p.$danger ? withAlpha(p.theme.colors.error, 0.1) : ink(p.theme, dark(p) ? 0.08 : 0.05))};
    }
`;
