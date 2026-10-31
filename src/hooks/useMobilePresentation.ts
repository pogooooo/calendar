"use client";
import usePresentation from './usePresentation';
export default function useMobilePresentation() {
    return usePresentation() === 'mobile-app';
}
