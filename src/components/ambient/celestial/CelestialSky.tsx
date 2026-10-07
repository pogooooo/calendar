"use client";
/**
 * Celestial 의 바탕 하늘 — 화면 전체를 three.js 캔버스 한 장으로(장면은 skyScene.ts).
 * 내용 뒤(z-index -1)에 깔리고 누름은 받지 않는다. 빈 하늘(글자·단추·판이 없는 자리)을 톡 누르면
 * 그 자리에 고리가 번지고 가장 가까운 별자리가 밝아진다 — 창 전체의 누름을 듣고, 빈 바탕인지 스스로 가린다.
 * 글 읽기를 방해하지 않게: 화면에 놓인 글·단추·판의 자리를 읽어(skyMask) 그 둘레에서는 하늘을 지운다.
 * 자리는 화면이 바뀌거나(DOM)·스크롤하거나·창 크기가 바뀌면 다시 읽고, 그 밖에도 1.5초마다 한 번.
 *
 * 무겁지 않게: 화면 CSS px 그대로(장치 배율 1)에 초당 30장, 창이 숨거나 끌어 옮기는 중이면 멈춘다.
 * 움직임 '끄기'면 한 장만 그려 두고 멈추고, '잔잔하게'면 느리게(누름·시차 반응 없음).
 * 위젯 창에서는 아예 그리지 않는다(ThemeAtmosphere 가 건너뛴다). WebGL 이 없으면 onFail — 예전 별도 그림으로.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import { parallax } from "@/lib/parallax";
import { collectRects, forgetKind, forgetKinds } from "./skyMask";
import * as S from "./CelestialAtmosphere.styles";

const FRAME = 1 / 30;
const STILL = { x: 0, y: 0 };

/**
 * 누른 곳이 빈 하늘인가 — 누를 거리·글자·불투명한 판 위가 아니어야 한다.
 * 장식 SVG(홈의 달 아치 같은)는 하늘로 친다 — 단추 안의 아이콘은 단추가 먼저 걸린다.
 */
const ROLES = ["button", "link", "checkbox", "switch", "tab", "menuitem", "option", "slider", "textbox", "combobox", "listbox", "dialog", "menu", "radio", "gridcell", "row"];
const INTERACTIVE = `a,button,input,textarea,select,label,summary,option,canvas,img,video,iframe,[contenteditable],[tabindex],[draggable='true'],${ROLES.map((r) => `[role='${r}']`).join(",")}`;
function isOpenSky(target: EventTarget | null) {
    if (!(target instanceof Element) || target.closest(INTERACTIVE)) return false;
    for (const n of target.childNodes) if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) return false;
    for (let el: Element | null = target; el && el !== document.documentElement; el = el.parentElement) {
        const cs = getComputedStyle(el);
        if (el === target && cs.cursor === "pointer") return false;
        const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
        const alpha = m ? Number(m[1].split(/[ ,/]+/).filter(Boolean)[3] ?? 1) : 0;
        if (alpha > 0.5) return false;
    }
    return true;
}

/** 하늘이 보이기 시작하는 왼쪽 끝 — 데스크톱은 사이드바 오른쪽(금빛 옆선), 폰·로그인 화면은 0 */
function skyLeft() {
    const side = document.querySelector("[data-app-shell] main")?.previousElementSibling;
    const r = side?.getBoundingClientRect();
    return r && r.width > 0 ? r.right : 0;
}

