/**
 * Maple 의 몸짓 (src/styles/motion.ts 의 MotionSet) — 노트의 종이.
 *   화면 한 판(월간)을 넘김: 다이어리 한 장 — 새 쪽이 넘어오는 반대편 가장자리(책등)를 축으로 들렸다가 내려앉는다.
 *   판 안의 내용이 바뀜: 종이 한 장을 밀어 넣듯 오는 쪽으로 살짝 기울었다가 바로 선다.
 *   목록에 든 줄: 쪽지를 끼워 넣듯 왼쪽에서 비스듬히 · 빠지는 줄: 오른쪽으로 빼낸다.
 *   끝냄: 둥근 체크 칸이 톡 — 작게 오므렸다 한 번 부풀고, 줄이 한 번 눌린다.
 *   (2026-10-15 다시 그리며 도장이 크게 기울어 찍히던 몸짓과 대화상자가 기울며 치워지던 몸짓을 걷었다 — 둥근 칸·카드와 따로 놀았다)
 * 바다(흐림·물결)·Celestial(옅게 미끄러짐)과 재료부터 다르게.
 */
import { EASE_IN, gentleSwap, widgetSwap, type Ease, type MotionSet } from "@/styles/motion";

/** 손으로 넘기는 결 — 처음엔 빠르고 끝이 부드럽다 */
const HAND: Ease = [0.25, 0.8, 0.3, 1];
/** 톡 — 오므렸다 부풀어 선다 */
const PRESS: Ease = [0.3, 0.7, 0.4, 1];

export const paperMotion: MotionSet = {
    swapIn: (a) => {
        if (a.widget) return widgetSwap(a);
        if (a.level === "gentle") return gentleSwap(a);
        if (a.size === "page") {
            return a.axis === "x"
                ? { pose: { opacity: 0, x: a.dir * 26, rotateY: -a.dir * 20, perspective: 1600, ox: a.dir > 0 ? 0 : 1, oy: 0.5 }, duration: 560, ease: HAND }
                : { pose: { opacity: 0, y: a.dir * 18, rotateX: a.dir * 16, perspective: 1600, ox: 0.5, oy: a.dir > 0 ? 0 : 1 }, duration: 520, ease: HAND };
        }
        if (a.size === "line") return { pose: { opacity: 0, [a.axis]: a.dir * 10, rotate: a.dir * 2, ox: 0, oy: 1 }, duration: 300, ease: HAND };
        return { pose: { opacity: 0, [a.axis]: a.dir * 26, rotate: a.axis === "x" ? a.dir * 1.2 : 0, ox: 0.5, oy: 1 }, duration: 440, ease: HAND };
    },
    swapOut: (a) => {
        if (a.widget || a.level === "gentle") return { pose: { opacity: 0 }, duration: 140, ease: EASE_IN };
        if (a.size === "page") {
            return a.axis === "x"
                ? { pose: { opacity: 0, x: -a.dir * 22, rotateY: a.dir * 14, perspective: 1600, ox: a.dir > 0 ? 1 : 0, oy: 0.5 }, duration: 300, ease: EASE_IN }
                : { pose: { opacity: 0, y: -a.dir * 14, rotateX: -a.dir * 12, perspective: 1600, ox: 0.5, oy: a.dir > 0 ? 1 : 0 }, duration: 280, ease: EASE_IN };
        }
        return { pose: { opacity: 0, [a.axis]: -a.dir * 16, rotate: a.axis === "x" ? -a.dir * 1 : 0 }, duration: 220, ease: EASE_IN };
    },
    itemIn: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 200, ease: HAND }
        : { pose: { opacity: 0, x: -14, rotate: -1.6, ox: 0, oy: 0.5 }, duration: 400, ease: HAND },
    itemOut: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 160, ease: EASE_IN }
        : { pose: { opacity: 0, x: 18, rotate: 1.4, ox: 1, oy: 0.5 }, duration: 240, ease: EASE_IN },
    done: (level) => level === "gentle" ? null : {
        mark: [
            { transform: "scale(0.6)", opacity: 0.4 },
            { transform: "scale(1.14)", opacity: 1, offset: 0.55 },
            { transform: "none", opacity: 1 },
        ],
        row: [
            { transform: "none" },
            { transform: "translateY(1px) scale(0.99)", offset: 0.5 },
            { transform: "none" },
        ],
        duration: 440,
        ease: PRESS,
    },
    // 확인 카드는 살짝 들리며 옅어진다
    dialogOut: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 140, ease: EASE_IN }
        : { pose: { opacity: 0, y: -8, scale: 0.98, ox: 0.5, oy: 0 }, duration: 200, ease: EASE_IN },
};
