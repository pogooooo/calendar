import { EASE_IN, EASE_OUT, NEUTRAL_MOTION, type MotionLevel, type MotionSet } from "@/styles/motion";

let gsap: typeof import("gsap").default | undefined;
let loading: Promise<void> | undefined;

/** Load the effect engine only when the Gem theme has motion enabled. */
export function prepareGemMotion() {
    return loading ??= import("gsap").then(module => { gsap = module.default; }).catch(() => {
        // Shared Web Animations still work when the optional chunk cannot be fetched.
    });
}

type CancelMotion = () => void;
const active = new WeakMap<Element, CancelMotion>();

function play(
    el: Element,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    duration: number,
    onSettled?: () => void,
): CancelMotion | null {
    if (!gsap) return null;
    const engine = gsap;
    let settled = false;
    const settle = () => {
        if (settled) return;
        settled = true;
        context.revert();
        active.delete(el);
        onSettled?.();
    };
    const context = engine.context(() => {
        engine.fromTo(el, from, {
            ...to,
            duration: duration / 1000,
            ease: "power3.out",
            force3D: false,
            onComplete: settle,
        });
    });
    active.set(el, settle);
    return settle;
}

export function playGemPress(el: HTMLElement, level: MotionLevel, onSettled: () => void): CancelMotion | null {
    if (!gsap) return null;
    const gentle = level === "gentle";
    active.get(el)?.();
    const boxShadow = getComputedStyle(el).boxShadow;
    return play(el, gemPress.frames[0], { boxShadow }, gentle ? 115 : 175, onSettled);
}

export const gemMotion: MotionSet = {
    ...NEUTRAL_MOTION,
    itemIn: level => ({ pose: { opacity: 0 }, duration: level === "gentle" ? 130 : 220, ease: EASE_OUT }),
    itemOut: () => ({ pose: { opacity: 0 }, duration: 140, ease: EASE_IN }),
    done: () => ({ mark: [{ opacity: .35 }, { opacity: 1 }], duration: 220, ease: EASE_OUT }),
    swapIn: ({ widget, level, size }) => {
        if (size === "line") return null;
        return {
            pose: { opacity: 0 },
            duration: widget ? 150 : level === "gentle" ? 150 : 260,
            ease: EASE_OUT,
        };
    },
    swapOut: ({ level, widget }) => ({
        pose: { opacity: 0 }, duration: level === "gentle" || widget ? 95 : 140, ease: EASE_IN,
    }),
};

export const gemPress = {
    frames: [
        { boxShadow: "inset 0 1px 5px #25142970" },
        { boxShadow: "none" },
    ],
    duration: 185,
    easing: "cubic-bezier(.22, 1, .36, 1)",
};
