/**
 * OceanWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤). 바탕은 그라데이션으로 칠한다(바탕색은 위젯 쪽에서 지워질 수 있다).
 * 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce) — 끝없이 흐르는 것은 없다.
 */
import styled, { keyframes } from "styled-components";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

/* 빛 그물이 물살에 조금 밀렸다 돌아온다 — 겹 하나를 옮길 뿐이라 그물을 다시 그리지 않는다 */
const driftOnce = keyframes`
    0%   { transform: translate(0, 0); }
    50%  { transform: translate(-9px, 6px); }
    100% { transform: translate(0, 0); }
`;
const riseOnce = keyframes`
    0%   { transform: translateY(0); opacity: var(--bo); }
    62%  { transform: translateY(-22px); opacity: 0; }
    63%  { transform: translateY(8px); opacity: 0; }
    100% { transform: translateY(0); opacity: var(--bo); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    span { position: absolute; inset: 0; }

    /* 물빛 — 위는 청록, 아래로 갈수록 얕아져 모래빛(밝은 벌). 어두운 벌은 위에 청록이 옅게 고일 뿐 */
    .tint {
        background: ${(p) => (dark(p)
            ? "linear-gradient(180deg, rgba(40, 150, 150, 0.16), rgba(40, 150, 150, 0.04) 55%, rgba(160, 240, 230, 0.05))"
            : "linear-gradient(180deg, rgba(59, 166, 168, 0.3), rgba(122, 207, 201, 0.16) 55%, rgba(239, 232, 214, 0.42))")};
    }
    /* 빛 그물 — 물바닥에 어른거리는 햇빛. 흐를 자리를 두려고 판보다 조금 크게 깐다 */
    .caustics {
        inset: -14px;
        opacity: ${(p) => (dark(p) ? 0.22 : 0.62)};
        -webkit-mask-image: linear-gradient(180deg, #000 30%, rgba(0, 0, 0, 0.55));
        mask-image: linear-gradient(180deg, #000 30%, rgba(0, 0, 0, 0.55));
        svg { display: block; }
    }
    /* 햇살 — 위에서 비스듬히 내려와 아래로 옅어진다 */
    .rays {
        background: repeating-linear-gradient(104deg,
            transparent 0 34px, rgba(255, 255, 255, ${(p) => (dark(p) ? 0.05 : 0.16)}) 40px, transparent 52px 90px);
        -webkit-mask-image: linear-gradient(180deg, #000, transparent 72%);
        mask-image: linear-gradient(180deg, #000, transparent 72%);
    }
    /* 유리 방울 — 위 왼쪽에 빛이 맺히고 테가 옅게 빛난다 */
    .bubble {
        position: absolute;
        border-radius: 50%;
        background:
            radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.95) 0 14%, rgba(255, 255, 255, 0.22) 26%, transparent 46%),
            radial-gradient(circle at 50% 50%, transparent 58%, rgba(255, 255, 255, ${(p) => (dark(p) ? 0.32 : 0.7)}) 68%, transparent 72%);
        box-shadow: inset 0 0 0 1px rgba(${(p) => (dark(p) ? "255, 255, 255, 0.18" : "31, 138, 143, 0.32")});
        --bo: ${(p) => (dark(p) ? 0.55 : 0.85)};
        opacity: var(--bo);
    }

    /* 커서가 들어오면 한 번 — 방울이 떠올랐다 다시 맺히고, 빛 그물이 조금 흘렀다 돌아온다 */
    &[data-glint] .bubble { animation: ${riseOnce} 1.9s ease-in-out both; }
    &[data-glint] .caustics { animation: ${driftOnce} 2.1s ease-in-out both; }

    @media (max-height: 160px) { .bubble { display: none; } }
`;
