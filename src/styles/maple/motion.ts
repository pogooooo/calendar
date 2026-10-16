/**
 * Maple 의 몸짓 (src/styles/motion.ts 의 MotionSet) — 노트의 종이.
 *   화면 한 판(월간)을 넘김: 다이어리 한 장이 책등(왼쪽)을 축으로 넘어간다 — 다음 달이면 옛 장이 위에서 넘어가 걷히고(새 장은 밑에),
 *   이전 달이면 넘겼던 장이 되돌아와 덮인다(2026-10-16 — 사용자: "테마마다 캘린더가 역동적으로 변했으면").
 *   판 안의 내용이 바뀜: 종이 한 장을 밀어 넣듯 오는 쪽으로 살짝 기울었다가 바로 선다.
 *   목록에 든 줄: 쪽지를 끼워 넣듯 왼쪽에서 비스듬히 · 빠지는 줄: 오른쪽으로 빼낸다.
 *   끝냄: 둥근 체크 칸이 톡 — 작게 오므렸다 한 번 부풀고, 줄이 한 번 눌린다.
 *   (2026-10-15 다시 그리며 도장이 크게 기울어 찍히던 몸짓과 대화상자가 기울며 치워지던 몸짓을 걷었다 — 둥근 칸·카드와 따로 놀았다)
 * 바다(흐림·물결)·Celestial(옅게 미끄러짐)과 재료부터 다르게.
 */
import { EASE_IN, gentleSwap, widgetSwap, type Ease, type MotionSet } from "@/styles/motion";

/** 손으로 넘기는 결 — 처음엔 빠르고 끝이 부드럽다 */
const HAND: Ease = [0.25, 0.8, 0.3, 1];
/** 장을 넘기는 결 — 들릴 때 천천히, 넘어갈 때 빨리, 내려앉을 때 다시 천천히 */
const TURN: Ease = [0.55, 0.05, 0.35, 1];
/** 톡 — 오므렸다 부풀어 선다 */
const PRESS: Ease = [0.3, 0.7, 0.4, 1];

export const paperMotion: MotionSet = {
    swapIn: (a) => {
        if (a.widget) return widgetSwap(a);
        if (a.level === "gentle") return gentleSwap(a);
        if (a.size === "page") {
            if (a.axis === "x") {
                // 이전 달: 넘겼던 장이 책등을 축으로 되돌아와 덮인다 · 다음 달: 새 장은 이미 밑에 있다(옛 장이 걷히며 드러난다)
                // 넘기는 장은 옅어지지 않는다 — 종이로 칠해(MapleMonthCalendar.styles 의 CalendarWindow) 밑의 장을 가리고, 90° 를 넘으면 뒷면이라 안 보인다
                return a.dir < 0
                    ? { pose: { rotateY: -96, perspective: 2200, ox: 0, oy: 0.5 }, duration: 620, ease: HAND, above: true }
                    : { pose: { opacity: 0 }, duration: 200, ease: HAND };
            }
            return { pose: { opacity: 0, y: a.dir * 18, rotateX: a.dir * 16, perspective: 1600, ox: 0.5, oy: a.dir > 0 ? 0 : 1 }, duration: 520, ease: HAND };
        }
        if (a.size === "line") return { pose: { opacity: 0, [a.axis]: a.dir * 10, rotate: a.dir * 2, ox: 0, oy: 1 }, duration: 300, ease: HAND };
        return { pose: { opacity: 0, [a.axis]: a.dir * 26, rotate: a.axis === "x" ? a.dir * 1.2 : 0, ox: 0.5, oy: 1 }, duration: 440, ease: HAND };
    },
    swapOut: (a) => {
        if (a.widget || a.level === "gentle") return { pose: { opacity: 0 }, duration: 140, ease: EASE_IN };
        if (a.size === "page") {
            if (a.axis === "x") {
                // 다음 달: 옛 장의 오른쪽 끝이 들려 책등(왼쪽)을 축으로 넘어간다 — 새 장 위에서 · 이전 달: 옛 장은 덮이며 옅어진다
                return a.dir > 0
                    ? { pose: { rotateY: -96, perspective: 2200, ox: 0, oy: 0.5 }, duration: 640, ease: TURN, above: true }
                    : { pose: { opacity: 0 }, duration: 420, ease: EASE_IN, delay: 120 };
            }
            return { pose: { opacity: 0, y: -a.dir * 14, rotateX: -a.dir * 12, perspective: 1600, ox: 0.5, oy: a.dir > 0 ? 1 : 0 }, duration: 280, ease: EASE_IN };
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
