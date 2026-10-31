"use client";
/**
 * 화면 효과의 무대 — 앱 맨 위에 깔린 투명 캔버스 하나 (누르는 것은 받지 않는다).
 *
 * fx.emit(…) 신호(src/lib/fx.ts 의 FxKind)가 오면 지금 갈래의 효과 모듈이 정해진 시간만 그리고,
 * 끝나면 캔버스를 비우고 숨긴 채 멈춘다. 평소에는 아무것도 돌지 않는다.
 * three 와 엔진은 처음 효과가 필요할 때 받는다(동적 import) — 첫 화면을 무겁게 하지 않는다.
 * 대신 화면이 한가할 때 미리 받아 둔다: 처음 할 일을 끝낸 순간 three 를 읽느라 폰이 멈칫하지 않게.
 *
 * 자리: 부른 쪽이 x·y·rect 를 안 주면 방금 누른 자리. 지우기·옮기기·챌린지 칸은 방금 누른 "항목"(줄·카드·막대)의
 * 상자를 쓴다 — 지우기는 확인 창을 거치므로 창 밖에서 마지막으로 누른 항목이다.
 * 인사(로그인·기념일·테마)는 겹치지 않게 차례로, 로그인 인사는 다음 화면이 뜬 뒤에 한다(그때 화면 옮김 효과는 건너뛴다).
 *
 * 폰(손가락이 주 입력): 입자를 줄이고(엔진의 lite), 끝냄·챌린지 칸·프로젝트 완료에는 아주 짧게 떨어 준다(navigator.vibrate).
 * 그리지 않는 때: 움직임 '끄기'·OS 의 동작 줄이기(떨림도 없다), 창이 숨었을 때, 데스크톱 위젯 창(투명 창이라 깜빡인다 — 1.2.0).
 * '잔잔하게'면 입자를 줄이고, 자주 일어나는 화면 옮김에는 그리지 않으며, 떨림은 한 번만.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "styled-components";
import { fx, type FxEvent, type FxKind, type FxRect } from "@/lib/fx";
import { usePickTheme } from "@/styles/themed";
import useThemeMotion from "@/hooks/useThemeMotion";
import useMobilePresentation from '@/hooks/useMobilePresentation';
import { isWidgetWindow } from '@/hooks/useAuthFetch';
import type { FxEngine, FxModule } from "./engine";
import * as S from "./FxStage.styles";

const LOADERS = {
    celestial: () => import("./celestial/celestialFx").then((m) => m.default),
    maple: () => import("./maple/mapleFx").then((m) => m.default),
    ocean: () => import("./ocean/oceanFx").then((m) => m.default),
    gem: () => import("./gem/gemFx").then((m) => m.default),
};

const CALENDAR_LOADERS = {
    ...LOADERS,
    maple: () => import('./maple/mapleNotebookFx').then(m => m.default),
};

/** 마지막 효과 뒤 이만큼 조용하면 GPU 자원을 돌려준다 */
const IDLE_DISPOSE_MS = 20_000;
/** 인사끼리는 이만큼 띄운다 */
const GREET_GAP_MS = 1700;
const GREETINGS = new Set<FxKind>(["welcome", "anniversary", "theme"]);
/** 방금 누른 항목의 상자를 쓰는 효과 */
const ITEM_KINDS = new Set<FxKind>(["remove", "advance", "sticker"]);
/** 짧은 떨림 (ms) — 끝냄 계열만. 이정표는 두 번 */
const HAPTIC: Partial<Record<FxKind, number>> = { complete: 10, sticker: 14, "project-done": 16 };

/** 손가락이 주 입력인 기기 (폰·태블릿) */
const coarse = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
/** 폰처럼 가볍게 그려야 하는 기기 */
const isLite = () => coarse() || window.innerWidth < 768;

/** 상자처럼 보이는가 (바탕·테두리·그림자) — 줄·카드·막대를 찾는 데 쓴다 */
function hasBox(el: Element) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) return true;
    if (cs.backgroundImage !== "none" || cs.boxShadow !== "none") return true;
    return (["Top", "Right", "Bottom", "Left"] as const).some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none");
}

