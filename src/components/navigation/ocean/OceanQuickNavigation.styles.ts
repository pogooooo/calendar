/**
 * 바다의 빠른 이동(Ctrl+K) — 실선 아래 맨 입력줄과 네모난 결과 줄(Celestial) 대신 **명령 창**(Raycast·Linear 결):
 *   큰 입력 줄(돋보기 + 16px 글씨, 칸 테두리 없이) 밑에 머리카락 선 하나
 *   결과는 40px 줄, 고른 줄은 옅게 칠해지고(ink 0.06) 오른쪽 화살이 그 줄에만 나타난다
 *   창은 화면 위쪽에 뜬다(OceanBaseModal) — 결과 수가 바뀌어도 입력 줄이 제자리
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialQuickNavigation.styles";
import { hairline, ink } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";
import { ghostIcon } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialQuickNavigation.styles";

/** 입력 줄 — 크게, 칸 테두리 없이 */
export const SearchRow = styled(C.SearchRow)`
    gap: 12px;
    padding: 12px 12px 12px 18px;
    color: ${(p) => p.theme.colors.textSecondary};
    border-bottom: 1px solid ${(p) => hairline(p.theme)};

    & > svg:first-child { width: 18px; height: 18px; stroke-width: 1.75; flex: none; }
`;

export const Input = styled(C.Input)`
    padding: 8px 0;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    caret-color: ${(p) => p.theme.colors.primary};
    outline: none;
    &::placeholder { color: ${(p) => p.theme.colors.textSecondary}; opacity: 0.75; }
`;

export const Close = styled(C.Close)`
    ${ghostIcon("28px")}
    ${MOBILE} { width: 44px; height: 44px; }
`;

export const Results = styled(C.Results)`
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 6px;
`;

/** 결과 한 줄 — 40px, 고르면 옅게 칠해지고 화살이 나타난다 */
export const Result = styled(C.Result)`
    min-height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.005em;
    background: transparent;
    transition: background-color 0.1s ease;

    svg {
        width: 16px;
        height: 16px;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 0;
        transition: opacity 0.1s ease;
    }

    ${(p) => p.$selected && css`
        background-color: ${ink(p.theme, p.theme.mode === "dark" ? 0.09 : 0.06)};
        svg { opacity: 1; }
    `}

    &:focus-visible { outline: none; background-color: ${(p) => ink(p.theme, 0.06)}; }
    @media (hover: none) { min-height: 44px; svg { opacity: 1; } }
`;

export const Empty = styled(C.Empty)`
    margin: 0;
    padding: 20px 12px;
    text-align: center;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
`;
