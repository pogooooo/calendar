/**
 * Maple 의 사이드바 — 도감의 색인 면. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선·별 대신: 먹 글씨 표제, 씨앗 셋이 달린 짧은 먹선, 표본 이름표 같은 사람 칸, 종이 쪽지 같은 메뉴.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSideBar.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, leafBullet, paperCard, shortRule } from "@/styles/maple/ink";

export * from "../celestial/CelestialSideBar.styles";

/** 표제: 먹 글씨 CRONOS, 옆에 씨앗 셋 달린 짧은 먹선 */
export const LogoRow = styled(C.LogoRow)`
    gap: 12px;

    & > hr {
        border: none;
        height: 14px;
        ${shortRule("14px")}
        mask-position: left center;
        -webkit-mask-position: left center;
        background-color: ${(p) => p.theme.colors.text};
        opacity: 0.7;
    }
`;

export const Logo = styled(C.Logo)`
    color: ${(p) => p.theme.colors.text};
    letter-spacing: 0.2em;
`;

/** 사람 칸: 표본 이름표 — 종이 한 장에 먹 하이라인 */
export const UserClickable = styled(C.UserClickable)`
    ${paperCard("2px")}
    padding: 7px 9px;
    border-color: ${(p) => (p.$open ? p.theme.colors.primary : hair(p.theme, 0.35))};

    &:hover { border-color: ${(p) => hair(p.theme, 0.7)}; }
    &:focus-visible { border-color: ${(p) => p.theme.colors.primary}; }

    /* 기본 얼굴 그림은 먹으로 */
    & > svg { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const ProfileImage = styled(C.ProfileImage)`
    border: 1px solid ${(p) => hair(p.theme, 0.4)};
`;

export const UserName = styled(C.UserName)`
    font-family: ${(p) => p.theme.fonts.display};
`;

/** 펼친 쪽지 */
export const ProfilePopup = styled(C.ProfilePopup)`
    ${paperCard("4px")}
    border-color: ${(p) => hair(p.theme, 0.5)};
    box-shadow: 0 10px 24px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.5 : 0.16)};

    &::after { display: none; }
`;

export const Sigil = styled(C.Sigil)`
    border-radius: 50%;
    border-color: ${(p) => hair(p.theme, 0.5)};
    color: ${(p) => p.theme.colors.primary};
    font-family: ${(p) => p.theme.fonts.display};
`;

export const SigilImage = styled(C.SigilImage)`
    border-radius: 50%;
    border-color: ${(p) => hair(p.theme, 0.5)};
`;

export const RuleLine = styled(C.RuleLine)`
    background-color: ${(p) => hair(p.theme, 0.3)};
`;

/** 쪽지 가운데의 별 → 잎 */
export const RuleStar = styled(C.RuleStar)`
    clip-path: none;
    ${leafBullet(true, "9px")}
    color: ${(p) => p.theme.colors.primary};
`;

export const SectionLabel = styled(C.SectionLabel)`
    letter-spacing: 0.1em;
`;

export const PopupDivider = styled(C.PopupDivider)`
    border-top-color: ${(p) => hair(p.theme, 0.3)};
`;

/** 쪽지의 줄: 누르면 황토 물이 든다. 별·밑줄 없음 */
export const PopupItem = styled(C.PopupItem)`
    background-image: none;

    &::before, &::after { display: none; }

    &:hover {
        background-color: ${(p) => withAlpha(p.$danger ? p.theme.colors.error : p.theme.colors.accent, p.$danger ? 0.12 : 0.2)};
    }
`;

/** 메뉴 위의 나눔선: 먹 하이라인에 잎 문장 하나 */
export const Divider = styled(C.Divider)`
    background: linear-gradient(to right, transparent, ${(p) => hair(p.theme, 0.4)}, transparent);

    i {
        width: 13px;
        height: 13px;
        border: none;
        transform: translate(-50%, -50%);
        ${crest("13px")}
        background-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 4px ${(p) => p.theme.colors.background};
    }
`;
