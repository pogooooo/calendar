/**
 * MapleWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤).
 * 가지는 캔버스 한 장(paintTwig)에 그린다. 움직임은 커서가 들어올 때 한 번뿐([data-glint], useHoverOnce) —
 * 가지가 구석을 축으로 바람에 한 번 흔들렸다 제자리로.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

const swayOnce = keyframes`
    0%, 100% { transform: rotate(0deg); }
    30%      { transform: rotate(-2.4deg); }
    62%      { transform: rotate(1.2deg); }
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
            radial-gradient(ellipse at 100% 0%, ${(p) => withAlpha(p.theme.colors.accent, dark(p) ? 0.12 : 0.24)}, transparent 58%),
            radial-gradient(ellipse at 0% 100%, ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.08 : 0.07)}, transparent 50%);
    }

    .twig {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transform-origin: 100% 100%;
        transition: opacity 0.6s ease;
    }
    .twig[data-ready] { opacity: 1; }

    /* 커서가 들어오면 한 번 — 가지가 바람에 흔들렸다 제자리로 */
    &[data-glint] .twig { animation: ${swayOnce} 1.8s ease-in-out both; }
`;
