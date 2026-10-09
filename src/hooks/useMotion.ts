"use client";

/**
 * 갈래의 몸짓(src/styles/motion.ts)을 "언제" 그릴지 정하는 훅들.
 *
 *   useSwapMotion(열쇠, 대상, …) — 열쇠(날짜 키·판 이름)가 바뀌면 대상이 오는 쪽에서 들어온다.
 *     요소를 다시 만들지 않는다(element.animate) — 입력칸·메모·초점·스크롤이 그대로 남는다.
 *     다음 날·다음 달·뒤 판이면 오른쪽(아래)에서, 이전이면 왼쪽(위)에서. "오늘" 은 날짜를 견줘 정한다.
 *   useListMotion(목록, …) — 목록에 새로 든 줄은 들어오고, 빠지는 줄은 제자리에서 나가고, 끝낸 줄은 한 번 몸짓을 한다.
 *     목록을 통째로 갈았을 때(날짜를 넘김 — reset)나 한꺼번에 많이 바뀌었을 때(새로 받음)는 줄마다 움직이지 않는다.
 *
 * 움직임 '끄기'(OS 의 동작 줄이기 포함)면 아무것도 하지 않는다. '잔잔하게'면 갈래가 짧은 것을 준다.
 * 데스크톱 위젯 창(투명 창)은 날짜 넘김만 아주 짧게, 목록의 몸짓은 없다 — 창 전체를 다시 칠해 깜빡인다(1.2.0).
 * 끝난 몸짓은 아무것도 남기지 않는다: transform 이 남으면 안의 fixed 단추가 화면이 아니라 그 상자에 선다(BUGS.md).
 */
import * as React from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import { isWidgetWindow } from "@/hooks/useAuthFetch";
import { usePickTheme } from "@/styles/themed";
import {
    cubic, enterFrames, exitFrames, optionsOf,
    type Axis, type Dir, type DoneMotion, type MotionSet, type Step, type SwapSize,
} from "@/styles/motion";
import { tideMotion } from "@/styles/ocean/water";
import { paperMotion } from "@/styles/maple/motion";
import { starMotion } from "@/styles/celestial/motion";

/** 갈래마다 제 몸짓 — Celestial 은 별빛(곧게 미끄러지며 맑아짐), Maple 은 종이, 바다는 물. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const SETS = { celestial: starMotion, maple: paperMotion, ocean: tideMotion };

export function useMotionSet(): MotionSet {
    return usePickTheme(SETS);
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** 움직일 것 — ref, 또는 그때그때 찾아 주는 함수(갈래 배치 안에 있어 ref 를 달 수 없는 것) */
export type MotionTarget =
    | React.RefObject<Element | null>
    | (() => Element | null | undefined | ReadonlyArray<Element | null | undefined>);

function targetsOf(t: MotionTarget): Element[] {
    const v = typeof t === "function" ? t() : t.current;
    const list: ReadonlyArray<Element | null | undefined> = Array.isArray(v) ? v : [v as Element | null | undefined];
    return list.filter((el): el is Element => !!el && el.isConnected);
}

/**
 * 실제로 그려지는 상자들 — 상자를 벗은 것(display: contents, 바다의 프로젝트 보드처럼)은 그 아이들로 내려간다.
 * 그런 것에는 transform·투명도가 먹지 않는다.
 */
export function boxesOf(el: Element | null | undefined): Element[] {
    if (!el) return [];
    if (getComputedStyle(el).display !== "contents") return [el];
    return Array.from(el.children).flatMap(boxesOf);
}

/**
 * 몸짓의 시계는 다음 그림부터 간다 — 처음 모습으로 멈춰 두었다가 다음 프레임에 튼다.
 * 막 그린 무거운 내용(새 판·새 달)을 세우느라 본 스레드가 바쁜 동안 시계가 먼저 가 버리면, 첫 그림이 나올 때 몸짓이 이미 끝나 있었다.
 * (그사이 지워지면 — 빠르게 또 넘김 — 틀지 않는다)
 */
