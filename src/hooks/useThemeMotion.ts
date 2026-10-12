"use client";
import { useSyncExternalStore } from 'react';
import useSettingStore from '@/store/useSettingStore';

const QUERY = '(prefers-reduced-motion: reduce)';
let media: MediaQueryList | null = null;
const query = () => (media ??= window.matchMedia(QUERY));
const subscribe = (onChange: () => void) => {
    const mq = query();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
};
const reducedNow = () => query().matches;
const reducedOnServer = () => false;

/** 기기의 '동작 줄이기'(Windows 의 애니메이션 효과 끄기·안드로이드의 애니메이션 삭제) — 켜져 있으면 앱의 움직임 설정과 상관없이 모두 멈춘다 */
export function useOsReducedMotion() {
    return useSyncExternalStore(subscribe, reducedNow, reducedOnServer);
}

/** 기기의 동작 줄이기를 따라 멈추는 중인가 — 설정에서 '그래도 움직이기'를 켰으면 따르지 않는다 */
export function useMotionHeldByOs() {
    const overOs = useSettingStore(s => s.motionOverOs);
    return useOsReducedMotion() && !overOs;
}

/**
 * JavaScript animations share the same preference as decorative CSS.
 * OS 의 '동작 줄이기'를 켜고 끄는 것도 곧바로 따른다 — framer 의 useReducedMotion 은 처음 값에 멈춰 있어서,
 * CSS(data-theme-motion)는 멈췄는데 three.js 장면(물·잎·표본·오브제·효과)은 계속 돌았다.
 */
export default function useThemeMotion() {
    const motion = useSettingStore(s=>s.motion);
    const held = useMotionHeldByOs();
    return held ? 'off' : motion;
}
