"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'styled-components';
import useThemeMotion from '@/hooks/useThemeMotion';
import { FacetedGem } from '@/components/ornament/gem/GemOrnaments';
import { createMineral } from './mineral';
import type { GemSceneController } from './gemScene';
import * as S from './GemAtmosphere.styles';

/** Mineral satin and a single piece of jewelry, kept at the outside edge of the calendar. */
export default function GemAtmosphere() {
    const theme = useTheme();
    const motion = useThemeMotion();
    const mineralRef = useRef<HTMLCanvasElement>(null);
    const jewelRef = useRef<HTMLCanvasElement>(null);
    const [flat, setFlat] = useState(false);
    const sceneRef = useRef<GemSceneController | null>(null);
    const color = theme.gemColor ?? theme.colors.primary;
    const gold = theme.colors.accent;
    const dark = theme.mode === 'dark';
    const presentation = useRef({ color, gold, dark, motion });
    presentation.current = { color, gold, dark, motion };

    useEffect(() => {
        const canvas = mineralRef.current;
        if (!canvas) return;
        return createMineral(canvas, { color, gold, dark });
    }, [color, gold, dark]);

    useEffect(() => {
        const canvas = jewelRef.current;
        if (!canvas || flat) return;
        let cancelled = false;
        let scene: GemSceneController | null = null;
        import('./gemScene').then(({ createGemScene }) => {
            if (cancelled) return;
            scene = createGemScene(canvas, { ...presentation.current, onFail: () => { if (!cancelled) setFlat(true); } });
            sceneRef.current = scene;
        }).catch(() => { if (!cancelled) setFlat(true); });
        return () => { cancelled = true; scene?.dispose(); if (sceneRef.current === scene) sceneRef.current = null; };
    }, [flat]);

    useEffect(() => { sceneRef.current?.update({ color, gold, dark, motion }); }, [color, gold, dark, motion]);

    return <S.Atelier aria-hidden="true" data-ambient="gem">
        <canvas className="mineral" ref={mineralRef} />
        <span className="light" />
        <div className="jewel">
            {flat ? <svg className="fallback" viewBox="0 0 100 140"><FacetedGem cx={50} cy={70} r={36} /></svg> : <canvas ref={jewelRef} />}
        </div>
    </S.Atelier>;
}