export function startOnNextFrame(a: Animation) {
    a.pause();
    requestAnimationFrame(() => { if (a.playState === "paused") a.play(); });
    return a;
}

/** 그 요소의 평소 투명도 — 옅게 서 있는 것(다른 달 칸)은 그 값까지만 차오른다. 다른 몸짓이 도는 중이면 1 */
function restOpacity(el: Element) {
    if (el.getAnimations().length) return 1;
    const v = parseFloat(getComputedStyle(el).opacity);
    return Number.isFinite(v) && v > 0 ? v : 1;
}

/* ── 갈리는 내용 ─────────────────────────────────────────────────────── */

export type SwapKey = string | number;

/** 앞뒤 차례 — 날짜 키("2026-10-09")·달 키("2026-10")는 글자 차례가 곧 날짜 차례다 */
export function compareKeys(prev: SwapKey, next: SwapKey): Dir {
    if (typeof prev === "number" && typeof next === "number") return next < prev ? -1 : 1;
    return String(next) < String(prev) ? -1 : 1;
}

export interface SwapOptions {
    /** x: 옆으로(날짜·탭) · y: 위아래로(세로로 늘어선 판) */
    axis?: Axis;
    size?: SwapSize;
    /** 차례를 직접 — 1·-1, 또는 앞뒤 열쇠로 셈하는 함수. 없으면 order, 그것도 없으면 열쇠의 차례 */
    dir?: Dir | ((prev: SwapKey, next: SwapKey) => Dir);
    /** 판 이름처럼 글자 차례가 뜻이 없는 열쇠의 차례 */
    order?: readonly SwapKey[];
    disabled?: boolean;
}

function dirOf(prev: SwapKey, next: SwapKey, o: SwapOptions): Dir {
    if (typeof o.dir === "number") return o.dir;
    if (typeof o.dir === "function") return o.dir(prev, next);
    if (o.order) {
        const a = o.order.indexOf(prev);
        const b = o.order.indexOf(next);
        if (a >= 0 && b >= 0) return b < a ? -1 : 1;
    }
    return compareKeys(prev, next);
}

/**
 * 열쇠가 바뀌면 대상이 오는 쪽에서 들어온다. 처음 그릴 때(열쇠가 없던 데서 생길 때도)는 움직이지 않는다.
 * 대상이 열쇠와 함께 새로 그려지는 요소(key={tab})여도 된다 — 그려진 뒤의 요소를 움직인다.
 */
export function useSwapMotion(key: SwapKey | null | undefined, target: MotionTarget, opts: SwapOptions = {}) {
    const set = useMotionSet();
    const level = useThemeMotion();
    const live = React.useRef({ set, level, target, opts });
    live.current = { set, level, target, opts };
    const prev = React.useRef(key);
    const running = React.useRef<Animation[]>([]);

    useIsoLayoutEffect(() => {
        const before = prev.current;
        prev.current = key;
        if (before === key || before == null || key == null) return;
        const { set, level, target, opts } = live.current;
        if (level === "off" || opts.disabled) return;
        const step = set.swapIn({ dir: dirOf(before, key, opts), axis: opts.axis ?? "x", level, size: opts.size ?? "pane", widget: isWidgetWindow() });
        // 빠르게 잇달아 넘기면 앞 몸짓을 지우고 새로 — 겹쳐 쌓이지 않게
        running.current.forEach((a) => a.cancel());
        running.current = [];
        if (!step) return;
        running.current = targetsOf(target).map((el) => startOnNextFrame(el.animate(enterFrames(step.pose, restOpacity(el)), optionsOf(step))));
    }, [key]);
}

/**
 * 닫히는 판(펼친 서식 등)의 몸짓 — 위로 걷히며 나간 뒤에 닫는다(after 가 지운다). 움직임을 껐으면 바로 닫는다.
 * 나가는 동안은 누를 수 없다.
 */
