/**
 * MapleWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤).
 * 잎은 벡터 마스크(crest·선 잎)에 inkFill 로 색을 입힌다 — 위젯 화면이 속의 background-color 를 통째로 지우는 자리에서도 살아남게.
 * 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce).
 */
import styled, { keyframes } from "styled-components";
import { LEAF_PATH, crest, inkFill } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

/**
 * 구석의 큰 잎 — 채운 잎은 크게 그리면 톱니가 뭉친 덩어리처럼 보여서, 가는 선의 잎과 잎맥으로 그린다.
 * 선 굵기는 그림 단위(24)에 묶여 있어 크기를 따라 굵어진다 — 판 크기의 잎에서 2~3px.
 */
const LEAF_LINE = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g fill='none' stroke='black' stroke-width='0.28' stroke-linejoin='round' stroke-linecap='round'>" +
    `<path d='${LEAF_PATH}'/>` +
    "<path d='M12 15V3.2M12 15L20.4 10.7M12 15L3.6 10.7M12 15L18.6 13.9M12 15L5.4 13.9M12 9.6L14.6 7.4M12 9.6L9.4 7.4'/>" +
    "</g></svg>",
)}")`;

/* 진 잎이 바람에 살짝 들썩였다 내려앉는다 */
const liftOnce = keyframes`
    0%   { transform: rotate(var(--turn)) translateY(0); }
    40%  { transform: rotate(calc(var(--turn) + 16deg)) translateY(-3px); }
    100% { transform: rotate(var(--turn)) translateY(0); }
`;
const cornerOnce = keyframes`
    0%, 100% { transform: rotate(-24deg); }
    45%      { transform: rotate(-19deg); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    /* 위에서 비치는 따뜻한 빛 — 오른쪽 위는 호박빛, 왼쪽 아래는 단풍빛을 아주 옅게 */
    .light {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(ellipse at 100% 0%, ${(p) => withAlpha(p.theme.colors.accent, dark(p) ? 0.1 : 0.2)}, transparent 55%),
            radial-gradient(ellipse at 0% 100%, ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.08 : 0.07)}, transparent 50%);
    }

    /* 진 잎 — 크기는 짧은 변에 맞춰(--s 배) */
    .leaf {
        position: absolute;
        ${crest("calc(clamp(13px, 6.5vmin, 26px) * var(--s, 1))")}
        transform: rotate(var(--turn, 0deg));
        transform-origin: 50% 50%;
    }
    .leaf.red { ${(p) => inkFill(withAlpha(p.theme.colors.primary, dark(p) ? 0.34 : 0.26))} }
    .leaf.amber { ${(p) => inkFill(withAlpha(p.theme.colors.accent, dark(p) ? 0.32 : 0.36))} }
    .leaf.brown { ${(p) => inkFill(withAlpha(p.theme.colors.text, dark(p) ? 0.16 : 0.13))} }

    /* 오른쪽 아래 구석에 크게 걸친 선 잎 한 장 — 판의 반쯤만 보인다 */
    .corner {
        position: absolute;
        right: -12vmin;
        bottom: -14vmin;
        width: 64vmin;
        height: 64vmin;
        mask: ${LEAF_LINE} center / contain no-repeat;
        -webkit-mask: ${LEAF_LINE} center / contain no-repeat;
        ${(p) => inkFill(withAlpha(p.theme.colors.primary, dark(p) ? 0.3 : 0.22))}
        transform: rotate(-24deg);
        transform-origin: 70% 80%;
    }

    /* 칸이 판을 채우는 위젯 — 잎은 더 옅게, 구석 잎은 작게 */
    &[data-busy] .leaf { opacity: 0.55; }
    &[data-busy] .corner { width: 36vmin; height: 36vmin; right: -8vmin; bottom: -9vmin; opacity: 0.7; }

    /* 커서가 들어오면 한 번 — 잎이 살짝 들썩, 구석 잎은 바람에 한 번 흔들린다 */
    &[data-glint] .leaf { animation: ${liftOnce} 1.4s ease-in-out both; }
    &[data-glint] .corner { animation: ${cornerOnce} 1.8s ease-in-out both; }
`;
