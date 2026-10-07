/**
 * 바다의 바닥 — 맑은 물 아래 흰 모래. 위(먼 물)는 옅은 물빛, 아래로 갈수록 따뜻한 모래빛.
 * 그 위에 물빛(OceanAtmosphere 의 three.js)이 어른거린다.
 *
 * 바닥색은 html 에만 칠하고 body 는 비운다 — body 에도 칠하면 그 면이 z-index:-1 로 깔린 물빛 캔버스를 덮어
 * 물빛이 아예 안 보인다(한동안 그랬다). 앱 껍데기도 비워서(투명) 바닥이 판 사이로 비치게 한다.
 * 밤에는 먹빛 물 — 달빛 물결만 옅게. 위젯 창은 html·body 에 인라인 !important 로 투명을 걸어 두므로 덮지 않는다.
 */
import { createGlobalStyle } from "styled-components";

const OceanGround = createGlobalStyle`
    html {
        background-color: ${(p) => (p.theme.mode === "dark" ? "#0A1213" : "#D6E8E3")} !important;
        background-image: ${(p) => (p.theme.mode === "dark"
            ? "linear-gradient(180deg, #0E1F21 0%, #0B1617 55%, #091011 100%)"
            : "linear-gradient(180deg, #C6E2DD 0%, #D3E7E2 40%, #E2E7DF 75%, #E9E6DD 100%)")} !important;
        background-attachment: fixed !important;
    }
    body { background: transparent !important; }
    [data-app-shell] { background: transparent !important; }
    ::selection { background: ${(p) => (p.theme.mode === "dark" ? "rgba(108, 205, 194, 0.3)" : "rgba(15, 107, 107, 0.16)")}; }
`;

export default OceanGround;
