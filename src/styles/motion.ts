/**
 * 움직임의 꼴 — 갈래마다 한 벌(MotionSet). 고르는 것은 훅(src/hooks/useMotion.ts)이 usePickTheme 로 한다.
 *
 * 여기에는 "무엇이 어떻게" 만 적는다 — 들어오기 전의 모습(Pose)·시간·결.
 * "언제" 는 훅이 정한다:
 *   useSwapMotion — 날짜·판이 바뀌어 같은 자리의 내용이 갈릴 때 (다음이면 오른쪽·아래에서, 이전이면 왼쪽·위에서)
 *   useListMotion — 목록에 새로 든 줄·빠지는 줄·끝낸 줄
 * 그리는 법은 Web Animations(element.animate) — 요소를 다시 만들지 않으니 입력칸·초점·스크롤이 그대로 남는다.
 * 끝나면 아무것도 남기지 않는다(fill 없음): transform 이 남으면 안의 fixed 단추가 화면이 아니라 그 상자에 선다(BUGS.md, Maple).
 *
 * Celestial: styles/celestial/motion.ts 의 starMotion, 바다: styles/ocean/water.ts 의 tideMotion, Maple: styles/maple/motion.ts 의 paperMotion.
 * 아래 NEUTRAL_MOTION 은 제 몸짓을 아직 안 가진 새 갈래의 자리다.
 */
import type { DefaultTheme } from "styled-components";

/** 1: 다음(뒤 날짜·뒤 판) · -1: 이전 */
export type Dir = 1 | -1;
export type Axis = "x" | "y";
/** full: 제 몸짓 · gentle: 거의 움직이지 않고 옅게 나타나기만. off 면 훅이 아예 부르지 않는다 */
export type MotionLevel = "full" | "gentle";
/** 바뀐 것의 크기 — page: 화면 한 판(월간 격자) · pane: 판 안의 내용(일간·목록·설정 판) · line: 글씨 한 줄(날짜 머리) */
export type SwapSize = "page" | "pane" | "line";
/** cubic-bezier 네 수 */
export type Ease = readonly [number, number, number, number];

/** 한 때의 모습 — 제자리에서 얼마나 벗어났나 (적지 않은 것은 제자리) */
export interface Pose {
    x?: number;
    y?: number;
    scale?: number;
    /** deg */
    rotate?: number;
    rotateX?: number;
    rotateY?: number;
    /** rotateX·rotateY 의 원근 (px) */
    perspective?: number;
    /** 흐림 (px) — 안에 유리(backdrop-filter)가 있는 상자에는 쓰지 말 것: 흐림·투명도가 걸린 동안 유리가 뒤를 못 본다 */
    blur?: number;
    opacity?: number;
    /** 돌거나 커지는 중심 (0~1) */
    ox?: number;
    oy?: number;
}

/** 한 번의 몸짓 — 들어올 때는 pose → 제자리, 나갈 때는 제자리 → pose */
export interface Step {
    pose: Pose;
    duration: number;
    ease: Ease;
    delay?: number;
}

export interface SwapAsk {
    dir: Dir;
    axis: Axis;
    level: MotionLevel;
    size: SwapSize;
    /** 데스크톱 위젯 창 — 투명 창이라 아주 짧게, 한 번만 */
    widget: boolean;
}

/** 끝냄 — 줄(row)과 그 안의 표(mark: 체크칸)가 한 번. 키프레임은 WAAPI 그대로 */
export interface DoneMotion {
    row?: Keyframe[];
    mark?: Keyframe[];
    duration: number;
    ease: Ease;
}

export interface MotionSet {
    /** 날짜·판이 바뀌어 새 내용이 들어올 때 */
    swapIn(a: SwapAsk): Step | null;
    /** 그때 나가는 옛 내용 — 옛 내용을 남겨 두는 곳(월간 격자)만 쓴다 */
    swapOut(a: SwapAsk): Step | null;
    /** 목록에 새로 든 줄 */
    itemIn(level: MotionLevel): Step | null;
    /** 목록에서 빠지는 줄 (흐름 속 줄은 높이도 함께 접힌다) */
    itemOut(level: MotionLevel): Step | null;
    /** 끝낸 줄 */
    done(level: MotionLevel, theme: DefaultTheme): DoneMotion | null;
    /** 확인·알림 창(카드)이 닫힐 때 — 뒤의 막은 함께 옅어진다 */
    dialogOut(level: MotionLevel): Step | null;
}

/* ── 결 ─────────────────────────────────────────────────────────────── */
/** 빠르게 와서 천천히 멈춘다 (들어올 때) */
export const EASE_OUT: Ease = [0.22, 1, 0.36, 1];
/** 천천히 떠나 빠르게 사라진다 (나갈 때) */
export const EASE_IN: Ease = [0.4, 0, 1, 1];
export const cubic = (e: Ease) => `cubic-bezier(${e.join(", ")})`;