export function useLeaveMotion() {
    const set = useMotionSet();
    const level = useThemeMotion();
    return React.useCallback((el: Element | null | undefined, after: () => void) => {
        const step = !el || level === "off" ? null : set.swapOut({ dir: 1, axis: "y", level, size: "pane", widget: isWidgetWindow() });
        if (!el || !step) { after(); return; }
        if (el instanceof HTMLElement) el.style.pointerEvents = "none";
        const a = startOnNextFrame(el.animate(exitFrames(step.pose), { ...optionsOf(step), fill: "forwards" }));
        let done = false;
        const finish = () => { if (!done) { done = true; after(); } };
        a.onfinish = finish;
        window.setTimeout(finish, step.duration + 300);
    }, [set, level]);
}

/* ── 목록 ───────────────────────────────────────────────────────────── */

export interface ListMotionOptions {
    /** 이 값이 바뀌면 목록이 통째로 갈린 것(날짜를 넘김·다른 카테고리) — 줄마다 움직이지 않고 새로 기억만 한다 */
    reset?: unknown;
    /**
     * 빠지는 줄: collapse(흐름 속 줄 — 제자리에서 높이를 접는다) · float(격자의 카드 — 제자리에 뜬 채 사라진다) · false(그냥 사라짐)
     * auto: 목록이 여러 칸 격자면 float, 아니면 collapse — 같은 목록이 갈래마다 격자이기도 줄이기도 하다
     */
    exit?: "collapse" | "float" | "auto" | false;
    /** 새로 든 줄의 몸짓 — 줄이 제 등장 몸짓(CSS)을 이미 가졌으면 false */
    enter?: boolean;
    /**
     * 바로 아래 아이 대신 이 선택자로 고른 자손을 줄로 본다(챌린지 칸·연속 표시처럼 줄 안에 든 작은 칸).
     * 그때 빠지는 몸짓(exit)은 하지 않는다 — 되살릴 자리를 모른다
     */
    items?: string;
    /** 줄이 아닌 아이(머리글 등)를 거를 때 */
    filter?: (el: Element) => boolean;
}

/** 한꺼번에 이만큼 넘게 들거나 빠지면 목록을 새로 받은 것이다 — 줄마다 움직이지 않는다 */
const BULK = 4;
/** 처음 그린 뒤·통째로 갈린 뒤 이만큼은 자료가 막 도착하는 때다 — 판이 들어오는 몸짓과 겹치지 않게 줄마다 움직이지 않는다 */
const SETTLE_MS = 650;
/** 되살려 둔 빠지는 줄 — 목록의 아이로 치지 않는다 */
const GHOSTS = new WeakSet<Element>();
/** 들어오는 중인 줄의 몸짓 — 같은 줄이 열쇠만 바뀌어(임시 id → 서버 id) 새 요소가 되면 거기서 이어 그린다 */
const ENTERING = new WeakMap<Element, Animation>();

/** 끝낸 줄인가 — 줄의 data-done 으로만 센다 (aria-pressed 는 "고름" 을 뜻하는 곳도 있다 — 챌린지 줄) */
const isDone = (el: Element) => el.hasAttribute("data-done");

function continueEntering(el: Element, run: Animation) {
    const effect = run.effect as KeyframeEffect | null;
    if (!effect) return;
    const a = el.animate(effect.getKeyframes() as Keyframe[], effect.getTiming() as KeyframeAnimationOptions);
    a.currentTime = run.currentTime;
    if (run.playState === "paused") startOnNextFrame(a);
    ENTERING.set(el, a);
}

/**
 * 빠진 줄을 원래 자리에 잠깐 되살려 나가는 몸짓을 한 뒤 지운다.
 * React 는 이미 이 요소를 떼어 냈고 다시 쓰지 않는다 — 누를 수도 읽힐 수도 없게(inert) 두었다가 끝나면 지운다.
 */
