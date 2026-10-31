/** Celestial: short reading entrances and engraved state feedback, without a page-covering veil. */
import { EASE_IN, type Ease, type MotionSet } from "@/styles/motion";

/** 별빛의 결 — 빨리 와서 오래 가라앉는다 */
const GLIDE: Ease = [0.16, 1, 0.3, 1];
export const starMotion: MotionSet = {
    swapIn: ({level, size}) => ({ pose: level === 'gentle' ? {opacity:.6} : {opacity:.3, y:size === 'line' ? 3 : 9}, duration:level === 'gentle' ? 130 : 280, ease:GLIDE }),
    swapOut: () => null,
    itemIn: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 180, ease: GLIDE }
        : { pose: { opacity: 0, y: 8, blur: 1.5 }, duration: 340, ease: GLIDE },
    itemOut: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 140, ease: EASE_IN }
        : { pose: { opacity: 0, y: -6 }, duration: 200, ease: EASE_IN },
    done: (level) => level === "gentle" ? null : {
        // 더해서 그린다(composite add) — 크기와 빛만 얹는다 (투명도는 더하면 1 을 넘어 먹지 않는다)
        mark: [
            { transform: "scale(0.45)", filter: "brightness(2.2)" },
            { transform: "scale(1.3)", filter: "brightness(1.7)", offset: 0.45 },
            { transform: "none", filter: "brightness(1)" },
        ],
        duration: 420,
        ease: GLIDE,
    },
    dialogOut: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 120, ease: EASE_IN }
        : { pose: { opacity: 0, scale: 0.97 }, duration: 180, ease: EASE_IN },
};
