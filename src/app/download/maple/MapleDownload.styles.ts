/**
 * Maple 의 내려받기 화면 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 종이 바탕에 명조 상표(붉은 잎 하나), 알약 단추, 둥근 카드. 큰 그림은 노트 두 장(MapleHeroScene).
 * 2026-10-15 다시 그리며 화면 가득 흩뿌린 잎 점(별 하늘 자리)·카드 귀의 먹 덩굴·넓은 자간을 걷었다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDownload.styles";
import { withAlpha } from "@/styles/color";
import { cardShadow, crest, hair, leafBullet, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialDownload.styles";

type P = { theme: { mode: string; colors: { primary: string; text: string } } };
const dark = (p: P) => p.theme.mode === "dark";
const line = (p: P) => hair(p.theme, dark(p) ? 0.12 : 0.09);

/** 별 하늘 — Maple 에는 없다(큰 그림의 잎만 진다) */
export const Sky = styled(C.Sky)`
    display: none;
`;

export const NavBrand = styled(C.NavBrand)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.06em;

    &::before {
        content: "";
        ${crest("0.85em")}
        color: ${(p) => p.theme.colors.primary};
        rotate: -12deg;
    }
`;

export const NavLink = styled(C.NavLink)`
    font-size: 0.85rem;
    letter-spacing: 0;
`;

export const NavCta = styled(C.NavCta)`
    ${stampButton("default")}
    font-size: 0.82rem;
`;

export const Brand = styled(C.Brand)`
    font-weight: 700;
    letter-spacing: 0.04em;

    @media (max-width: 720px) { letter-spacing: 0.03em; }
`;

/** 표제 밑의 한 줄 */
export const Tagline = styled(C.Tagline)`
    margin-top: 14px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0;
`;

export const Lead = styled(C.Lead)`
    font-size: 0.98rem;
`;

export const DownloadNotice = styled(C.DownloadNotice)`
    border-left: none;
    border-radius: 10px;
    background-color: ${(p) => withAlpha(p.theme.colors.error, dark(p) ? 0.16 : 0.08)};
`;

export const PrimaryCta = styled(C.PrimaryCta)`
    ${stampButton("primary")}
    padding: 13px 24px;
    font-size: 0.92rem;

    /* 금빛 쓸림(shine)은 Maple 에 없다 */
    &::after { display: none; }
`;

export const CtaMeta = styled(C.CtaMeta)`
    /* 채운 단추 위라 단추 글씨색(밝음은 흰색, 어둠은 짙은 밤색)을 옅게 */
    border-left-color: ${(p) => withAlpha(p.theme.mode === "dark" ? "#1A1512" : "#FFFFFF", 0.4)};
    color: inherit;
    opacity: 0.8;
`;

export const GhostCta = styled(C.GhostCta)`
    ${stampButton("ghost")}
    padding: 13px 20px;
    font-size: 0.92rem;
`;

/** 큰 그림 자리: 노트 두 장(HeroScene 이 갈래마다 다르다). 카드 둘레로 잎이 지날 자리까지 넉넉히 */
export const HeroArt = styled(C.HeroArt)`
    width: 470px;
    height: 410px;
    margin-right: -28px;

    &::before, &::after { display: none; }

    @media (max-width: 1000px) { width: 340px; height: 310px; margin-right: 0; }
`;

export const SectionTitle = styled(C.SectionTitle)`
    gap: 10px;
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0;

    /* 제목 옆의 작은 잎 (실선 대신) */
    &::after {
        content: "";
        flex: none;
        height: auto;
        background: none;
        ${crest("0.6em")}
        color: ${(p) => p.theme.colors.primary};
    }
`;

/** 소개 칸: 카드 한 장 — 올리면 살짝 떠오른다 */
export const Feature = styled(C.Feature)`
    ${paperCard()}
    padding: 22px;

    &::after { display: none; }

    &:hover, &:focus-visible {
        border-color: ${(p) => hair(p.theme, 0.18)};
        box-shadow: ${(p) => (dark(p)
            ? "0 2px 6px rgba(0, 0, 0, 0.4), 0 18px 40px -14px rgba(0, 0, 0, 0.6)"
            : "0 2px 6px rgba(86, 54, 32, 0.06), 0 18px 40px -14px rgba(86, 54, 32, 0.25)")};
    }
`;

export const FeatureVisual = styled(C.FeatureVisual)`
    border-bottom: 1px solid ${line};
    border-radius: 0;
`;

export const FeatureTitle = styled(C.FeatureTitle)`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 1.02rem;
    font-weight: 700;
    letter-spacing: 0;
`;

export const FeatureDesc = styled(C.FeatureDesc)`
    font-size: 0.86rem;
`;

export const MiniCalendar = styled(C.MiniCalendar)`
    .cell { border-radius: 3px; border-color: ${(p) => hair(p.theme, 0.16)}; }
`;

/** 작은 챌린지 그림의 ✦ → 잎 */
export const MiniChallenge = styled(C.MiniChallenge)`
    .day {
        font-size: 0;
        width: 12px;
        height: 12px;
        ${leafBullet(false, "12px")}
        color: ${(p) => p.theme.colors.primary};
    }

    .day.on { ${leafBullet(true, "12px")} color: ${(p) => p.theme.colors.primary}; }
`;

/** 내려받기 줄: 카드 묶음 한 장 안의 줄들 */
export const PlatformList = styled(C.PlatformList)`
    ${paperCard()}
    overflow: hidden;
    border-top: 1px solid ${line};
    box-shadow: ${cardShadow};
`;

export const PlatformRow = styled(C.PlatformRow)`
    padding: 16px 18px;
    border-bottom-color: ${line};
    transition: background-color 0.15s ease;

    &:last-child { border-bottom: none; }
    &:hover:not(:disabled) {
        box-shadow: none;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.06 : 0.035)};
    }
`;

export const RowName = styled(C.RowName)`
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0;
`;

export const RowMine = styled(C.RowMine)`
    padding: 2px 8px;
    border: none;
    border-radius: 999px;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1)};
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0;
`;

export const RowMeta = styled(C.RowMeta)`
    font-size: 0.8rem;
    letter-spacing: 0;
`;

export const RowAction = styled(C.RowAction)`
    ${stampButton("default", { square: true })}
    width: 34px;
    height: 34px;
`;

/** 화면 머리·바닥의 실선 */
export const Section = styled(C.Section)`
    &::before, &::after { background: ${line}; }
`;

export const Foot = styled(C.Foot)`
    border-top-color: ${line};
    font-family: inherit;
    font-size: 0.8rem;
    letter-spacing: 0;
    background: ${(p) => withAlpha(p.theme.colors.surface, 0.5)};
`;

export const FootLinks = styled(C.FootLinks)`
    a { letter-spacing: 0; }
`;

/** 읽는 자리 표시 띠 */
export const ProgressBar = styled(C.ProgressBar)`
    background: ${(p) => p.theme.colors.primary};
    box-shadow: none;
`;
