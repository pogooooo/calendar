/**
 * MapleWidgetDecor 의 모양 — 위젯 판 전체에 깔리는 한 겹(z-index 0, 내용 뒤).
 * 단풍 그늘은 캔버스 한 장(paintDapple)에 그린다. 커서가 들어올 때의 일렁임도 그 캔버스가 다시 그린다(MapleWidgetDecor).
 */
import styled from "styled-components";
import { withAlpha } from "@/styles/color";

const dark = (p: { theme: { mode?: string } }) => p.theme.mode === "dark";

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
        transition: opacity 0.6s ease;
    }
    .twig[data-ready] { opacity: 1; }
`;
