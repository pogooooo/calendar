/**
 * MaplePageTransition 의 모양 — 다이어리 한 장을 넘긴다.
 *
 * 새 화면 위에 줄 쳐진 종이 한 장(Sheet)이 덮여 있다가, 오는 쪽의 반대편으로 살짝 기울며 걷혀 나간다 —
 * 다음 화면이면 왼쪽으로(새 쪽이 오른쪽부터 드러난다), 앞 화면이면 오른쪽으로. 종이 가장자리에는 두께만큼의 그늘.
 * 잎이 흩날리는 것은 효과 무대(FxStage 의 page)가 그린다. 0.5초 (폰 0.4초) — 예전의 0.9초 막보다 짧다.
 *
 * 움직이는 것은 종이의 transform 뿐 — 합성(compositor)에서 돌아서, 새 화면을 세우느라 본 스레드가 바쁜 동안에도 끊기지 않는다.
 * 본문에는 transform 을 걸지 않는다: 남은 transform 이 고정 단추(폰의 +)의 기준 상자를 바꿨다(BUGS.md).
 * 종이는 누르는 것을 받지 않는다. 평소 모습은 보이지 않게(투명) 두고 몸짓 안에서만 보인다 —
 * 움직임을 꺼 몸짓이 지워져도 화면을 덮지 않는다.
 */
import styled, { css, keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";

/** 손으로 넘기는 결 — 살짝 들렸다가 넘어간다 */
const HAND = "cubic-bezier(0.45, 0.05, 0.25, 1)";

const turn = keyframes`
    0%   { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
    100% { opacity: 1; transform: translate3d(calc(var(--turn-dir) * -112%), 0, 0) rotate(calc(var(--turn-dir) * -2.6deg)); }
`;

/** '잔잔하게' — 종이 없이 새 화면이 옅게 나타나기만 */
const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

export const Stage = styled.div`
    position: relative;
    height: 100%;
`;

export const Body = styled.div<{ $gentle: boolean }>`
    position: relative;
    height: 100%;

    ${(p) => p.$gentle && css`
        @media (prefers-reduced-motion: no-preference) {
            animation: ${fadeIn} 0.22s ease-out backwards;
        }
    `}
`;

/** 줄 쳐진 종이 — 바탕색 위에 옅은 가로줄과 왼쪽 여백 선, 걷혀 나가는 쪽의 반대편 가장자리에 두께 그늘 */
export const Sheet = styled.span<{ $dir: 1 | -1 }>`
    --turn-dir: ${(p) => p.$dir};
    position: absolute;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    opacity: 0;
    border-radius: 2px;
    transform-origin: ${(p) => (p.$dir > 0 ? "100% 100%" : "0% 100%")};
    background-color: ${(p) => p.theme.colors.background};
    background-image:
        linear-gradient(to right, transparent 46px, ${(p) => withAlpha(p.theme.colors.primary, 0.22)} 46px, ${(p) => withAlpha(p.theme.colors.primary, 0.22)} 47px, transparent 47px),
        repeating-linear-gradient(to bottom, transparent 0 31px, ${(p) => withAlpha(p.theme.colors.text, p.theme.mode === "dark" ? 0.07 : 0.06)} 31px 32px);
    box-shadow:
        ${(p) => (p.$dir > 0 ? "16px" : "-16px")} 0 30px -14px ${(p) => withAlpha(p.theme.mode === "dark" ? "#000000" : "#3B2A20", p.theme.mode === "dark" ? 0.6 : 0.34)},
        0 0 0 1px ${(p) => withAlpha(p.theme.colors.text, 0.08)};

    @media (prefers-reduced-motion: no-preference) {
        animation: ${turn} 0.5s ${HAND} both;
        ${MOBILE} { animation-duration: 0.4s; }
    }
    @media (prefers-reduced-motion: reduce) {
        display: none;
    }
`;
