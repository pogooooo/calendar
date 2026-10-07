/**
 * 물 위에 뜨는 큰 유리 구슬의 자리 — 화면(로그인 머리 등)이 빈 요소 하나를 맡기면, 바다의 물 렌더러(OceanCaustics)가
 * 그 요소가 놓인 자리·크기에 액체 유리 구슬을 그린다. 구슬은 물과 같은 캔버스에 그려져 진짜 물빛을 굴절하고,
 * 상표 글자는 그 위의 DOM 이라 또렷하게 남는다. WebGL 이 없으면 아무것도 그려지지 않는다(빈 요소만 남는다).
 *
 *   const spot = oceanHero.add(el);   …   oceanHero.setBusy(spot, true);   …   oceanHero.remove(spot);
 * 화면에서는 useOceanHeroSpot(ref, busy) 하나로 — 붙일 때 맡기고 뗄 때 거둔다.
 */
import { useEffect, useRef, type RefObject } from "react";

export interface OceanHeroSpot {
    el: HTMLElement;
    /** 기다리는 중 — 구슬의 테가 더 빨리 일렁인다 */
    busy: boolean;
    /** 맡긴 때(performance.now) — 구슬이 맺히는 움직임의 시작 */
    since: number;
}

const spots = new Set<OceanHeroSpot>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export const oceanHero = {
    add(el: HTMLElement): OceanHeroSpot {
        const spot = { el, busy: false, since: performance.now() };
        spots.add(spot);
        notify();
        return spot;
    },
    remove(spot: OceanHeroSpot) {
        spots.delete(spot);
        notify();
    },
    setBusy(spot: OceanHeroSpot, busy: boolean) {
        if (spot.busy === busy) return;
        spot.busy = busy;
        notify();
    },
    /** 자리가 바뀌었을 수 있다(글꼴이 늦게 들어와 상표가 움직였다 등) — 멈춘 그림('끄기')을 다시 그리게 */
    touch: notify,
    get spots(): ReadonlySet<OceanHeroSpot> { return spots; },
    subscribe(fn: () => void) {
        listeners.add(fn);
        return () => { listeners.delete(fn); };
    },
};

/** 빈 요소(ref)를 큰 구슬 자리로 맡긴다. 글꼴이 늦게 들어와 자리가 바뀌면 멈춘 그림('끄기')도 다시 그리게 알린다 */
export function useOceanHeroSpot(ref: RefObject<HTMLElement | null>, busy = false) {
    const spotRef = useRef<OceanHeroSpot | null>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const spot = oceanHero.add(el);
        spotRef.current = spot;
        document.fonts?.ready.then(() => oceanHero.touch()).catch(() => {});
        return () => { oceanHero.remove(spot); spotRef.current = null; };
    }, [ref]);
    useEffect(() => {
        if (spotRef.current) oceanHero.setBusy(spotRef.current, busy);
    }, [busy]);
}
