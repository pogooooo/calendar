/**
 * 바다의 달 — 금빛 눈금 반원(Celestial)·놋쇠 해시계(Maple) 대신 글씨로 세운 날짜 한 줄과 가는 눈금 띠.
 * 큰 숫자는 Pretendard 굵게, 달 이름은 기울인 Instrument Serif, 꼬리표는 고정폭 대문자. 색은 청록 한 점뿐.
 */
import styled from "styled-components";
import { SERIF, ink, label } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";

export const Hero = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;

    .eyebrow { ${label} }

    .date {
        display: flex;
        align-items: baseline;
        gap: 14px;
        min-width: 0;
        color: ${(p) => p.theme.colors.text};
    }
    em {
        font-family: ${SERIF};
        font-style: italic;
        font-size: 2.75rem;
        line-height: 1;
        letter-spacing: -0.01em;
        white-space: nowrap;
    }
    b {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-weight: 700;
        font-size: 4rem;
        line-height: 0.9;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
    }

    ${MOBILE} {
        gap: 6px;
        .date { gap: 10px; }
        em { font-size: 1.9rem; }
        b { font-size: 2.6rem; }
    }
`;

/** 그달의 눈금 — 날 하나에 눈금 하나. 지난날은 옅은 먹, 보는 날은 청록, 일정이 있는 날엔 아래 점 */
export const Strip = styled.div`
    order: 2;
    display: flex;
    height: 22px;

    i {
        position: relative;
        flex: 1;
        min-width: 0;

        &::before {
            content: "";
            position: absolute;
            left: 50%;
            top: 2px;
            width: 2px;
            height: 12px;
            margin-left: -1px;
            border-radius: 1px;
            background: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.14 : 0.1)};
        }
        &.past::before { background: ${(p) => ink(p.theme, 0.25)}; }
        &.now::before {
            top: 0;
            height: 16px;
            width: 3px;
            margin-left: -1.5px;
            background: ${(p) => p.theme.colors.primary};
        }

        &.busy::after, &.anv::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 19px;
            width: 3px;
            height: 3px;
            margin-left: -1.5px;
            border-radius: 50%;
            background: ${(p) => ink(p.theme, 0.45)};
        }
        &.anv::after { background: ${(p) => p.theme.colors.weekend}; }
        &.now.busy::after { background: ${(p) => p.theme.colors.primary}; }
    }
`;
