/**
 * OceanWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤). 바탕은 그라데이션으로 칠한다(바탕색은 위젯 쪽에서 지워질 수 있다).
 * 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce) — 끝없이 흐르는 것은 없다.
 */
import styled, { keyframes } from "styled-components";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

/* 빛 그물이 물살에 조금 밀렸다 돌아온다 — 그린 겹 하나를 옮길 뿐이라 다시 그리지 않는다 */
const driftOnce = keyframes`
    0%   { transform: translate(0, 0); }
    50%  { transform: translate(-9px, 6px); }
    100% { transform: translate(0, 0); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    span { position: absolute; inset: 0; }

    /* 물빛 — 위는 청록, 아래로 갈수록 얕아져 모래빛. 앱의 물(deep·mid·shallow·sand)을 유리 너머로 보듯 옅게 */
    .tint {
        background: ${(p) => (dark(p)
            ? "linear-gradient(180deg, rgba(10, 48, 54, 0.85), rgba(10, 48, 54, 0.55) 55%, rgba(15, 38, 40, 0.5))"
            : "linear-gradient(180deg, rgba(38, 153, 161, 0.42), rgba(117, 204, 199, 0.3) 55%, rgba(240, 232, 214, 0.55))")};
    }
    /* 빛 그물 — 흐를 자리를 두려고 판보다 14px 씩 크게 깐다(OceanWidgetDecor 의 BLEED). 모래 위(아래)는 옅게 */
    .caustics {
        position: absolute;
        left: -14px;
        top: -14px;
        width: calc(100% + 28px);
        height: calc(100% + 28px);
        opacity: ${(p) => (dark(p) ? 0.32 : 0.75)};
        -webkit-mask-image: linear-gradient(180deg, #000 35%, rgba(0, 0, 0, 0.5));
        mask-image: linear-gradient(180deg, #000 35%, rgba(0, 0, 0, 0.5));
    }
    /* 햇살 — 위에서 비스듬히 내려와 아래로 옅어진다 */
    .rays {
        background: repeating-linear-gradient(104deg,
            transparent 0 34px, rgba(255, 255, 255, ${(p) => (dark(p) ? 0.04 : 0.14)}) 40px, transparent 52px 90px);
        -webkit-mask-image: linear-gradient(180deg, #000, transparent 72%);
        mask-image: linear-gradient(180deg, #000, transparent 72%);
    }

    /* 커서가 들어오면 한 번 — 빛 그물이 조금 흘렀다 돌아온다 */
    &[data-glint] .caustics { animation: ${driftOnce} 2.1s ease-in-out both; }
`;
