import { createGlobalStyle } from "styled-components";

/** Static washes inspired by engraved celestial globes. No moving layer over the text. */
const CelestialGround = createGlobalStyle`
    [data-app-shell] {
        background-image:
            radial-gradient(ellipse at 95% 0%, ${(p) => p.theme.colors.primary}12, transparent 48%),
            radial-gradient(ellipse at 0% 100%, ${(p) => p.theme.mode === "dark" ? "#6878AB16" : "#B7C4D51A"}, transparent 50%);
    }
`;

export default CelestialGround;