/**
 * 누른 자리의 "항목" — 위로 올라가며 처음 만나는 상자(줄·카드·막대)를 고른다.
 * 작은 단추(휴지통·옮기기)는 건너뛰고, 화면 반을 넘는 판에 닿으면 멈춘다. 상자가 없으면 거기까지 오른 것.
 */
function itemRectAt(target: EventTarget | null): FxRect | undefined {
    if (!(target instanceof Element)) return undefined;
    const maxW = window.innerWidth * 0.96;
    const maxH = Math.min(420, window.innerHeight * 0.55);
    let fit: DOMRect | undefined;
    let el: Element | null = target;
    for (let i = 0; el && el !== document.body && i < 9; i++, el = el.parentElement) {
        const r = el.getBoundingClientRect();
        if (r.width > maxW || r.height > maxH) break;
        if (r.width < 1 || r.height < 1) continue;
        fit = r;
        if (r.width < 56 || r.height < 12) continue;
        if (el.matches("button, a, input, select, textarea, [role=tab], [role=checkbox], [role=switch], [role=radio]") && (r.width < 120 || r.height < 28)) continue;
        if (hasBox(el)) return { x: r.left, y: r.top, w: r.width, h: r.height };
    }
    return fit && { x: fit.left, y: fit.top, w: fit.width, h: fit.height };
}

interface Touch { x: number; y: number; at: number; item?: FxRect }

