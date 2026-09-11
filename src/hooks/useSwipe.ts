"use client";

import * as React from "react";

interface SwipeOptions {
    /** 이만큼은 가로로 움직여야 넘김으로 친다 (px) */
    threshold?: number;
    /** 세로로 이만큼 이상 흔들리면 스크롤로 보고 무시한다 (px) */
    slop?: number;
}

/**
 * 좌우로 쓸어 넘기기.
 *
 * 손가락만 본다 (Touch Events). 마우스에서는 아무 일도 일어나지 않으므로
 * 데스크톱 동작은 그대로다.
 *
 * 가로로 굴러가는 칸(달력 안의 가로 스크롤 목록 등) 위에서 시작한 손짓은
 * 그쪽 몫이므로 넘기지 않는다.
 */
export default function useSwipe(
    onLeft: () => void,
    onRight: () => void,
    { threshold = 60, slop = 45 }: SwipeOptions = {},
) {
    const start = React.useRef<{ x: number; y: number; live: boolean } | null>(null);

    const onTouchStart = React.useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 1) { start.current = null; return; }

        // 손이 닿은 자리 위쪽에 가로 스크롤이 있으면 그 스크롤이 먼저다.
        let node = e.target as HTMLElement | null;
        while (node && node !== e.currentTarget) {
            if (node.scrollWidth > node.clientWidth + 1) { start.current = null; return; }
            node = node.parentElement;
        }

        const t = e.touches[0];
        start.current = { x: t.clientX, y: t.clientY, live: true };
    }, []);

    const onTouchMove = React.useCallback((e: React.TouchEvent) => {
        const s = start.current;
        if (!s || !s.live) return;
        const t = e.touches[0];
        // 세로로 크게 움직였으면 이건 스크롤이다. 이번 손짓은 포기한다.
        if (Math.abs(t.clientY - s.y) > slop && Math.abs(t.clientY - s.y) > Math.abs(t.clientX - s.x)) {
            s.live = false;
        }
    }, [slop]);

    const onTouchEnd = React.useCallback((e: React.TouchEvent) => {
        const s = start.current;
        start.current = null;
        if (!s || !s.live) return;

        const t = e.changedTouches[0];
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return;

        if (dx < 0) onLeft();
        else onRight();
    }, [onLeft, onRight, threshold]);

    return { onTouchStart, onTouchMove, onTouchEnd };
}
