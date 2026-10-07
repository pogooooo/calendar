/**
 * MapleSpecimen 의 모양 — 자리를 꽉 채우는 투명 캔버스. 준비되면(data-on) 서서히 드러난다.
 * 내려받기의 큰 그림(plate)은 상자 가장자리에서 잎이 뚝 잘리지 않게 네 가장자리를 옅게 지운다.
 */
import styled from "styled-components";

const EDGE_FADE = "linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent), linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)";

export const Canvas = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.9s ease;

    &[data-on] { opacity: 1; }

    &[data-variant="plate"] {
        -webkit-mask-image: ${EDGE_FADE};
        -webkit-mask-composite: source-in;
        mask-image: ${EDGE_FADE};
        mask-composite: intersect;
    }
`;
