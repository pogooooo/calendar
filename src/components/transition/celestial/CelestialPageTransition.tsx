"use client";
import { useEffect, useRef, type ReactNode } from 'react';
import * as S from './CelestialPageTransition.styles';
import useThemeMotion from '@/hooks/useThemeMotion';

/** A non-blocking reading entrance; static tarot artwork stays with the page. */
export default function CelestialPageTransition({ children }: { children: ReactNode; direction?: number }) {
    const ref=useRef<HTMLDivElement>(null);
    const level=useThemeMotion();
    useEffect(()=>{
        if(level==='off'||!ref.current)return;
        const a=ref.current.animate(level==='gentle'?[{opacity:.75},{opacity:1}]:[{opacity:.45,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:level==='gentle'?120:240,easing:'cubic-bezier(.16,1,.3,1)'});
        return()=>a.cancel();
    },[level]);
    return <S.Stage><S.Body ref={ref}>{children}</S.Body></S.Stage>;
}
