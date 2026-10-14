/**
 * MapleWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤).
 * 카드 테는 먹 선화(card-frame.webp)를 테두리 그림(border-image)으로 늘려 쓴다 — 밤 종이에서는 뒤집어 옅은 선으로.
 * 가지는 수채 그림 그대로, 옅게. 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce).
 */
import styled, { keyframes } from "styled-components";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

const swayOnce = keyframes`
    0%   { transform: rotate(-16deg); }
    30%  { transform: rotate(-11deg); }
    58%  { transform: rotate(-18.5deg); }
    80%  { transform: rotate(-15deg); }
    100% { transform: rotate(-16deg); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    /* 먹으로 그린 카드 테 — 네 귀퉁이에 잎 */
    .frame {
        position: absolute;
        inset: 4px;
        border: 20px solid transparent;
        border-image: url("/themes/maple/card-frame.webp") 60 stretch;
        opacity: ${(p) => (dark(p) ? 0.3 : 0.5)};
        ${(p) => dark(p) && "filter: invert(1) sepia(0.4);"}
    }
    /* 오른쪽 아래 구석에서 들어오는 단풍 가지 */
    .branch {
        position: absolute;
        right: -6%;
        bottom: -12%;
        height: 82%;
        width: auto;
        transform: rotate(-16deg);
        transform-origin: 85% 100%;
        opacity: ${(p) => (dark(p) ? 0.3 : 0.34)};
        user-select: none;
        -webkit-mask-image: linear-gradient(205deg, transparent 8%, #000 42%);
        mask-image: linear-gradient(205deg, transparent 8%, #000 42%);
    }

    /* 칸이 판을 채우는 위젯 — 구석에 작게, 더 옅게 */
    &[data-busy] .branch { height: min(46%, 190px); right: -3%; bottom: -6%; opacity: ${(p) => (dark(p) ? 0.2 : 0.22)}; }

    /* 커서가 들어오면 한 번 — 가지가 바람에 흔들렸다 제자리로 */
    &[data-glint] .branch { animation: ${swayOnce} 2s ease-in-out both; }

    @media (max-height: 170px) { .branch { height: 120%; bottom: -40%; } }
`;
