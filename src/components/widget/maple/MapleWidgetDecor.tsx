"use client";
/**
 * Maple 위젯의 바탕 무늬 — 단풍 그늘: 위젯 위로 단풍나무가 드리워 있다고 치고, 그 잎을 지나온 햇빛이 종이에 떨어진 모습
 * (paintDapple — 흐린 단풍잎 꼴의 물든 빛과 옅은 그늘, 해와 나무는 오른쪽 위), 위쪽에서 비치는 따뜻한 빛 한 겹.
 * 또렷한 잎은 판 위에 두지 않는다 — 글은 늘 평평한 종이 위에서 읽힌다. 단풍의 표식은 머리 줄의 손잡이(수채 단풍잎 하나)가 맡는다.
 * (사용자: "다른 위젯에서도 테마의 느낌이 잘 보이게 — 오션처럼 물결이 보인다던가" · "위젯의 단풍이 내용을 가리는데 다른 디자인으로")
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 위젯에 들어올 때만 2초쯤, 위의 가지가
 * 흔들린 듯 그늘이 잎마다 조금씩 늦게 일렁였다 잦아들고, 나무 쪽에서 잎 몇 장이 한 번 진다(playLeafFall — 3초쯤 내용 위를 지나
 * 간다). 움직임 '끄기'면 일렁이지도 지지도 않는다.
 * 칸이 판을 채우는 위젯(달력·주간, busy)에서는 더 옅게.
 * 2026-10-15: 수채 잎 그림·먹 카드 테·수채 가지 그림 → 벡터 잎 → 다시 수채 잎 가지(코드로 엮은 것)로.
 * 2026-10-16: 오른쪽 아래의 수채 가지가 기념일·마감·달력 날짜를 덮어 단풍 그늘로 바꿨다.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "styled-components";
import * as S from "./MapleWidgetDecor.styles";
import useThemeMotion from "@/hooks/useThemeMotion";
import { loadCanopyLeaves, paintDapple, playLeafFall, type LeafImage } from "@/components/ambient/maple/canopyPaint";
import type { WidgetKind } from "@/store/useWidgetStore";

/** 흔들림이 잦아드는 데 걸리는 시간(초) */
const SWAY_SECONDS = 2;
/** 잎이 다 떨어진 뒤 다시 질 수 있을 때까지(ms) — 커서가 들락거릴 때마다 쏟아지지 않게 */
const FALL_REST_MS = 2500;

export default function MapleWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dark = useTheme().mode === "dark";
    const motion = useThemeMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let disposed = false;
        let imgs: LeafImage[] | null = null;
        let raf = 0;
        let start = 0;
        const draw = (sway?: number) => {
            if (!imgs || disposed) return;
            const box = canvas.getBoundingClientRect();
            if (box.width < 2 || box.height < 2) return;
            paintDapple(canvas, imgs, { width: box.width, height: box.height, dpr: Math.min(2, window.devicePixelRatio || 1), dark, busy, seed: kind, sway });
            canvas.dataset.ready = "";
        };
        loadCanopyLeaves().then((l) => { imgs = l; draw(); }).catch(() => {});
        // 위젯 창 크기를 바꾸면 다시 그린다 (끌어 늘이는 동안은 마지막에 한 번)
        let timer = 0;
        const ro = new ResizeObserver(() => { window.clearTimeout(timer); timer = window.setTimeout(() => { if (!raf) draw(); }, 160); });
        ro.observe(canvas);

        // 커서가 들어오면 한 번 — 2초 동안만 다시 그리고 멈춘 그림으로 돌아간다
        const frame = (now: number) => {
            const t = (now - start) / 1000;
            if (t >= SWAY_SECONDS) { raf = 0; draw(); return; }
            draw(t);
            raf = requestAnimationFrame(frame);
        };
        const host = ref.current?.closest<HTMLElement>("[data-widget]") ?? ref.current?.parentElement;
        const play = () => {
            if (motion === "off" || !imgs) return;
            start = performance.now();
            if (!raf) raf = requestAnimationFrame(frame);
        };
        host?.addEventListener("pointerenter", play);
        return () => {
            disposed = true;
            ro.disconnect();
            window.clearTimeout(timer);
            cancelAnimationFrame(raf);
            host?.removeEventListener("pointerenter", play);
        };
    }, [dark, busy, kind, motion]);

    // 낙엽 — 커서가 들어오면 나무 쪽에서 잎 몇 장이 한 번 진다. 내용 위로 지나가야 해서 판 밖(문서 맨 위)에 잠깐 캔버스를 띄운다
    const [falling, setFalling] = useState(false);
    const fallRef = useRef<HTMLCanvasElement>(null);
    const fallEnded = useRef(0);
    useEffect(() => {
        const host = ref.current?.closest<HTMLElement>("[data-widget]") ?? ref.current?.parentElement;
        if (!host || motion === "off") return;
        const onEnter = () => { if (performance.now() - fallEnded.current > FALL_REST_MS) setFalling(true); };
        host.addEventListener("pointerenter", onEnter);
        return () => host.removeEventListener("pointerenter", onEnter);
    }, [motion]);
    useEffect(() => {
        const canvas = fallRef.current;
        if (!falling || !canvas) return;
        let disposed = false;
        let stop = () => {};
        const done = () => { fallEnded.current = performance.now(); setFalling(false); };
        loadCanopyLeaves().then((imgs) => {
            if (disposed) return;
            const box = canvas.getBoundingClientRect();
            stop = playLeafFall(canvas, imgs, { width: box.width, height: box.height, dpr: Math.min(2, window.devicePixelRatio || 1), dark, gentle: motion === "gentle", onDone: done });
        }).catch(done);
        return () => { disposed = true; stop(); };
    }, [falling, dark, motion]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor" data-busy={busy || undefined}>
            <span className="light" />
            <canvas ref={canvasRef} className="twig" />
            {falling && createPortal(<S.Fall ref={fallRef} aria-hidden="true" />, document.body)}
        </S.Decor>
    );
}
