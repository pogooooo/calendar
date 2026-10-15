/**
 * Maple 의 사이드바 — 가을 노트의 목차. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선·별 대신: 수채 단풍잎 하나를 단 상표, 카드 한 장의 사람 칸, 옅은 선 하나의 나눔. 바탕은 비워 단풍 장면이 비친다.
 * 2026-10-15 다시 그리며 씨앗 달린 먹선·잎 화환·도장 문장을 걷었다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSideBar.styles";
import { withAlpha } from "@/styles/color";
import { cardShadow, hair, leafBullet, watercolorLeaf } from "@/styles/maple/ink";

export * from "../celestial/CelestialSideBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
/** 고른 줄·눌린 칸의 바탕 — 단풍 붉음을 옅게 */
const tint = (p: { theme: { mode: string; colors: { primary: string } } }) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1);

/** 바탕을 비운다 — 앱 바탕 장면(왼쪽 아래에 진 잎, 화면을 가로질러 지는 잎)이 사이드바 뒤로도 이어진다 */
export const SideBarWrapper = styled(C.SideBarWrapper)`
    background-color: transparent;
`;

/** 상표 칸 아래와 메뉴 줄 사이를 좁힌다 — 단추마다 10px 씩 띄우면 목차가 성글었다 */
export const ProfileWrapper = styled(C.ProfileWrapper)`
    margin-bottom: 0;

    & > button { margin-top: 2px; }
`;

export const MenuWrapper = styled(C.MenuWrapper)`
    & > * { margin-top: 2px; }
`;

/** 상표: 붉은 단풍잎 하나와 CRONOS. 옆으로 긋던 선은 뺀다 */
export const LogoRow = styled(C.LogoRow)`
    gap: 10px;
    margin-top: 28px;
    padding-left: 6px;

    & > hr { display: none; }
`;

export const Logo = styled(C.Logo)`
    display: flex;
    align-items: center;
    gap: 9px;
    color: ${(p) => p.theme.colors.text};
    font-size: clamp(0.9rem, 11cqw, 1.3rem);
    font-weight: 700;
    letter-spacing: 0.06em;

    &::before {
        content: "";
        ${watercolorLeaf("red", "1.15em")}
        flex-shrink: 0;
        transform: rotate(-14deg);
    }
`;

/** 사람 칸: 카드 한 장 — 얼굴·이름·펼침 꺾쇠 */
export const UserClickable = styled(C.UserClickable)`
    gap: 0;
    padding: 8px 10px;
    border-radius: 12px;
    background-color: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => (p.$open ? withAlpha(p.theme.colors.primary, 0.55) : hair(p.theme, dark(p) ? 0.1 : 0.08))};
    box-shadow: ${cardShadow};
    transition: border-color 0.2s ease;

    &:hover { border-color: ${(p) => (p.$open ? withAlpha(p.theme.colors.primary, 0.55) : hair(p.theme, 0.18))}; }
    &:focus-visible {
        border-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.18)};
    }

    /* 기본 얼굴 그림 */
    & > svg { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const ProfileImage = styled(C.ProfileImage)`
    border: 1px solid ${(p) => hair(p.theme, 0.12)};
`;

export const UserName = styled(C.UserName)`
    font-size: 0.875rem;
    font-weight: 600;
`;

/** 펼친 계정 창 — 카드 한 장, 조금 더 떠 있게 */
export const ProfilePopup = styled(C.ProfilePopup)`
    background-color: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.1)};
    border-radius: 14px;
    padding: 4px 0 6px;
    box-shadow: ${(p) => (dark(p)
        ? "0 2px 6px rgba(0, 0, 0, 0.4), 0 18px 40px -12px rgba(0, 0, 0, 0.6)"
        : "0 2px 6px rgba(86, 54, 32, 0.06), 0 18px 40px -12px rgba(86, 54, 32, 0.22)")};

    &::before, &::after { display: none; }
`;

/** 얼굴(그림이 없으면 이름의 첫 글자) — 둥글게, 단풍 붉음을 옅게 깐 바탕 */
export const Sigil = styled(C.Sigil)`
    border-radius: 50%;
    border: none;
    background-color: ${tint};
    color: ${(p) => p.theme.colors.primary};
    font-weight: 700;
`;

export const SigilImage = styled(C.SigilImage)`
    border-radius: 50%;
    border: 1px solid ${(p) => hair(p.theme, 0.12)};
`;

export const PopupName = styled(C.PopupName)`
    letter-spacing: 0;
`;

export const PopupEmail = styled(C.PopupEmail)`
    font-size: 0.8rem;
`;

/** 이름 아래 나눔: 옅은 선 사이에 작은 잎 하나 */
export const RuleLine = styled(C.RuleLine)`
    background-color: ${(p) => hair(p.theme, dark(p) ? 0.14 : 0.1)};
`;

export const RuleStar = styled(C.RuleStar)`
    clip-path: none;
    ${leafBullet(true, "9px")}
    color: ${(p) => withAlpha(p.theme.colors.primary, 0.8)};
`;

export const SectionLabel = styled(C.SectionLabel)`
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0;
    padding: 4px 16px 4px;
`;

export const PopupDivider = styled(C.PopupDivider)`
    margin: 4px 12px;
    border-top: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.08)};
`;

/** 계정 창의 줄 — 둥근 줄에 옅은 바탕이 깔린다. 별·밑줄 없음 */
export const PopupItem = styled(C.PopupItem)`
    width: calc(100% - 12px);
    margin: 0 6px;
    padding: 9px 10px;
    gap: 10px;
    border-radius: 8px;
    font-size: 0.875rem;
    letter-spacing: 0;
    background-image: none;
    transition: background-color 0.15s ease;

    &::before, &::after { display: none; }

    &:hover, &:focus-visible {
        background-color: ${(p) => (p.$danger ? withAlpha(p.theme.colors.error, dark(p) ? 0.16 : 0.08) : hair(p.theme, dark(p) ? 0.08 : 0.05))};
    }
`;

/** 메뉴 위의 나눔선 — 옅은 선 하나 */
export const Divider = styled(C.Divider)`
    margin: 14px 6px 8px;
    background: ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.09)};

    i { display: none; }
`;

