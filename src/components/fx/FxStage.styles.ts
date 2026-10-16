import styled from "styled-components";
import { agedArt } from "@/styles/vintage";

/**
 * 맨 위(창·대화상자보다 위)에 깔리되 누르는 것은 아래로 그대로 지나간다.
 * 효과가 도는 동안(data-on)만 보인다 — 쉬는 동안 숨겨 두면 폰에서 화면을 굴릴 때 합성할 겹이 하나 준다.
 */
export const Canvas = styled.canvas`
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 5000;
    pointer-events: none;
    visibility: hidden;

    &[data-on] {
        visibility: visible;
    }

    /* 빈티지 벌(theme.variant)은 효과도 빛바랜 사진처럼 */
    ${agedArt}
`;
