/**
 * MapleNotebook 의 모양 — 카드 두 장과 잎. 모든 치수는 em 이라 부르는 쪽이 --nb(글자 크기) 하나로 크기를 정한다.
 * 카드는 앱의 카드(paperCard)와 같은 말: surface 바탕, 옅은 선, 둥근 모서리, 부드러운 그림자.
 * 처음에 한 번 떠오르고, 작은 잎만 늘 천천히 진다(움직임을 끄면 잎도 멈춘다).
 */
import styled, { css, keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { checkStamp, crest, hair, watercolorLeaf } from "@/styles/maple/ink";

type P = { theme: { mode: string; colors: { primary: string; text: string; surface: string } } };
const dark = (p: P) => p.theme.mode === "dark";

const rise = keyframes`
    from { opacity: 0; translate: 0 1.6em; }
    to   { opacity: 1; translate: 0 0; }
`;
const fall = keyframes`
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    10%  { opacity: 0.75; }
    88%  { opacity: 0.6; }
    100% { transform: translate(var(--dx), 44em) rotate(320deg); opacity: 0; }
`;

const card = css`
    position: absolute;
    box-sizing: border-box;
    border-radius: 1.6em;
    background-color: ${(p: P) => p.theme.colors.surface};
    border: 1px solid ${(p: P) => hair(p.theme, dark(p) ? 0.1 : 0.07)};
    box-shadow: ${(p: P) => (dark(p)
        ? "0 0.2em 0.6em rgba(0, 0, 0, 0.35), 0 2.4em 5em -1.6em rgba(0, 0, 0, 0.7)"
        : "0 0.2em 0.6em rgba(86, 54, 32, 0.06), 0 2.4em 5em -1.6em rgba(86, 54, 32, 0.28)")};
    :where(html:not([data-theme-motion="off"])) & { animation: ${rise} 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
`;

export const Scene = styled.div`
    position: relative;
    width: 44em;
    height: 38em;
    font-size: var(--nb, 10px);
    pointer-events: none;
    user-select: none;
`;

/** 뒤의 달 카드 — 5주 × 7일, 일정 막대 몇 줄, 오늘 칸 */
export const MonthCard = styled.div`
    ${card}
    left: 0;
    top: 1.5em;
    width: 30em;
    padding: 2em 2em 2.2em;
    rotate: -5deg;

    .head {
        display: flex;
        align-items: center;
        margin-bottom: 1.6em;
    }
    .head b {
        width: 9em;
        height: 1.2em;
        border-radius: 0.6em;
        background-color: ${(p) => withAlpha(p.theme.colors.text, 0.72)};
    }
    .head i {
        margin-left: auto;
        width: 4.4em;
        height: 1em;
        border-radius: 0.5em;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.12)};
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5em;
    }
    .grid span {
        position: relative;
        aspect-ratio: 1 / 0.86;
        border-radius: 0.6em;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.06 : 0.045)};
    }
    .grid span.today {
        background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.2 : 0.12)};
        box-shadow: inset 0 0 0 0.15em ${(p) => p.theme.colors.primary};
    }

    /* 일정 막대 — 칸 사이 틈(0.5em)을 건너 이어진다 */
    .grid em {
        position: absolute;
        left: 0;
        right: -0.5em;
        bottom: 0.6em;
        height: 0.6em;
    }
    .grid em.start { left: 0.4em; border-top-left-radius: 0.3em; border-bottom-left-radius: 0.3em; }
    .grid em.end { right: 0.4em; border-top-right-radius: 0.3em; border-bottom-right-radius: 0.3em; }
    .grid em.primary { background-color: ${(p) => p.theme.colors.primary}; }
    .grid em.accent { background-color: ${(p) => p.theme.colors.accent}; }
    .grid em.sage { background-color: ${(p) => p.theme.colors.success}; }
`;

/** 앞의 오늘 카드 — 머리글, 할 일 세 줄(하나는 끝냄), 진행 막대 */
export const TodayCard = styled.div`
    ${card}
    right: 0;
    bottom: 1em;
    width: 24em;
    padding: 2em 2.2em 2.2em;
    rotate: 3.5deg;
    animation-delay: 0.12s;

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5em;
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 1.9em;
        font-weight: 700;
        line-height: 1.3;
        color: ${(p) => p.theme.colors.text};
    }
    .title small {
        padding: 0.1em 0.7em;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.09 : 0.06)};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.5em;
        font-weight: 600;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .row {
        display: flex;
        align-items: center;
        gap: 1em;
        padding: 0.85em 0;
    }
    .row i {
        position: relative;
        flex: none;
        box-sizing: border-box;
        width: 1.7em;
        height: 1.7em;
        border-radius: 0.45em;
        border: 0.15em solid ${(p) => hair(p.theme, 0.3)};
    }
    .row span {
        height: 0.9em;
        border-radius: 0.45em;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.2 : 0.14)};
    }
    .row .w62 { width: 62%; }
    .row .w78 { width: 78%; }
    .row .w48 { width: 48%; }

    .row.done i {
        border-color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => p.theme.colors.primary};
    }
    .row.done i::after {
        content: "";
        position: absolute;
        inset: 0.12em;
        ${checkStamp("auto")}
        color: ${(p) => (dark(p) ? "#1A1512" : "#FFFFFF")};
    }
    .row.done span { background-color: ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.07)}; }

    .progress {
        margin-top: 1.1em;
        height: 0.6em;
        border-radius: 0.3em;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.08)};
    }
    .progress b {
        display: block;
        width: 36%;
        height: 100%;
        border-radius: inherit;
        background-color: ${(p) => p.theme.colors.primary};
    }
`;

/** 단풍잎 — 오늘 카드 귀퉁이에 놓인 한 장(.rest)과 앞으로 지는 작은 잎(.fall) */
export const Leaf = styled.i`
    position: absolute;
    ${crest("1.6em")}
    color: ${(p) => p.theme.colors.primary};

    /* 카드 오른쪽 위 귀퉁이 바깥에 걸친다 — 머리글의 개수 알약을 덮지 않게 */
    &.rest {
        right: -2.8em;
        bottom: 17.2em;
        ${watercolorLeaf("orange", "6em")}
        mask: none;
        -webkit-mask: none;
        rotate: 22deg;
        filter: drop-shadow(0 0.5em 0.6em ${(p) => withAlpha(dark(p) ? "#000000" : "#7A2E1A", dark(p) ? 0.5 : 0.28)});
        :where(html:not([data-theme-motion="off"])) & { animation: ${rise} 0.9s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
    }

    &.fall {
        top: -3em;
        opacity: 0;
        animation: ${fall} 12s linear infinite;
    }
    &.fall-0 { left: 8%; --dx: 4em; animation-delay: -2s; }
    &.fall-1 { left: 38%; --dx: -3em; width: 1.2em; height: 1.2em; color: ${(p) => p.theme.colors.accent}; animation-delay: -7s; animation-duration: 14s; }
    &.fall-2 { left: 64%; --dx: 5em; animation-delay: -10s; animation-duration: 11s; }
    &.fall-3 { left: 88%; --dx: -4em; width: 1.3em; height: 1.3em; color: ${(p) => p.theme.colors.accent}; animation-delay: -4s; animation-duration: 15s; }

    /* 기다리는 동안(로그인 중)에는 잎이 빨리 진다 */
    [data-busy] > &.fall { animation-duration: 3.2s; }

    html[data-theme-motion="off"] &.fall,
    html[data-theme-motion="gentle"] &.fall { display: none; }
`;
