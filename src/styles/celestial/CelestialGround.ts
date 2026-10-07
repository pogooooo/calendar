import { createGlobalStyle } from "styled-components";

/**
 * Celestial 의 바닥 — 종이(밝은 벌)·밤(어두운 벌) 색과 천구의를 본뜬 옅은 물듦.
 *
 * 그 위를 하늘(CelestialAtmosphere 의 three.js, z-index -1)이 덮으므로 바닥은 html 에만 칠하고
 * 앱 껍데기는 비운다 — 껍데기나 body 에 칠하면 그 면이 하늘을 가린다(바다의 물빛이 그랬다).
 * 위젯 창은 globals.css 가 html·body 를 !important 로 투명하게 두므로 여기서 덮지 않는다(이 규칙은 !important 가 아니다).
 */
const CelestialGround = createGlobalStyle`
    html {
        background-color: ${(p) => p.theme.colors.background};
        /* 밤: 천구 북극(오른쪽 위) 둘레가 조금 밝고 아래로 깊어지는 남색 */
        background-image: ${(p) => p.theme.mode === "dark" ? `
            radial-gradient(ellipse at 90% 4%, #1B2338, transparent 58%),
            linear-gradient(180deg, transparent 40%, #0D111C)` : `
            radial-gradient(ellipse at 95% 0%, ${p.theme.colors.primary}12, transparent 48%),
            radial-gradient(ellipse at 0% 100%, #B7C4D51A, transparent 50%)`};
        background-attachment: fixed;
    }
    [data-app-shell] { background-color: transparent !important; }
`;

export default CelestialGround;