/* ── 그리기 (WAAPI) ─────────────────────────────────────────────────── */
export function transformOf(p: Pose): string {
    const parts: string[] = [];
    if (p.perspective) parts.push(`perspective(${p.perspective}px)`);
    if (p.x || p.y) parts.push(`translate3d(${p.x ?? 0}px, ${p.y ?? 0}px, 0)`);
    if (p.rotate) parts.push(`rotate(${p.rotate}deg)`);
    if (p.rotateX) parts.push(`rotateX(${p.rotateX}deg)`);
    if (p.rotateY) parts.push(`rotateY(${p.rotateY}deg)`);
    if (p.scale != null && p.scale !== 1) parts.push(`scale(${p.scale})`);
    return parts.length ? parts.join(" ") : "none";
}

const originOf = (p: Pose) => (p.ox != null || p.oy != null ? `${(p.ox ?? 0.5) * 100}% ${(p.oy ?? 0.5) * 100}%` : undefined);

/** 들어오기: pose → 제자리. rest 는 그 요소의 평소 투명도 (다른 달 칸처럼 옅게 서 있는 것) */
export function enterFrames(p: Pose, rest = 1): Keyframe[] {
    const from: Keyframe = { transform: transformOf(p), opacity: p.opacity ?? rest };
    const to: Keyframe = { transform: "none", opacity: rest };
    if (p.blur) { from.filter = `blur(${p.blur}px)`; to.filter = "blur(0px)"; }
    const origin = originOf(p);
    if (origin) { from.transformOrigin = origin; to.transformOrigin = origin; }
    return [from, to];
}

/** 나가기: 제자리 → pose */
export function exitFrames(p: Pose, rest = 1): Keyframe[] {
    return enterFrames(p, rest).reverse();
}

export const optionsOf = (s: Step): KeyframeAnimationOptions => ({
    duration: s.duration,
    easing: cubic(s.ease),
    delay: s.delay ?? 0,
    // 늦춤 동안만 처음 모습을 쥐고, 끝나면 아무것도 남기지 않는다
    fill: "backwards",
});

/* ── 기본 ──────────────────────────────────────────────────────────── */
/** 위젯 창 — 투명 창이라 길게 움직이면 창 전체를 다시 칠한다. 아주 짧게 한 번 */
export const widgetSwap = (a: SwapAsk): Step => ({ pose: { opacity: 0.45, [a.axis]: a.dir * 4 }, duration: 160, ease: EASE_OUT });
/** 잔잔하게 — 거의 움직이지 않고 옅게 나타나기만 */
export const gentleSwap = (a: SwapAsk): Step => ({ pose: { opacity: 0, [a.axis]: a.dir * 4 }, duration: 200, ease: EASE_OUT });

/**
 * 갈래가 제 몸짓을 아직 안 가졌을 때의 몸짓 — 옅어졌다 나타나며 오는 쪽에서 짧게 미끄러진다.
 * 월간 격자(page)는 예전 몸짓(±100px 미끄러짐)에 가깝게 둔다.
 */
export const NEUTRAL_MOTION: MotionSet = {
    swapIn: (a) => {
        if (a.widget) return widgetSwap(a);
        if (a.level === "gentle") return gentleSwap(a);
        if (a.size === "page") return { pose: { opacity: 0, [a.axis]: a.dir * 100 }, duration: 420, ease: EASE_OUT };
        return { pose: { opacity: 0, [a.axis]: a.dir * (a.size === "line" ? 10 : 22) }, duration: a.size === "line" ? 240 : 320, ease: EASE_OUT };
    },
    swapOut: (a) => {
        if (a.widget || a.level === "gentle") return { pose: { opacity: 0 }, duration: 120, ease: EASE_IN };
        if (a.size === "page") return { pose: { opacity: 0, [a.axis]: -a.dir * 100 }, duration: 260, ease: EASE_IN };
        return { pose: { opacity: 0, [a.axis]: -a.dir * 14 }, duration: 180, ease: EASE_IN };
    },
    itemIn: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 180, ease: EASE_OUT }
        : { pose: { opacity: 0, y: -6, scale: 0.98 }, duration: 300, ease: EASE_OUT },
    itemOut: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 140, ease: EASE_IN }
        : { pose: { opacity: 0, x: 10 }, duration: 220, ease: EASE_IN },
    done: (level) => level === "gentle"
        ? null
        : {
            mark: [{ transform: "scale(0.6)" }, { transform: "scale(1.18)", offset: 0.55 }, { transform: "none" }],
            duration: 320,
            ease: EASE_OUT,
        },
    dialogOut: (level) => level === "gentle"
        ? { pose: { opacity: 0 }, duration: 120, ease: EASE_IN }
        : { pose: { opacity: 0, scale: 0.96, y: 6 }, duration: 180, ease: EASE_IN },
};
