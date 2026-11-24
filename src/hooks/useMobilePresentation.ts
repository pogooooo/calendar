"use client";
import usePresentation from './usePresentation';
import useSettingStore from "@/store/useSettingStore";

export default function useMobilePresentation() {
    return usePresentation() === 'mobile-app';
}

/** Visual policy only. Touch gestures, keyboard insets and widgets use the actual platform. */
export function useSimpleMobileAppearance() {
    const mobile = useMobilePresentation();
    const appearance = useSettingStore(s => s.mobileAppearance);
    return mobile && appearance !== "rich";
}
