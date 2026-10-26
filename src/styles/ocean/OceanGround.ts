/**
 * 바다의 바닥 — 위는 깊은 청록, 아래로 갈수록 맑은 물빛을 지나 모래빛. 그 위를 물(OceanAtmosphere 의 three.js)이 통째로 덮는다.
 * 이 그라데이션은 물이 그려지기 전 한순간과 WebGL 이 없는 곳에서만 보인다 — 물과 같은 빛깔로 맞춰 둔다.
 *
 * 바닥색은 html 에만 칠하고 body 는 비운다 — body 에도 칠하면 그 면이 z-index:-1 로 깔린 물 캔버스를 덮어
 * 물이 아예 안 보인다(한동안 그랬다). 앱 껍데기도 비워서(투명) 물이 판 사이로 비치게 한다.
 * 위젯 창은 html·body 에 인라인 !important 로 투명을 걸어 두므로 덮지 않는다.
 *
 * --ocean-glass 는 "여기가 유리 판"이라는 표시(water.ts 의 surface·sand 가 단다). 물려받지 않게 등록해 두어야
 * 판 안의 글자에까지 번지지 않는다 — 커서 빛(OceanAtmosphere)이 이것으로 판을 찾는다.
 */
import { createGlobalStyle } from "styled-components";

const OceanGround = createGlobalStyle`
    @property --ocean-glass {
        syntax: "<number>";
        inherits: false;
        initial-value: 0;
    }
    html {
        background-color: ${(p) => (p.theme.mode === "dark" ? "#0A2226" : "#8DBCB0")} !important;
        background-image: ${(p) => (p.theme.mode === "dark"
            ? "linear-gradient(180deg, #072024 0%, #0A2A2F 45%, #0E1F21 100%)"
            : "linear-gradient(180deg, #3B8589 0%, #6BAFA8 38%, #BDD6C7 76%, #DBD9C4 100%)")} !important;
        background-attachment: fixed !important;
    }
    body { background: transparent !important; }
    [data-app-shell] { background: transparent !important; }
    ::selection { background: ${(p) => (p.theme.mode === "dark" ? "rgba(108, 205, 194, 0.3)" : "rgba(15, 107, 107, 0.18)")}; }
`;

export default OceanGround;
