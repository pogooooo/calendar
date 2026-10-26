/**
 * Celestial 의 몸짓 (src/styles/motion.ts 의 MotionSet) — 별빛과 곧은 금선.
 *   화면 한 판(월간)을 넘김: 자오선(세로 금선 한 줄)이 오는 쪽에서 판을 가로질러 가고, 금선이 지난 자리부터 새 달로 갈린다
 *     (옛 달은 금선 앞에서 잘려 나간다 — clip-path). 판은 기울거나 돌지 않는다. 금선은 CelestialMonthDecor 의 Stage,
 *     괘선의 별은 금선이 지나는 차례로 반짝인다(2026-10-16 — 사용자: "테마마다 캘린더 부분이 역동적으로").
 *   판 안의 내용·날짜 머리가 바뀜: 짧게 곧게 미끄러지며 옅은 흐림이 걷힌다 — 별빛이 맑아지듯.
 *   목록에 든 줄: 별이 뜨듯 아래에서 살짝 떠오르며 맑아진다 · 빠지는 줄: 옅어지며 위로 사라진다.
 *   끝냄: 표식이 별처럼 한 번 반짝 — 작게 시작해 부풀었다 서며 빛이 번졌다 걷힌다.
 *   창이 닫힘: 기울지 않고 제자리에서 조금 작아지며 옅어진다.
 * Maple(종이·도장)·바다(물결·흐림)와 재료부터 다르게 — Celestial 은 직선·달·별·혼천의의 결이라 비스듬히 기울지 않는다.
 * 흐림은 작은 것(줄·판 안)에만 — 월간 격자처럼 큰 판에 걸면 폰에서 버벅인다.
 */
import { EASE_IN, gentleSwap, widgetSwap, type Ease, type MotionSet } from "@/styles/motion";

/** 별빛의 결 — 빨리 와서 오래 가라앉는다 */
const GLIDE: Ease = [0.16, 1, 0.3, 1];
/** 천문기구의 움직임처럼 일정한 속도로 달력 장면을 전환한다. */
export const SWEEP: Ease = [0.45, 0.05, 0.35, 1];
export const SWEEP_MS = 720;
/** 금선이 판의 k/7 자리(왼쪽에서)를 지나는 때(ms) — SWEEP 결을 풀어 셈한 값. 괘선의 별이 이 차례로 반짝인다 */
export const SWEEP_PASS = [0, 166, 228, 277, 324, 380, 460, 720] as const;
/** 금선이 지난 자리 — 다음 달이면 오른쪽에서 왼쪽으로 건넌다 */
const shown = (dir: number) => (dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)");
const gone = (dir: number) => (dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)");

export const starMotion: MotionSet = {
    swapIn: (a) => {
        if (a.widget) return widgetSwap(a);
        if (a.level === "gentle") return gentleSwap(a);
        // 월간 한 판: 자오선이 지난 자리부터 새 달 — 옛 달과 금선 하나를 사이에 두고 맞닿는다
        if (a.size === "page") return a.axis === "x"
            ? { pose: { clip: shown(a.dir) }, duration: SWEEP_MS, ease: SWEEP }
            : { pose: { opacity: 0, [a.axis]: a.dir * 72 }, duration: 460, ease: GLIDE };
        if (a.size === "line") return { pose: { opacity: 0, [a.axis]: a.dir * 10, blur: 1.5 }, duration: 280, ease: GLIDE };
        return { pose: { opacity: 0, [a.axis]: a.dir * 20, blur: 2 }, duration: 360, ease: GLIDE };
    },
    swapOut: (a) => {
        if (a.widget || a.level === "gentle") return { pose: { opacity: 0 }, duration: 120, ease: EASE_IN };
        if (a.size === "page") return a.axis === "x"
            ? { pose: { clip: gone(a.dir) }, duration: SWEEP_MS, ease: SWEEP }
            : { pose: { opacity: 0, [a.axis]: -a.dir * 56 }, duration: 240, ease: EASE_IN };
        return { pose: { opacity: 0, [a.axis]: -a.dir * 12 }, duration: 170, ease: EASE_IN };
    },
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