function ghostOut(box: Element, el: Element, before: Element[], alive: Set<Element>, step: Step, mode: "collapse" | "float") {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;
    const at = before.indexOf(el);
    const anchor = before.slice(at + 1).find((k) => alive.has(k) && k.parentNode === box) ?? null;
    const node = el as HTMLElement;
    GHOSTS.add(node);
    node.setAttribute("inert", "");
    node.setAttribute("aria-hidden", "true");
    node.style.pointerEvents = "none";
    box.insertBefore(node, anchor);

    let frames = exitFrames(step.pose, restOpacity(node));
    if (mode === "float") {
        // 격자: 제자리(흐름 속 자리)를 재고 그 위에 띄운다 — 남은 카드는 바로 빈자리를 메운다
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node;
        Object.assign(node.style, { position: "absolute", left: `${offsetLeft}px`, top: `${offsetTop}px`, width: `${offsetWidth}px`, height: `${offsetHeight}px`, margin: "0", zIndex: "1" });
    } else {
        // 흐름 속 줄: 높이·여백을 접어 아래 줄이 미끄러져 올라온다. 사이 간격(gap)도 마지막에 먹는다
        const cs = getComputedStyle(node);
        const gap = parseFloat(getComputedStyle(box).rowGap) || 0;
        node.style.boxSizing = "border-box";
        node.style.overflow = "hidden";
        const h = node.offsetHeight;
        frames = [
            { ...frames[0], height: `${h}px`, minHeight: "0px", marginTop: cs.marginTop, marginBottom: cs.marginBottom, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom },
            { ...frames[1], height: "0px", minHeight: "0px", marginTop: "0px", marginBottom: `${-gap}px`, paddingTop: "0px", paddingBottom: "0px" },
        ];
    }
    let gone = false;
    const drop = () => {
        if (gone) return;
        gone = true;
        node.remove();
        GHOSTS.delete(node);
    };
    const a = startOnNextFrame(node.animate(frames, { duration: step.duration, easing: cubic(step.ease), fill: "forwards" }));
    a.onfinish = drop;
    a.oncancel = drop;
    // 끝 소식이 안 와도(숨은 창) 남지 않게
    window.setTimeout(drop, step.duration + 500);
}

/** 줄이 옆으로도 늘어서는가(여러 칸 격자·가로 줄) — 그러면 빠진 카드의 높이를 접어도 옆 칸이 메워지지 않는다 */
function isSideBySide(box: Element) {
    const cs = getComputedStyle(box);
    if (cs.display.includes("grid")) return cs.gridTemplateColumns.trim().split(/\s+/).length > 1;
    return cs.display.includes("flex") && cs.flexDirection.startsWith("row");
}

function playDone(el: Element, d: DoneMotion) {
    // 더해서 그린다 — 표(마름모처럼 제 rotate 를 가진 것)·줄의 제 그림자를 지우지 않고 그 위에 톡·물결을 얹는다
    const timing: KeyframeAnimationOptions = { duration: d.duration, easing: cubic(d.ease), composite: "add" };
    const mark = el.matches("[data-motion-mark]") ? el : el.querySelector("[data-motion-mark]");
    if (d.mark && mark) startOnNextFrame(mark.animate(d.mark, timing));
    if (d.row && mark !== el) startOnNextFrame(el.animate(d.row, timing));
}

/**
 * 목록(대상의 바로 아래 아이들)이 바뀌면 — 새로 든 줄은 들어오고, 빠진 줄은 나가고(exit), 끝낸 줄은 한 번 몸짓을 한다.
 * 요소가 새로 생겼는지로 센다(React 는 열쇠가 같은 줄의 요소를 그대로 쓴다) — 줄에 따로 표시를 달 필요가 없다.
 * 끝냄은 줄의 data-done 이 켜지는 순간 — 같은 목록 안에서만(통째로 갈린 때는 빼고). 체크칸에 data-motion-mark 가 있으면 그것도 함께.
 */
