/**
 * 바다의 바닥 — 화면 전체가 맑은 물이다. 위(먼 물)는 옅은 물빛, 아래로 갈수록 깊은 청록.
 * 앱 껍데기는 비워서(투명) 물과 물빛 그물(OceanAtmosphere)이 판 사이로 비치게 한다.
 * 위젯 창은 html·body 에 인라인 !important 로 투명을 걸어 두므로 여기 물이 덮지 않는다.
 */
import { createGlobalStyle } from "styled-components";

const OceanGround = createGlobalStyle`
    html, body {
        background-color: ${(p) => (p.theme.mode === "dark" ? "#05202B" : "#58D3D4")} !important;
        background-image: ${(p) => (p.theme.mode === "dark"
            ? "linear-gradient(180deg, #0B3D4C 0%, #07303D 45%, #04202B 100%)"
            : "linear-gradient(180deg, #A6ECE7 0%, #6CDAD8 30%, #3FC8D0 62%, #25B1C3 100%)")} !important;
        background-attachment: fixed !important;
    }
    [data-app-shell] { background: transparent !important; }
    ::selection { background: ${(p) => (p.theme.mode === "dark" ? "rgba(111, 227, 218, 0.35)" : "rgba(255, 214, 165, 0.75)")}; }
`;

export default OceanGround;
