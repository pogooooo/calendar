"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import useThemeMotion from '@/hooks/useThemeMotion';
import type { Dir } from '@/styles/motion';
import * as S from './GemPageTransition.styles';

let hasNavigated = false;

/** A transparent refraction crosses the new view; the page stays immediately interactive. */
export default function GemPageTransition({ children, direction = 1 }: { children: ReactNode; direction?: Dir }) {
    const motion = useThemeMotion();
    const body = useRef<HTMLDivElement>(null);
    const animation = useRef<Animation | null>(null);
    const first = useRef<boolean | null>(null);
    const [overlay, setOverlay] = useState(false);

    useEffect(() => {
        // Decide after hydration: module state must never change the server-rendered markup.
        first.current ??= !hasNavigated;
        hasNavigated = true;
        if (first.current || motion === 'off') return;
        setOverlay(motion === 'full');
        animation.current = body.current?.animate(motion === 'gentle'
            ? [{ opacity: .7 }, { opacity: 1 }]
            : [{ opacity: .55, translate: `${direction * 9}px 0`, filter: 'brightness(1.08)' }, { opacity: 1, translate: '0 0', filter: 'brightness(1)' }],
        { duration: motion === 'gentle' ? 180 : 460, easing: 'cubic-bezier(.19, 1, .26, 1)' }) ?? null;
        const timer = window.setTimeout(() => setOverlay(false), 850);
        return () => { window.clearTimeout(timer); animation.current?.cancel(); };
        // An entrance belongs to this route mount, not to subsequent preference changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (motion !== 'off') return;
        animation.current?.cancel(); setOverlay(false);
    }, [motion]);

    return <S.Stage>
        <S.Body ref={body}>{children}</S.Body>
        {overlay && motion === 'full' && <S.Overlay $dir={direction} aria-hidden="true" data-page-transition-overlay>
            <span className="refraction" /><span className="gold-edge" />
        </S.Overlay>}
    </S.Stage>;
}
