"use client";
/**
 * 화면 효과의 무대 — 앱 맨 위에 깔린 투명 캔버스 하나 (누르는 것은 받지 않는다).
 *
 * fx.emit(…) 신호(달력 넘김·화면 옮김·할 일 끝냄·넣음·위젯 띄움·테마 바꿈)가 오면 지금 갈래의
 * 효과 모듈이 정해진 시간만 그리고, 끝나면 캔버스를 비우고 멈춘다. 평소에는 아무것도 돌지 않는다.
 * three 와 엔진·갈래 모듈은 처음 효과가 필요할 때 받는다(동적 import) — 첫 화면을 무겁게 하지 않는다.
 *
 * 그리지 않는 때: 움직임 '끄기'·OS 의 동작 줄이기, 창이 숨었을 때, 데스크톱 위젯 창(투명 창이라 깜빡인다 — 1.2.0).
 * '잔잔하게'면 입자를 줄이고, 자주 일어나는 화면 옮김에는 그리지 않는다.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "styled-components";
import { fx, type FxEvent } from "@/lib/fx";
import { usePickTheme } from "@/styles/themed";
import useThemeMotion from "@/hooks/useThemeMotion";
import type { FxEngine, FxModule } from "./engine";
import * as S from "./FxStage.styles";

const LOADERS = {
    celestial: () => import("./celestial/celestialFx").then((m) => m.default),
    maple: () => import("./maple/mapleFx").then((m) => m.default),
    ocean: () => import("./ocean/oceanFx").then((m) => m.default),
};

/** 마지막 효과 뒤 이만큼 조용하면 GPU 자원을 돌려준다 */
const IDLE_DISPOSE_MS = 20_000;

export default function FxStage() {
    const pathname = usePathname();
    const motion = useThemeMotion();
    const load = usePickTheme(LOADERS);
    const inWidget = !!pathname?.startsWith("/widget");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FxEngine | null>(null);
    const engineLoading = useRef<Promise<FxEngine | null> | null>(null);
    const modRef = useRef<FxModule | null>(null);
    const pointer = useRef({ x: 0, y: 0, at: 0 });
    const welcome = useRef(0);
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
                    engineRef.current = new FxEngine(THREE, canvas);
                    return engineRef.current;
                } catch {
                    return null;
                }
            })().finally(() => { engineLoading.current = null; });
        }
        return engineLoading.current;
    };

    const play = async (e: FxEvent) => {
        const mod = modRef.current;
        if (!mod?.effects[e.kind]) return;
        const eng = await engine();
        if (!eng) return;
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

    // 방금 누른 자리 — 끝냄·넣음 효과를 그 자리에서 터뜨린다
    useEffect(() => {
        const on = (e: PointerEvent) => { pointer.current = { x: e.clientX, y: e.clientY, at: performance.now() }; };
        window.addEventListener("pointerdown", on, { capture: true, passive: true });
        return () => window.removeEventListener("pointerdown", on, { capture: true });
    }, []);

    // 갈래가 바뀌면 그 갈래의 모듈을 받는다. 방금 테마를 바꿔서 바뀐 것이면 새 갈래가 인사를 한다
    useEffect(() => {
        if (inWidget) return;
        let alive = true;
        modRef.current = null;
        load().then((m) => {
            if (!alive) return;
            modRef.current = m;
            if (welcome.current && performance.now() - welcome.current < 3000) {
                welcome.current = 0;
                if (motionRef.current !== "off" && !document.hidden) void play({ kind: "theme" });
            }
        }).catch(() => {});
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, inWidget]);

    // 개발 중에만: 콘솔·시험 도구에서 효과를 불러 본다.
    //   window.__fx.emit("complete")              — 지금 갈래로
    //   window.__fxTry("maple", "month-flip", {…}) — 테마를 안 바꾸고 다른 갈래의 효과를
    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;
        const w = window as unknown as { __fx?: typeof fx; __fxTry?: (family: keyof typeof LOADERS, kind: FxEvent["kind"], detail?: Omit<FxEvent, "kind">) => Promise<void> };
        w.__fx = fx;
        w.__fxTry = async (family, kind, detail = {}) => {
            const mod = await LOADERS[family]();
            const eng = await engine();
            eng?.play(mod, { kind, ...detail }, { gentle: false, dark: darkRef.current, x: window.innerWidth / 2, y: window.innerHeight / 2 });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (inWidget) return;
        return fx.on((e) => {
            if (motionRef.current === "off" || document.hidden) return;
            // 테마를 바꾸면 새 갈래의 모듈이 들어온 뒤에 인사한다
            if (e.kind === "theme") { welcome.current = performance.now(); return; }
            if (motionRef.current === "gentle" && e.kind === "page") return;
            void play(e);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inWidget]);

    // 화면을 옮김 (처음 뜰 때는 빼고)
    const firstPath = useRef(true);
    useEffect(() => {
        if (firstPath.current) { firstPath.current = false; return; }
        fx.emit("page");
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
