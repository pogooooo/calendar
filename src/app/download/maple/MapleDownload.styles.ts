/**
 * Maple 의 내려받기 화면 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 별 하늘 대신 지나가는 잎, 금빛 단추 대신 도장, 칸은 종이 카드에 덩굴 귀.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDownload.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, inkMask, leafBullet, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialDownload.styles";

/** 하늘의 별 → 흩날리는 잎. ✦ 글자는 숨기고 잎 마스크로 */
export const Star = styled(C.Star)`
    font-size: 0;
    opacity: ${(p) => (p.theme.mode === "dark" ? 0.2 : 0.26)};

    &:not(:empty) {
        width: 11px;
        height: 11px;
        ${leafBullet(true, "11px")}
        background-color: ${(p) => p.theme.colors.primary};
    }

    i {
        border-radius: 0;
        ${inkMask("bullet-filled.webp")}
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

/** 맨 위 줄의 단추: 도장 */
export const NavCta = styled(C.NavCta)`
    ${stampButton("default")}
`;

export const PrimaryCta = styled(C.PrimaryCta)`
    ${stampButton("primary")}

    /* 금빛 쓸림(shine)은 Maple 에 없다 — 도장은 빛나지 않는다 */
    &::after { display: none; }
`;

export const GhostCta = styled(C.GhostCta)`
    ${stampButton("ghost")}
`;

/** 표제 밑의 한 줄 */
export const Tagline = styled(C.Tagline)`
    letter-spacing: 0.1em;
`;

/** 소개 칸: 종이 카드에 덩굴 귀 */
export const Feature = styled(C.Feature)`
    ${paperCard("5px")}
    border-color: ${(p) => hair(p.theme, 0.32)};

    &::after {
        width: 20px;
        height: 20px;
        top: 3px;
        left: 3px;
        background: ${(p) => p.theme.colors.text};
        ${inkMask("corner.webp")}
        opacity: 0.5;
    }

    &:hover { border-color: ${(p) => hair(p.theme, 0.6)}; box-shadow: none; }
`;

/** 칸 제목 앞의 표식 */
export const FeatureTitle = styled(C.FeatureTitle)`
    letter-spacing: 0.06em;
`;

/** 작은 챌린지 그림의 ✦ → 잎 */
export const MiniChallenge = styled(C.MiniChallenge)`
    .day {
        font-size: 0;
        width: 12px;
        height: 12px;
        ${leafBullet(false, "12px")}
        background-color: ${(p) => p.theme.colors.primary};
    }

    .day.on { ${leafBullet(true, "12px")} background-color: ${(p) => p.theme.colors.primary}; }
`;

/** 내려받기 줄: 종이 한 장 */
export const PlatformRow = styled(C.PlatformRow)`
    border-color: ${(p) => hair(p.theme, 0.28)};

    &:hover { border-color: ${(p) => hair(p.theme, 0.5)}; box-shadow: none; }
`;

export const RowAction = styled(C.RowAction)`
    ${stampButton("default")}
`;

/** 화면 머리·바닥의 실선 */
export const Section = styled(C.Section)`
    &::before, &::after { background: ${(p) => hair(p.theme, 0.25)}; }
`;

export const SectionTitle = styled(C.SectionTitle)`
    letter-spacing: 0.08em;

    /* 제목 옆의 작은 문장 */
    &::after {
        content: "";
        display: inline-block;
        margin-left: 10px;
        width: 12px;
        height: 12px;
        vertical-align: -1px;
        ${crest("12px")}
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

export const Foot = styled(C.Foot)`
    border-top-color: ${(p) => hair(p.theme, 0.25)};
    background: ${(p) => withAlpha(p.theme.colors.surface, 0.5)};
`;

/** 읽는 자리 표시 띠 */
export const ProgressBar = styled(C.ProgressBar)`
    background: ${(p) => p.theme.colors.primary};
    box-shadow: none;
`;

/** 큰 그림 자리: 도감 한 장이 들어간다 (HeroScene 이 갈래마다 다르다) */
export const HeroArt = styled(C.HeroArt)`
    &::before, &::after { display: none; }
`;