export function useListMotion(target: MotionTarget, opts: ListMotionOptions = {}) {
    const set = useMotionSet();
    const level = useThemeMotion();
    const theme = useTheme();
    const live = React.useRef({ set, level, theme, target, opts });
    live.current = { set, level, theme, target, opts };
    const mem = React.useRef({ box: null as Element | null, kids: [] as Element[], done: new WeakMap<Element, boolean>(), reset: undefined as unknown, ready: false, since: 0 });

    // 그릴 때마다 — 목록이 바뀐 commit 에서만 무언가 한다(바뀐 것이 없으면 아이들을 훑기만)
    useIsoLayoutEffect(() => {
        const { set, level, theme, target, opts } = live.current;
        const m = mem.current;
        const now = performance.now();
        // 처음 그린 때·통째로 갈린 때부터 셈한다 — 그 뒤 잠깐은 자료가 막 도착하는 때다
        const fresh = !m.ready || !Object.is(m.reset, opts.reset);
        if (fresh) { m.ready = true; m.since = now; m.reset = opts.reset; }
        const box = targetsOf(target)[0] ?? null;
        const kids = box
            ? Array.from(opts.items ? box.querySelectorAll(opts.items) : box.children).filter((el) => !GHOSTS.has(el) && (!opts.filter || opts.filter(el)))
            : [];
        // 목록 상자가 새로 생겼으면(빈 칸 안내 → 목록) 예전 줄은 없던 셈 — 빈 목록에 넣은 첫 줄도 들어온다
        const sameBox = !!box && box === m.box;
        const before = sameBox ? m.kids : [];
        const remember = () => {
            m.box = box;
            m.kids = kids;
            kids.forEach((el) => m.done.set(el, isDone(el)));
        };
        // 통째로 갈린 그 그림(다른 날·다른 챌린지)에서는 아무것도 하지 않는다 — 끝냄 표시가 바뀌어 보여도 끝낸 것이 아니다
        if (!box || fresh || level === "off" || isWidgetWindow()) { remember(); return; }
        const settling = now - m.since < SETTLE_MS;

        const had = new Set(before);
        const has = new Set(kids);
        let added = kids.filter((el) => !had.has(el));
        let removed = before.filter((el) => !has.has(el) && !el.isConnected);
        if (!added.length && !removed.length && !kids.some((el) => isDone(el) && m.done.get(el) === false)) { remember(); return; }

        // 열쇠만 바뀐 같은 줄(임시 id → 서버 id) — 글이 같으면 짝지어 움직이지 않는다. 들어오던 중이면 새 요소에서 이어서
        if (added.length && removed.length) {
            const left = [...removed];
            added = added.filter((el) => {
                const i = left.findIndex((old) => old.textContent === el.textContent);
                if (i < 0) return true;
                const run = ENTERING.get(left[i]);
                if (run && (run.playState === "running" || run.playState === "paused")) continueEntering(el, run);
                left.splice(i, 1);
                return false;
            });
            removed = left;
        }
        if (settling || added.length > BULK || removed.length > BULK) { added = []; removed = []; }

        const enter = added.length && opts.enter !== false ? set.itemIn(level) : null;
        if (enter) {
            added.forEach((el, i) => {
                const a = startOnNextFrame(el.animate(enterFrames(enter.pose, restOpacity(el)), { ...optionsOf(enter), delay: (enter.delay ?? 0) + i * 45 }));
                ENTERING.set(el, a);
            });
        }
        if (opts.exit && !opts.items && removed.length) {
            const out = set.itemOut(level);
            const mode = opts.exit === "auto" ? (isSideBySide(box) ? "float" : "collapse") : opts.exit;
            if (out) removed.forEach((el) => ghostOut(box, el, before, has, out, mode));
        }
        const done = set.done(level, theme);
        if (done) kids.forEach((el) => { if (had.has(el) && m.done.get(el) === false && isDone(el)) playDone(el, done); });

        remember();
    });
}