export default function FxStage() {
    const pathname = usePathname();
    const motion = useThemeMotion();
    const baseLoad = usePickTheme(LOADERS);
    const calendarLoad = usePickTheme(CALENDAR_LOADERS);
    const load = pathname?.startsWith('/calendar') ? calendarLoad : baseLoad;
    const mobileApp = useMobilePresentation();
    const inWidget = isWidgetWindow() || mobileApp;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FxEngine | null>(null);
    const engineLoading = useRef<Promise<FxEngine | null> | null>(null);
    const modRef = useRef<FxModule | null>(null);
    const modLoading = useRef<Promise<FxModule | null> | null>(null);
    /** 방금 누른 자리와 항목 · 창(대화상자·차림표) 밖에서 마지막으로 누른 것 */
    const pointer = useRef<Touch>({ x: 0, y: 0, at: 0 });
    const outside = useRef<Touch>({ x: 0, y: 0, at: 0 });
    const welcome = useRef(0);
    const signedIn = useRef<{ at: number; e: FxEvent; timer?: ReturnType<typeof setTimeout> } | null>(null);
    const greetUntil = useRef(0);
    /** 차례를 기다리는 인사 (종류마다 하나) */
    const waiting = useRef(new Map<FxKind, { at: number; timer: ReturnType<typeof setTimeout> }>());
    const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const motionRef = useRef(motion);
    motionRef.current = motion;
    const theme = useTheme();
    const darkRef = useRef(theme.mode === "dark");
    darkRef.current = theme.mode === "dark";

    /** 엔진은 처음 쓸 때 만든다. WebGL 이 없으면 조용히 포기 */
    const engine = async (): Promise<FxEngine | null> => {
        if (engineRef.current) return engineRef.current;
        if (!engineLoading.current) {
            engineLoading.current = (async () => {
                const canvas = canvasRef.current;
                if (!canvas) return null;
                try {
                    const [THREE, { FxEngine }] = await Promise.all([import("three"), import("./engine")]);
                    engineRef.current = new FxEngine(THREE, canvas, isLite());
                    return engineRef.current;
                } catch {
                    return null;
                }
            })().finally(() => { engineLoading.current = null; });
        }
        return engineLoading.current;
    };

    /** 효과의 자리 — 부른 쪽이 안 준 것은 방금 누른 자리·항목으로 채운다 */
    const place = (e: FxEvent): FxEvent => {
        const now = performance.now();
        const p = pointer.current;
        if (ITEM_KINDS.has(e.kind) && !e.rect) {
            // 지우기는 확인 창을 거친다 — 창 밖에서 마지막으로 누른 항목 (20초 안)
            const src = e.kind === "remove" ? outside.current : p;
            const fresh = now - src.at < (e.kind === "remove" ? 20_000 : 1500);
            if (fresh && src.item) {
                const r = src.item;
                return { ...e, rect: r, x: e.x ?? (e.kind === "remove" ? r.x + r.w / 2 : src.x), y: e.y ?? (e.kind === "remove" ? r.y + r.h / 2 : src.y) };
            }
        }
        return e;
    };

    const play = async (e: FxEvent) => {
        const mod = modRef.current ?? (await modLoading.current?.catch(() => null)) ?? null;
        if (!mod?.effects[e.kind]) return;
        const eng = await engine();
        if (!eng || motionRef.current === "off" || document.hidden) return;
        const recent = performance.now() - pointer.current.at < 1500;
        eng.play(mod, e, {
            gentle: motionRef.current === "gentle",
            dark: darkRef.current,
            x: recent ? pointer.current.x : window.innerWidth / 2,
            y: recent ? pointer.current.y : window.innerHeight / 2,
        });
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            if (engineRef.current && !engineRef.current.busy) { engineRef.current.dispose(); engineRef.current = null; }
        }, IDLE_DISPOSE_MS);
    };

    /**
     * 인사는 겹치지 않게 — 앞 인사가 끝나 갈 때 다음 것.
     * 같은 인사가 이미 차례를 기다리고 있으면 그 자리를 이어받는다: 테마 타일을 잇달아 누르면 바꾼 수만큼 인사가
     * 1.7초 간격으로 줄줄이 이어져, 다 고른 뒤에도 몇 초씩 화면 가득 효과가 돌았다.
     */
    const greet = (e: FxEvent) => {
        const now = performance.now();
        const run = () => { waiting.current.delete(e.kind); void play(e); };
        const prev = waiting.current.get(e.kind);
        if (prev && prev.at > now) {
            clearTimeout(prev.timer);
            prev.timer = setTimeout(run, prev.at - now);
            return;
        }
        const at = Math.max(now, greetUntil.current);
        greetUntil.current = at + GREET_GAP_MS;
        if (at <= now) { void play(e); return; }
        waiting.current.set(e.kind, { at, timer: setTimeout(run, at - now) });
    };

    /** 아주 짧은 떨림 — 손가락으로 쓰는 기기에서, 끝냄 계열에만 (안드로이드 앱은 VIBRATE 권한이 있어야 실제로 떤다) */
    const buzz = (e: FxEvent) => {
        const ms = HAPTIC[e.kind];
        if (!ms || !coarse() || typeof navigator.vibrate !== "function") return;
        const big = e.kind === "project-done" || (e.kind === "sticker" && (e.level ?? 0) > 0);
        try { navigator.vibrate(big && motionRef.current === "full" ? [ms, 60, ms + 8] : ms); } catch { /* 막혀 있으면 그만 */ }
    };

    // 방금 누른 자리와 그 항목 — 끝냄·넣음 효과를 그 자리에서, 지우기는 그 항목 자리에서
    useEffect(() => {
        if (inWidget) return;
        const on = (e: PointerEvent) => {
            // 움직임을 껐으면 항목을 찾을 일도 없다 (누를 때마다 상자를 재지 않는다)
            const t: Touch = { x: e.clientX, y: e.clientY, at: performance.now(), item: motionRef.current === "off" ? undefined : itemRectAt(e.target) };
            pointer.current = t;
            const el = e.target instanceof Element ? e.target : null;
            if (el?.closest("[data-app-shell]") && !el.closest('[role="dialog"], [role="alertdialog"], [aria-modal="true"]')) outside.current = t;
        };
        window.addEventListener("pointerdown", on, { capture: true, passive: true });
        return () => window.removeEventListener("pointerdown", on, { capture: true });
    }, [inWidget]);

    // 갈래가 바뀌면 그 갈래의 모듈을 받는다. 방금 테마를 바꿔서 바뀐 것이면 새 갈래가 인사를 한다
    useEffect(() => {
        if (inWidget) return;
        let alive = true;
        modRef.current = null;
        const loading = load().then((m) => {
            if (!alive) return null;
            modRef.current = m;
            if (welcome.current && performance.now() - welcome.current < 3000) {
                welcome.current = 0;
                if (motionRef.current !== "off" && !document.hidden) greet({ kind: "theme" });
            }
            return m;
        });
        modLoading.current = loading;
        loading.catch(() => {});
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, inWidget]);

    // 한가할 때 three·엔진을 미리 받아 둔다 — 첫 효과 때 읽고 해석하느라 화면이 멈칫하지 않게
    useEffect(() => {
        if (inWidget || motion === "off") return;
        const warm = () => { void import("three").catch(() => {}); void import("./engine").catch(() => {}); };
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
        if (w.requestIdleCallback) {
            const id = w.requestIdleCallback(warm, { timeout: 6000 });
            return () => w.cancelIdleCallback?.(id);
        }
        const t = setTimeout(warm, 3000);
        return () => clearTimeout(t);
    }, [inWidget, motion]);

    // 개발 중에만: 콘솔·시험 도구에서 효과를 불러 본다.
    //   window.__fx.emit("complete")                         — 지금 갈래로 (자리·떨림·인사 차례까지 실제와 같게)
    //   window.__fxTry("maple", "sticker", { level: 1, … })  — 테마를 안 바꾸고 다른 갈래의 효과를 바로
    //   window.__fxStop()                                    — 돌던 효과를 지운다
    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;
        const w = window as unknown as {
            __fx?: typeof fx;
            __fxTry?: (family: keyof typeof LOADERS, kind: FxKind, detail?: Omit<FxEvent, "kind">) => Promise<void>;
            __fxStop?: () => void;
        };
        w.__fx = fx;
        w.__fxTry = async (family, kind, detail = {}) => {
            const mod = await LOADERS[family]();
            const eng = await engine();
            eng?.play(mod, place({ kind, ...detail }), {
                gentle: motionRef.current === "gentle", dark: darkRef.current,
                x: detail.x ?? window.innerWidth / 2, y: detail.y ?? window.innerHeight / 2,
            });
        };
        w.__fxStop = () => engineRef.current?.stopAll();
    }, []);

    useEffect(() => {
        if (inWidget || mobileApp) return;
        return fx.on((raw) => {
            if (motionRef.current === "off" || document.hidden) return;
            // 테마를 바꾸면 새 갈래의 모듈이 들어온 뒤에 인사한다
            if (raw.kind === "theme") { welcome.current = performance.now(); return; }
            if (motionRef.current === "gentle" && raw.kind === "page") return;
            buzz(raw);
            const e = place(raw);
            // 로그인·가입: 다음 화면이 뜬 뒤에 인사한다 (화면이 안 바뀌면 조금 뒤에 그 자리에서)
            if (e.kind === "welcome") {
                if (signedIn.current?.timer) clearTimeout(signedIn.current.timer);
                const timer = setTimeout(() => { signedIn.current = null; greet(e); }, 2500);
                signedIn.current = { at: performance.now(), e, timer };
                return;
            }
            if (GREETINGS.has(e.kind)) { greet(e); return; }
            void play(e);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inWidget, mobileApp]);

    // 화면을 옮김 (처음 뜰 때는 빼고). 로그인 직후의 옮김은 효과 대신 인사를 한다
    const firstPath = useRef(true);
    useEffect(() => {
        if (firstPath.current) { firstPath.current = false; return; }
        const s = signedIn.current;
        if (s && performance.now() - s.at < 5000) {
            clearTimeout(s.timer);
            signedIn.current = null;
            setTimeout(() => greet(s.e), 450);
            return;
        }
        fx.emit("page");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // 움직임을 끄거나 창이 숨으면 돌던 것을 지운다
    useEffect(() => {
        if (motion === "off") engineRef.current?.stopAll();
    }, [motion]);
    useEffect(() => {
        const onVis = () => { if (document.hidden) engineRef.current?.stopAll(); };
        const onResize = () => engineRef.current?.resize();
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("resize", onResize);
        return () => {
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("resize", onResize);
            clearTimeout(idleTimer.current);
            engineRef.current?.dispose();
            engineRef.current = null;
        };
    }, []);

    if (inWidget) return null;
    return <S.Canvas ref={canvasRef} aria-hidden="true" data-fx-stage="" />;
}
