/**
 * Maple 의 고른 날 목록(폰 월간 아래) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 달력 카드 아래의 카드 한 장. 머리는 단풍잎·명조 날짜·개수 알약·"일간 ›" 링크,
 * 줄마다 카테고리 색 단풍잎. 넓은 자간의 작은 머리글은 걷었다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialDayPeek.styles";
import { MOBILE } from "@/styles/breakpoints";
import { hair } from "@/styles/maple/ink";

export * from "../celestial/CelestialDayPeek.styles";

export const Wrap = styled(C.Wrap)`
    && { background:transparent; border:0; border-top:1px solid ${p => hair(p.theme,.18)}; border-radius:0; box-shadow:none; }
    margin-top: 12px;
    padding: 0 14px;
    overflow: hidden;
`;

export const Head = styled(C.Head)`
    min-height: 46px;
    gap: 8px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.07)};
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};

    /* 오늘이면 채운 잎, 아니면 윤곽 잎 */
    .hd {
        display:none;
    }

    .hr { display: none; }

    b {
        margin-left: auto;
        padding: 1px 8px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, 0.06)};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 600;
    }

    .open {
        padding-left: 6px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.8125rem;
        font-weight: 600;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.primary};
    }

    /* 뼈대는 떠 있는 + 단추를 비키려 오른쪽을 늘 64px 비웠다 — 그 단추가 이 줄에 닿는 키 작은 폰에서만 */
    ${MOBILE} { padding-right: 0; }
    @media (max-width: 768px) and (max-height: 700px) { padding-right: 60px; }
`;

/* 손가락으로 굴리는 목록 — 카드 안에 회색 막대가 서 있으면 어수선했다 */
export const List = styled(C.List)`
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`;

/** 한 줄 — 단풍잎(카테고리 색), 제목, 시각 */
export const Row = styled(C.Row)`
    gap: 12px;
    min-height: 46px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.06)};
    font-size: 0.875rem;

    &:last-child { border-bottom: none; }

    /* 색은 JSX 가 인라인 border-color(끝낸 것은 background 도)로 준다 — 굵은 테두리가 잎 모양에 잘려 잎을 칠한다 */
    .mark {
        width: 3px;
        height: 13px;
        box-sizing: border-box;
        border: 1.5px solid ${(p) => p.theme.colors.primary};
        background: transparent;
        transform: none;
        mask:none; -webkit-mask:none;
        opacity: ${(p) => (p.$done ? 0.4 : 1)};
    }

    .name { text-decoration-color: ${(p) => hair(p.theme, 0.4)}; }

    em {
        font-size: 0.75rem;
        letter-spacing: 0;
    }

    &:active { background: ${(p) => hair(p.theme, 0.04)}; }
`;

export const Empty = styled(C.Empty)`
    padding: 18px 0;
    font-size: 0.8125rem;
    text-align: center;
`;