/** Cinzel 이 들어오기를 잠깐 기다린다 — 못 받으면 세리프로 */
async function cinzel(): Promise<string> {
    for (let i = 0; i < 8; i++) {
        const has = [...document.fonts].some((f) => f.family.replace(/["']/g, "") === "Cinzel");
        if (has) {
            try { await document.fonts.load("500 30px Cinzel", "XVIORN"); } catch { /* 그대로 */ }
            if (document.fonts.check("500 30px Cinzel", "XVIORN")) return "'Cinzel', serif";
        }
        await new Promise((r) => setTimeout(r, 700));
    }
    return "serif";
}

export default function CelestialSky({ onFail }: { onFail: () => void }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const dark = theme.mode === "dark";
    const primary = theme.colors.primary;
    const failRef = useRef(onFail);
    failRef.current = onFail;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        let disposed = false;
        let raf = 0;
        let cleanup = () => {};

        (async () => {
            const [THREE, { createSky }] = await Promise.all([import("three"), import("./skyScene")]);
            if (disposed) return;
            let renderer: import("three").WebGLRenderer;
            try {
                renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
            } catch {
                failRef.current();
                return;
            }
            const lite = window.matchMedia("(hover: none), (max-width: 768px)").matches;
            renderer.setPixelRatio(1);
            renderer.setClearColor(0x000000, 0);
            const sky = createSky(renderer, { dark, primary, lite, scale: 1 });

            const full = motion === "full";
            const fit = () => {
                const w = window.innerWidth, h = window.innerHeight;
                renderer.setSize(w, h, false);
                sky.resize(w, h);
                sky.setLeft(skyLeft());
                soon(60);
                if (motion === "off") sky.frame(0, STILL, 0);
            };
            // 글 자리 지도 — 하늘 자신과 효과 무대는 빼고 읽는 즉시 칠한다
            const skip = () => [canvas.closest("[data-ambient]") ?? canvas, ...document.querySelectorAll("[data-fx-stage]")];
            let maskTimer: ReturnType<typeof setTimeout> | undefined;
            const remask = () => {
                clearTimeout(maskTimer);
                maskTimer = undefined;
                if (document.hidden) return;
                sky.setMask(collectRects(skip(), window.innerWidth, window.innerHeight));
                if (motion === "off") sky.frame(0, STILL, 0);
            };
            const soon = (ms: number) => { if (!maskTimer) maskTimer = setTimeout(remask, ms); };
            const mo = new MutationObserver((records) => {
                // 글자가 생기거나 바뀐 요소만 다시 가린다 — 새 요소는 처음 볼 때 가린다
                for (const r of records) forgetKind(r.type === "characterData" ? r.target.parentElement : (r.target as Element));
                soon(120);
            });
            mo.observe(document.body, { childList: true, subtree: true, characterData: true });
            const onScroll = () => soon(lite ? 120 : 50); // 폰은 덜 자주 — 한 번 읽는 데 데스크톱의 서너 배가 든다
            window.addEventListener("scroll", onScroll, { capture: true, passive: true });
            const periodic = setInterval(() => soon(0), 1500);
            const refresh = setInterval(() => { forgetKinds(); soon(0); }, 6000); // 글 상자 모양이 class 로 바뀐 것까지

            fit();
            remask();
            sky.frame(0, STILL, motion === "off" ? 0 : 1);
            canvas.dataset.ready = "1";
            window.addEventListener("resize", fit);

            void cinzel().then((font) => {
                if (disposed) return;
                sky.fontReady(font);
                if (motion === "off") sky.frame(0, STILL, 0);
            });

            // 손 — 빈 하늘을 톡 누르면 고리와 별자리. 커서·기울기로 시차. '잔잔하게'·끄기면 손에 반응하지 않는다
            // 누른 순간이 아니라 뗄 때 본다: 폰에서는 스크롤도 누름으로 시작해서, 그때마다 고리가 번졌다
            const stopParallax = full ? parallax.start() : () => {};
            let press: { id: number; x: number; y: number; t: number } | null = null;
            const onDown = (e: PointerEvent) => {
                press = e.button === 0 && isOpenSky(e.target) ? { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() } : null;
            };
            const onUp = (e: PointerEvent) => {
                const p = press;
                press = null;
                if (!p || p.id !== e.pointerId || performance.now() - p.t > 600 || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) return;
                sky.tap(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
            };
            const onCancel = () => { press = null; };
            if (full) {
                window.addEventListener("pointerdown", onDown, { passive: true });
                window.addEventListener("pointerup", onUp, { passive: true });
                window.addEventListener("pointercancel", onCancel, { passive: true });
            }

            const speed = motion === "gentle" ? 0.4 : 1;
            let last = performance.now();
            let acc = 0;
            let measured = last;
            const root = document.documentElement;
            const tick = (now: number) => {
                raf = requestAnimationFrame(tick);
                const dt = Math.min(0.1, (now - last) / 1000);
                last = now;
                if (document.hidden || root.hasAttribute("data-drag-active")) return;
                acc += dt;
                if (acc < FRAME) return; // 초당 30장까지만
                // 사이드바 폭은 끌어서 바뀌고 화면을 옮기면 사라지기도 한다 — 가끔 다시 잰다
                if (now - measured > 1500) { measured = now; sky.setLeft(skyLeft()); }
                sky.frame(acc * speed, full ? parallax.read() : STILL, 1);
                acc = 0;
            };
            if (motion !== "off") raf = requestAnimationFrame(tick);

            cleanup = () => {
                cancelAnimationFrame(raf);
                clearTimeout(maskTimer);
                clearInterval(periodic);
                clearInterval(refresh);
                mo.disconnect();
                window.removeEventListener("scroll", onScroll, { capture: true });
                window.removeEventListener("resize", fit);
                window.removeEventListener("pointerdown", onDown);
                window.removeEventListener("pointerup", onUp);
                window.removeEventListener("pointercancel", onCancel);
                stopParallax();
                sky.dispose();
                renderer.dispose();
            };
        })().catch(() => failRef.current());

        return () => { disposed = true; cleanup(); };
    }, [dark, primary, motion]);

    return <S.SkyCanvas ref={ref} aria-hidden="true" />;
}
