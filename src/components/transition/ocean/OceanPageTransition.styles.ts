/**
 * OceanPageTransition 의 모양 — 물속에서 떠오르듯: 새 화면 위를 덮은 물안개(흐린 유리 막)가 오는 쪽부터 걷히며
 * 또렷해지고, 막 위로 물빛 한 줄기가 오는 쪽에서 지나간다. 0.55초 (폰 0.45초). 누른 자리의 물결 고리는 FxStage 가 그린다.
 *
 * 움직이는 것은 막의 transform·opacity 뿐 — 둘은 합성(compositor)에서 돌아서, 새 화면을 세우느라 본 스레드가 바쁜 동안에도
 * 끊기지 않는다(left·흐림 반경을 움직이면 그동안 멈췄다가 끝에서 툭 사라졌다). 흐림 자체는 막에 고정해 둔다.
 * 본문에는 아무것도 걸지 않는다:
 *   - transform(·filter)이 걸린 동안에는 안의 고정 단추(폰의 +)가 화면이 아니라 본문을 기준으로 선다(Maple 에서 겪은 일, BUGS.md)
 *   - 투명도·흐림이 걸린 상자 안의 유리 판(backdrop-filter)은 뒤 물빛을 못 보고 맨 끝에서 툭 흐려진다
 * 판들이 떠오르는 몸짓은 각 화면의 판(surfaceIn)이 이미 갖고 있다.
 * 막은 누르는 것을 받지 않는다. 막의 평소 모습은 보이지 않게(투명) 두고 몸짓 안에서만 보인다 —
 * 움직임을 꺼 몸짓이 지워져도 화면을 덮지 않는다. 막 가장자리는 옅게 풀어(mask) 경계선이 보이지 않게.
 */
import styled, { css, keyframes } from "styled-components";
import { EASE, calm } from "@/styles/ocean/water";
import { MOBILE } from "@/styles/breakpoints";

/** 물안개가 잠깐 머물렀다가 걷힌다 — 처음부터 옅어지면 흐린 순간이 보이지 않는다 */
const clear = keyframes`
    0%   { opacity: 1; }
    30%  { opacity: 0.94; }
    100% { opacity: 0; }
`;

/** 오는 쪽부터 걷히게 — 막이 반대쪽으로 흘러간다 */
const drift = keyframes`
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(var(--drift, 0px), 0, 0); }
`;

/** 막 위를 지나가는 물빛 — 오는 쪽에서 반대쪽으로 */
const sweep = keyframes`
    from { transform: translate3d(var(--sweep-from, 0%), 0, 0); }
    to   { transform: translate3d(var(--sweep-to, 0%), 0, 0); }
`;

/** '잔잔하게' — 흐림 없이 막의 색만 옅게 걷힌다 */
const fade = keyframes`
    from { opacity: 1; }
    to   { opacity: 0; }
`;

export const Stage = styled.div`
    position: relative;
    height: 100%;
`;

export const Body = styled.div`
    position: relative;
    height: 100%;
`;

const feather = "linear-gradient(to right, transparent, #000 110px, #000 calc(100% - 110px), transparent), linear-gradient(to bottom, transparent, #000 40px, #000 calc(100% - 40px), transparent)";

export const Veil = styled.span<{ $dir: 1 | -1; $gentle: boolean }>`
    position: absolute;
    inset: 0;
    z-index: 60;
    overflow: hidden;
    pointer-events: none;
    opacity: 0;
    background-color: ${(p) => (p.theme.mode === "dark" ? "rgba(6, 26, 30, 0.42)" : "rgba(236, 247, 245, 0.42)")};
    -webkit-mask-image: ${feather};
    -webkit-mask-composite: source-in;
    mask-image: ${feather};
    mask-composite: intersect;

    ${(p) => (p.$gentle
        ? css`animation: ${fade} 0.24s ease-out both;`
        : css`
            --drift: ${p.$dir * -14}%;
            backdrop-filter: blur(16px) saturate(140%);
            -webkit-backdrop-filter: blur(16px) saturate(140%);
            animation: ${clear} 0.55s ease-in-out both, ${drift} 0.55s ${EASE} both;
            ${MOBILE} {
                backdrop-filter: blur(10px) saturate(130%);
                -webkit-backdrop-filter: blur(10px) saturate(130%);
                animation-duration: 0.45s, 0.45s;
            }

            /* 물빛 한 줄기 — 오는 쪽 바깥에서 들어와 반대쪽 바깥으로 */
            &::after {
                content: "";
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                width: 55%;
                --sweep-from: ${p.$dir > 0 ? "190%" : "-100%"};
                --sweep-to: ${p.$dir > 0 ? "-100%" : "190%"};
                background: linear-gradient(${p.$dir > 0 ? 100 : 80}deg, transparent 15%, ${p.theme.mode === "dark" ? "rgba(140, 240, 228, 0.18)" : "rgba(255, 255, 255, 0.6)"} 50%, transparent 85%);
                animation: ${sweep} 0.55s ${EASE} both;
                ${MOBILE} { animation-duration: 0.45s; }
            }
        `)}
    ${calm}
    &::after { ${calm} }
`;
