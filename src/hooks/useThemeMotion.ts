"use client";
import { useReducedMotion } from 'framer-motion';
import useSettingStore from '@/store/useSettingStore';

/** JavaScript animations share the same preference as decorative CSS. */
export default function useThemeMotion() {
    const motion = useSettingStore(s=>s.motion);
    const reduced = useReducedMotion();
    return reduced ? 'off' : motion;
}
