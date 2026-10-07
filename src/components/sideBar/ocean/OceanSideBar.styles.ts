/**
 * 바다의 사이드바 — 모래 물가. 화면의 나머지는 물이고, 사이드바는 그 물에 닿은 모래밭이다.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고 달라지는 것만 덮어쓴다.
 *
 * 금빛 실선·별(Celestial), 먹 표제·씨앗(Maple) 대신:
 *   모래알 결 판 + 오른쪽이 물결 모양으로 오려진 물가 선(물거품은 OceanSidebarDesign 이 그 선을 따라 그린다),
 *   표제는 가는 세리프 CRONOS 와 잔물결, 사람 칸은 매끈한 조약돌, 펼친 창은 바다유리, 나눔선은 진주 한 알 박힌 물가 잔해 줄.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSideBar.styles";
import { withAlpha } from "@/styles/color";
import { LATIN, R, sand, sandInk, seaGlass } from "@/styles/ocean/water";
import { SHORE_PERIOD, SHORE_REACH, shoreMask } from "@/styles/ocean/shoreArt";

export * from "../celestial/CelestialSideBar.styles";

const MASK = shoreMask();
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 모래밭 — 판 자체는 비우고, 뒤에 모래 한 겹(::before)을 깔아 오른쪽 끝을 물가 선으로 오린다 */
export const SideBarWrapper = styled(C.SideBarWrapper)`
    background-color: transparent;
    color: ${(p) => sandInk(p.theme)};
    transform: none;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: -${SHORE_REACH}px;
        z-index: 0;
        pointer-events: none;
        ${sand}
        -webkit-mask: linear-gradient(#000 0 0) left top / calc(100% - ${SHORE_REACH}px) 100% no-repeat, ${MASK} right top / ${SHORE_REACH}px ${SHORE_PERIOD}px repeat-y;
        mask: linear-gradient(#000 0 0) left top / calc(100% - ${SHORE_REACH}px) 100% no-repeat, ${MASK} right top / ${SHORE_REACH}px ${SHORE_PERIOD}px repeat-y;
    }
`;

/** 물가 선 위에 물거품을 얹는 자리 — 사이드바 끝에서 20px 안쪽부터 물 쪽으로 60px */
export const SidebarContour = styled(C.SidebarContour)`
    top: 0;
    right: auto;
    left: calc(100% - 20px);
    width: 80px;
    height: 100% !important;
    z-index: 1;

    &::before { left: 0; width: 80px; }
`;

/** 표제: 가는 세리프 CRONOS, 옆에 잔물결 한 줄 */
export const LogoRow = styled(C.LogoRow)`
    gap: 12px;

    & > hr {
        border: none;
        height: 8px;
        background: url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='8' viewBox='0 0 24 8'><path d='M0 4 Q3 1 6 4 T12 4 T18 4 T24 4' fill='none' stroke='#000' stroke-width='1.2' stroke-linecap='round'/></svg>")}") repeat-x left center / 24px 8px;
        opacity: 0.35;
        filter: ${(p) => (dark(p) ? "invert(1)" : "none")};
    }
`;

export const Logo = styled(C.Logo)`
    font-family: ${LATIN};
    color: ${(p) => sandInk(p.theme)};
    letter-spacing: 0.28em;
    font-weight: 400;
`;

/** 사람 칸 — 물에 닳은 매끈한 조약돌 */
export const UserClickable = styled(C.UserClickable)`
    border-radius: ${R.pill};
    padding: 6px 10px 6px 7px;
    color: ${(p) => sandInk(p.theme)};
    background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.38)")};
    border: 1px solid ${(p) => (p.$open ? withAlpha(p.theme.colors.primary, 0.7) : dark(p) ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.65)")};
    box-shadow: 0 3px 8px -4px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.6)" : "rgba(110, 80, 40, 0.35)")}, inset 0 1px 0 ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.8)")};
    transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;

    &:hover { border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.55)")}; }
    &:focus-visible { border-color: ${(p) => p.theme.colors.primary}; }
    & > svg { color: ${(p) => sandInk(p.theme, true)}; }
`;

export const ProfileImage = styled(C.ProfileImage)`
    box-shadow: 0 0 0 2px ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.9)")};
`;

export const UserName = styled(C.UserName)`
    font-family: ${(p) => p.theme.fonts.display};
`;

/** 펼친 창 — 바다유리 한 장 */
export const ProfilePopup = styled(C.ProfilePopup)`
    ${seaGlass("float")}
    position: absolute;
    border-radius: ${R.lg};
    overflow: hidden;
    color: ${(p) => p.theme.colors.text};
    &::before, &::after { display: none; }
`;

/** 얼굴 칸 — 진주 */
export const Sigil = styled(C.Sigil)`
    border: none;
    border-radius: 50%;
    color: ${(p) => (dark(p) ? "#062A36" : "#FFFFFF")};
    font-family: ${LATIN};
    background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.9) 0 14%, transparent 40%), linear-gradient(145deg, ${(p) => p.theme.colors.accent}, ${(p) => p.theme.colors.primary});
    box-shadow: 0 4px 10px ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
`;

export const SigilImage = styled(C.SigilImage)`
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #FFFFFF, 0 4px 10px ${(p) => withAlpha(p.theme.colors.primary, 0.3)};
`;

export const SectionLabel = styled(C.SectionLabel)`
    font-family: ${LATIN};
    letter-spacing: 0.22em;
    color: ${(p) => p.theme.colors.primary};
    opacity: 0.8;
`;

/** 별 대신 진주, 금빛 실선 대신 옅은 물빛 선 */
export const RuleLine = styled(C.RuleLine)`
    height: 1.5px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, ${(p) => withAlpha(p.theme.colors.accent, 0.8)}, transparent);
`;

export const RuleStar = styled(C.RuleStar)`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    clip-path: none;
    background: radial-gradient(circle at 35% 30%, #FFFFFF 0 25%, transparent 50%), ${(p) => p.theme.colors.primary};
`;

export const PopupDivider = styled(C.PopupDivider)`
    border-top: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${(p) => withAlpha(p.theme.colors.primary, 0.25)}, transparent);
`;

/** 차림 한 줄 — 올리면 옅은 물빛이 고인다 (별·밑줄 없음) */
export const PopupItem = styled(C.PopupItem)`
    margin: 0 8px;
    width: calc(100% - 16px);
    border-radius: 12px;
    background-image: none;
    transition: background-color 0.2s ease, color 0.2s ease;
    &::before, &::after { display: none; }
    &:hover, &:focus-visible {
        background-color: ${(p) => withAlpha(p.$danger ? p.theme.colors.error : p.theme.colors.accent, 0.18)};
    }
`;

/** 메뉴 위 나눔선 — 물가에 밀려온 잔해 줄(작은 조각들)과 가운데 진주 한 알 */
export const Divider = styled(C.Divider)`
    height: 4px;
    margin: 20px 6px 8px;
    background: radial-gradient(circle, ${(p) => withAlpha(sandInk(p.theme), 0.35)} 0 1px, transparent 1.6px) 0 50% / 9px 4px repeat-x;

    i {
        width: 9px;
        height: 9px;
        transform: translate(-50%, -50%);
        border: none;
        border-radius: 50%;
        background: radial-gradient(circle at 34% 30%, #FFFFFF 0 22%, transparent 48%), radial-gradient(circle, #F4EEE6, #D8CBB9);
        box-shadow: 0 1px 3px rgba(90, 60, 30, 0.35), 0 0 0 4px ${(p) => (dark(p) ? "#333B45" : "#F2E0C0")};
    }
`;
