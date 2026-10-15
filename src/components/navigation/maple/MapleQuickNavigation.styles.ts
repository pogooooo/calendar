/**
 * Maple 의 빠른 이동(Ctrl+K) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 카드 한 장 위의 큰 입력 줄(칸 테두리 없이, 밑에 옅은 선 하나)과 둥근 결과 줄. 고른 줄은 단풍 붉음을 옅게 깐 바탕.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialQuickNavigation.styles";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialQuickNavigation.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const SearchRow = styled(C.SearchRow)`
    gap: 12px;
    padding: 12px 12px 12px 18px;
    color: ${(p) => p.theme.colors.textSecondary};
    border-bottom: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.08)};

    & > svg:first-child { width: 18px; height: 18px; flex: none; }
`;

/** 입력 줄 — 창 자체가 칸이라 초점 테를 따로 두르지 않는다(깜빡이는 붉은 커서로 안다) */
export const Input = styled(C.Input)`
    padding: 8px 0;
    font-size: 1rem;
    font-weight: 500;
    caret-color: ${(p) => p.theme.colors.primary};

    &:focus-visible { outline: none; }
`;

export const Close = styled(C.Close)`
    width: 30px;
    height: 30px;
    border-radius: 8px;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover { background-color: ${(p) => hair(p.theme, dark(p) ? 0.08 : 0.06)}; color: ${(p) => p.theme.colors.text}; }
    ${MOBILE} { width: 44px; height: 44px; }
`;

export const Result = styled(C.Result)`
    min-height: 40px;
    padding: 9px 12px;
    border-radius: 10px;
    font-weight: ${(p) => (p.$selected ? 600 : 400)};
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)};
    background: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1) : "transparent")};

    & > svg { opacity: ${(p) => (p.$selected ? 1 : 0.35)}; }
`;
