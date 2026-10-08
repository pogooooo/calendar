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

/**
 * JavaScript animations share the same preference as decorative CSS.
 * OS 의 '동작 줄이기'를 켜고 끄는 것도 곧바로 따른다 — framer 의 useReducedMotion 은 처음 값에 멈춰 있어서,
 * CSS(data-theme-motion)는 멈췄는데 three.js 장면(물·잎·표본·오브제·효과)은 계속 돌았다.
 */
export default function useThemeMotion() {
    const motion = useSettingStore(s=>s.motion);
    const reduced = useSyncExternalStore(subscribe, reducedNow, reducedOnServer);
    return reduced ? 'off' : motion;
}
