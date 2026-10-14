"use client";

import * as React from "react";
import { PresenceContext, usePresence } from "framer-motion";
import useThemeMotion from "@/hooks/useThemeMotion";
import { startOnNextFrame, useMotionSet } from "@/hooks/useMotion";
import { isWidgetWindow } from "@/hooks/useAuthFetch";
import { enterFrames, exitFrames, optionsOf, type Axis, type Dir, type SwapSize } from "@/styles/motion";

export interface SwapLayerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** 오는 쪽 — 1: 다음(오른쪽·아래에서), -1: 이전 */
    direction: number;
    axis?: Axis;
    size?: SwapSize;
}

/**
 * AnimatePresence(mode="popLayout") 안에서 갈리는 한 판 — 월간 격자처럼 옛 내용을 남겨 두고 새 내용과 엇갈리는 곳.
 * 새 판은 오는 쪽에서 들어오고(갈래의 swapIn), 옛 판은 반대쪽으로 나간다(swapOut). 차례는 AnimatePresence 의 custom 을 따른다.
 *
 * framer 의 motion.div 대신 element.animate 로 그린다 — framer 는 투명도·흐림을 WAAPI 로 돌리고 끝난 값을 다음 그림에 적어서,
 * 미끄러짐이 먼저 끝나면 한 장면 동안 처음 모습(투명·흐림)이 비쳤다. 여기서는 끝나면 아무것도 남기지 않는다.
 * 처음 그린 판(AnimatePresence initial={false})과 움직임을 끈 사람에게는 움직이지 않는다.
 */
const SwapLayer = React.forwardRef<HTMLDivElement, SwapLayerProps>(function SwapLayer({ direction: dir, axis = "x", size = "page", ...rest }, ref) {
    const presence = React.useContext(PresenceContext);
    const [isPresent, safeToRemove] = usePresence();
    // framer 가 다시 그릴 때마다 새로 주는 손잡이 — 나가는 몸짓이 그 때문에 처음부터 다시 돌지 않게 ref 로 든다
    const removeRef = React.useRef(safeToRemove);
    removeRef.current = safeToRemove;
    const level = useThemeMotion();
    const set = useMotionSet();
    const node = React.useRef<HTMLDivElement | null>(null);
    const setNode = React.useCallback((el: HTMLDivElement | null) => {
        node.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
    }, [ref]);
    // 나갈 때의 차례는 그때의 custom (마지막으로 누른 쪽)
    const exitDir: Dir = ((presence?.custom as number | undefined) ?? dir) < 0 ? -1 : 1;
    const live = React.useRef({ level, set, dir, exitDir, axis, size, skip: presence?.initial === false });
    live.current = { ...live.current, level, set, dir, exitDir, axis, size };

    React.useLayoutEffect(() => {
        const { level, set, dir, axis, size, skip } = live.current;
        const el = node.current;
        if (skip || level === "off" || !el) return;
        const extent = axis === "x" ? el.getBoundingClientRect().width : el.getBoundingClientRect().height;
        const step = set.swapIn({ dir: dir < 0 ? -1 : 1, axis, level, size, widget: isWidgetWindow(), extent });
        if (!step) return;
        const a = startOnNextFrame(el.animate(enterFrames(step.pose), optionsOf(step)));
        return () => a.cancel();
    }, []);

    React.useLayoutEffect(() => {
        const el = node.current;
        if (isPresent || !el) return;
        const { level, set, exitDir, axis, size } = live.current;
        const box = el.getBoundingClientRect();
        const step = level === "off" ? null : set.swapOut({ dir: exitDir, axis, level, size, widget: isWidgetWindow(), extent: axis === "x" ? box.width : box.height });
        if (!step) { removeRef.current?.(); return; }
        // 나가는 판은 누를 수도 초점이 갈 수도 없게 — 새 판과 겹쳐 있는 동안 옛 칸이 눌리지 않도록
        el.style.pointerEvents = "none";
        el.setAttribute("aria-hidden", "true");
        el.setAttribute("inert", "");
        const a = startOnNextFrame(el.animate(exitFrames(step.pose), { ...optionsOf(step), fill: "forwards" }));
        let done = false;
        const finish = () => { if (!done) { done = true; removeRef.current?.(); } };
        a.onfinish = finish;
        const t = window.setTimeout(finish, step.duration + 400);
        return () => {
            window.clearTimeout(t);
            // 나가던 판이 도로 들어오면(같은 달로 곧장 되돌아옴) 나가던 모습을 지우고 다시 누를 수 있게
            if (!done) {
                a.onfinish = null;
                a.cancel();
                el.style.pointerEvents = "";
                el.removeAttribute("aria-hidden");
                el.removeAttribute("inert");
            }
        };
    }, [isPresent]);

    return <div ref={setNode} {...rest} />;
});

export default SwapLayer;
