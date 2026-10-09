"use client";
/**
 * Maple 의 표본 한 장(three.js 장면은 specimenScene) — 로그인 옆 그림판과 내려받기 화면의 큰 그림이 쓴다.
 * 준비되면 서서히 드러나고(onState "three"), WebGL·그림이 없으면 "flat" 을 알려 부르는 쪽이 예전 그림을 그린다.
 * 장면은 캔버스가 처음 화면에 보일 때 만든다 — 폰처럼 그림판을 숨긴(display:none) 곳에서는 WebGL 을 아예 열지 않는다.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import type { SpecimenVariant } from "./specimenScene";
import * as S from "./MapleSpecimen.styles";

export type SpecimenState = "pending" | "three" | "flat";

interface Props {
    variant: SpecimenVariant;
    busy?: boolean;
    /** 카드가 덮지 말아야 할 것(로그인 옆 상표 묶음) */
    avoidRef?: RefObject<HTMLElement | null>;
    onState?: (state: SpecimenState) => void;
}

export default function MapleSpecimen({ variant, busy = false, avoidRef, onState }: Props) {
    const ref = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const [state, setState] = useState<SpecimenState>("pending");
    const sceneRef = useRef<{ setBusy(b: boolean): void; dispose(): void } | null>(null);
    const busyRef = useRef(busy);
    busyRef.current = busy;
    const dark = theme.mode === "dark";
    const { text: ink, accent, background: paper } = theme.colors;

    useEffect(() => { onState?.(state); }, [state, onState]);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        let disposed = false;
        const start = async () => {
            try {
                const [THREE, { createSpecimenScene }] = await Promise.all([import("three"), import("./specimenScene")]);
                if (disposed) return;
                // 그림을 못 읽으면 예전 그림으로 물러나면서 장면도 바로 치운다 — 예전엔 화면을 떠날 때까지 관찰자·기울기 듣기·GPU 맥락이 남았다
                let failed = false;
                const fail = () => {
                    failed = true;
                    sceneRef.current?.dispose();
                    sceneRef.current = null;
                    if (!disposed) setState("flat");
                };
                const scene = createSpecimenScene(THREE, canvas, {
                    variant, dark, motion, colors: { ink, accent, paper },
                    avoid: () => avoidRef?.current ?? null,
                    onReady: () => { if (!disposed) setState("three"); },
                    onFail: fail,
                });
                if (failed) { scene.dispose(); return; }
                sceneRef.current = scene;
                scene.setBusy(busyRef.current);
            } catch {
                if (!disposed) setState("flat"); // WebGL 이 없다 — 예전 그림으로
            }
        };
        const io = new IntersectionObserver((entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            io.disconnect();
            void start();
        });
        io.observe(canvas);
        return () => {
            disposed = true;
            io.disconnect();
            sceneRef.current?.dispose();
            sceneRef.current = null;
        };
    }, [variant, dark, motion, ink, accent, paper, avoidRef]);

    useEffect(() => { sceneRef.current?.setBusy(busy); }, [busy]);

    if (state === "flat") return null;
    return <S.Canvas ref={ref} aria-hidden="true" data-on={state === "three" ? "" : undefined} data-variant={variant} />;
}
