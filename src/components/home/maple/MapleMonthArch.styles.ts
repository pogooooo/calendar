/**
 * MapleMonthArch 의 모양 — 명조로 크게 쓴 날짜와 그달의 막대 띠.
 * 막대 길이는 --load(0~6)로 온다. 일정이 있는 날은 노랑·호박빛·주황으로 물들고(l1~l3), 보는 날만 단풍 붉음, 기념일은 분홍빛.
 */
import styled from "styled-components";
import { withAlpha } from "@/styles/color";
import { hair, watercolorLeaf } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 칸을 풀어 날짜(title)·띠(ribbon)가 MapleHomeLayout 머리의 격자 자리에 선다 */
export const Head = styled.div`
    display: contents;
`;

export const Title = styled.div`
    grid-area: title;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    margin-bottom: 20px;

    .eyebrow {
        font-size: 0.85rem;
        font-weight: 600;
        color: ${(p) => p.theme.colors.primary};
    }

    .date {
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 2.25rem;
        font-weight: 700;
        line-height: 1.15;
        color: ${(p) => p.theme.colors.text};
        white-space: nowrap;
    }

    ${MOBILE} {
        margin-bottom: 16px;
        .date { font-size: 1.75rem; }
    }
`;

/** 날마다 막대 하나. 위로 보는 날의 잎이, 아래로 마감 점이 나올 자리를 띄운다 */
export const Ribbon = styled.div`
    grid-area: ribbon;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 3px;
    height: 48px;
    padding: 0 1px;
    margin-bottom: 8px;

    i {
        position: relative;
        flex: 1 1 0;
        min-width: 0;
        max-width: 16px;
        height: calc(5px + var(--load, 0) * 4px);
        border-radius: 3px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.12)};
        transition: background-color 0.3s ease, height 0.3s ease;
    }
    /* 물든 정도 — 노란 잎 · 호박빛 · 주황 */
    i.l1 { background-color: ${(p) => (dark(p) ? "#C9A15A" : "#EBC47A")}; }
    i.l2 { background-color: ${(p) => p.theme.colors.accent}; }
    i.l3 { background-color: ${(p) => (dark(p) ? "#E0874E" : "#D9773A")}; }
    i.anv { background-color: ${(p) => p.theme.colors.weekend}; }
    i.past { opacity: 0.45; }
    i.now {
        min-height: 12px;
        background-color: ${(p) => p.theme.colors.primary};
        opacity: 1;
    }
    /* 보는 날 위의 수채 잎 */
    i.now::before {
        content: "";
        position: absolute;
        left: 50%;
        bottom: calc(100% + 3px);
        ${watercolorLeaf("red", "18px")}
        transform: translateX(-50%) rotate(-14deg);
    }
    /* 마감이 있는 날 — 막대 밑에 점 */
    i.due::after {
        content: "";
        position: absolute;
        left: 50%;
        top: calc(100% + 4px);
        width: 4px;
        height: 4px;
        margin-left: -2px;
        border-radius: 50%;
        background-color: ${(p) => withAlpha(p.theme.colors.text, 0.55)};
    }

    ${MOBILE} { gap: 2px; height: 42px; }
`;
