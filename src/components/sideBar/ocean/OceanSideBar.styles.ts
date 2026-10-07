/**
 * 바다의 사이드바 — 물 위에 뜬 반투명 판 하나(가장자리에서 12px 떨어져 떠 있다).
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고 달라지는 것만 덮어쓴다.
 *
 * Celestial 은 금빛 실선 표제와 별, Maple 은 먹 표제·씨앗. 바다는 기울인 세리프 상표(Cronos) 하나와
 * 머리카락 선, 고른 줄은 옅은 청록 면 — 장식 없이 글과 간격으로.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSideBar.styles";
import { withAlpha } from "@/styles/color";
import { EASE, R, SERIF, focusRing, hairline, ink, label, sand, surface } from "@/styles/ocean/water";

export * from "../celestial/CelestialSideBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 떠 있는 판 — 화면 가장자리에서 12px 떨어지고, 모서리는 20px */
export const SideBarWrapper = styled(C.SideBarWrapper)`
    ${sand}
    margin: 12px 30px 12px 12px;
    padding: 0 14px;
    border-radius: ${R.lg};
    border: 1px solid ${(p) => hairline(p.theme)};
    box-shadow: 0 16px 40px -24px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.6)" : "rgba(18, 33, 32, 0.18)")};
    transform: none;

    @media (max-height: 640px) { margin-top: 8px; margin-bottom: 8px; }
`;

/** 폭 조절 손잡이 — 판 바로 바깥의 가는 띠 (올리면 선 하나가 선다, OceanSidebarDesign) */
export const SidebarContour = styled(C.SidebarContour)`
    top: 0;
    right: auto;
    left: calc(100% + 1px);
    width: 14px;
    height: 100% !important;
    &::before { left: 0; width: 14px; }
`;

/** 상표 — 기울인 세리프 Cronos */
export const LogoRow = styled(C.LogoRow)`
    margin-top: 22px;
    padding: 0 6px;
    & > hr { display: none; }
`;

export const Logo = styled(C.Logo)`
    font-family: ${SERIF};
    font-style: italic;
    font-size: 1.7rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    /* 글자는 CRONOS 로 들어오지만 세리프 기울임에는 Cronos 가 어울린다 */
    text-transform: lowercase;
    &::first-letter { text-transform: uppercase; }
`;

/** 사람 칸 — 줄 하나. 올리면 옅게 칠한다 */
export const UserClickable = styled(C.UserClickable)`
    border: none;
    border-radius: 10px;
    padding: 6px 8px;
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => (p.$open ? ink(p.theme, dark(p) ? 0.08 : 0.05) : "transparent")};
    transition: background-color 0.15s ease;
    &:hover { background: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.05)}; border: none; }
    ${focusRing}
    & > svg { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const ProfileImage = styled(C.ProfileImage)`
    width: 26px;
    height: 26px;
`;

export const UserName = styled(C.UserName)`
    font-size: 0.9rem;
    font-weight: 600;
`;

/** 펼친 창 */
export const ProfilePopup = styled(C.ProfilePopup)`
    ${surface("float")}
    position: absolute;
    border-radius: 14px;
    padding: 6px 0 8px;
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

/** 메뉴 위 나눔선 — 머리카락 선 하나 */
export const Divider = styled(C.Divider)`
    height: 1px;
    margin: 14px 8px 8px;
    background: ${(p) => hairline(p.theme)};
    i { display: none; }
`;

export const MenuWrapper = styled(C.MenuWrapper)`
    & > * { margin-top: 2px; }
    transition: opacity 0.3s ${EASE};
`;

export const ProfileWrapper = styled(C.ProfileWrapper)`
    margin-bottom: 18px;
    & > * { margin-top: 6px; }
`;
