"use client";

import * as GemS from "./gem/GemWidgetShell.styles";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ThemeProvider, useTheme } from "styled-components";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialWidgetShell.styles";
import * as MapleS from "./maple/MapleWidgetShell.styles";
import { GLASS_MARGIN } from "./celestial/CelestialWidgetShell.styles";
import useWidgetStore from "@/store/useWidgetStore";
import { useT } from "@/i18n/useT";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow, currentMonitor } from "@tauri-apps/api/window";
import { Settings2, Lock, X } from "lucide-react";

import type { WidgetKind } from "@/store/useWidgetStore";
import { mirrorWidgetStateToFile } from "@/lib/widgetStateFile";
import * as OceanS from './ocean/OceanWidgetShell.styles';
import WidgetCharm from './WidgetCharm';
import WidgetDecor from './WidgetDecor';
import WidgetAppearanceSettings from './WidgetAppearanceSettings';
import {MotionRules,Overlay} from './WidgetAppearance.styles';
import {WidgetMotionContext} from './WidgetMotionContext';
import useThemeMotion from '@/hooks/useThemeMotion';
import {normalizeWidgetAppearance,resolveWidgetEffect} from '@/lib/widgetAppearance';
import {normalizeWidgetBackground,widgetBackgroundStyle} from '@/lib/widgetBackground';
import { gemWidgetColors } from '@/styles/gem/palette';

interface Props {
    kind: WidgetKind;
    title: string;
    children: React.ReactNode;
}

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function startDrag() {
    if (!isTauri()) return;
    try {
        const win = getCurrentWindow();
        await win.startDragging();
    } catch {}
}

async function closeWindow() {
    if (!isTauri()) { window.close(); return; }
    try {
        const win = getCurrentWindow();
        await win.close();
    } catch {
        window.close();
    }
}

async function applyPriority(kind: string, priority: string) {
    if (!isTauri()) return;
    try {
        await invoke("set_widget_priority", { kind, priority });
    } catch {}
}

async function applyLocked(kind: string, locked: boolean) {
    if (!isTauri()) return;
    try {
        await invoke("set_widget_locked", { kind, locked });
    } catch {}
}

function getLuminance(hex: string): number {
    const h = hex.replace("#", "").padEnd(6, "0");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const toLinear = (c: number) =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };
const CONTRAST_PALETTES: ThemeImpls<typeof gemWidgetColors | null> = {
    celestial: null, maple: null, ocean: null, gem: gemWidgetColors,
};

export default function WidgetShell({ kind, title, children }: Props) {
    const S = usePickTheme(STYLES);
    const contrastPalette = usePickTheme(CONTRAST_PALETTES);
    const theme = useTheme();
    const t = useT();
    const savedBg = useWidgetStore((s) => s[kind].bg);
    const bg = useMemo(()=>normalizeWidgetBackground(savedBg),[savedBg]);
    const savedAppearance=useWidgetStore(s=>s[kind].appearance);
    const appearance=normalizeWidgetAppearance(savedAppearance);
    const appMotion=useThemeMotion();
    const widgetMotion=resolveWidgetEffect(appMotion,appearance.effect);
    const settingsButton=useRef<HTMLButtonElement>(null);
    const settingsPane=useRef<HTMLDivElement>(null);

    const [showSettings, setShowSettings] = useState(false);
    const [locked, setLocked] = useState(false);
    const [wallpaper, setWallpaper] = useState({ url: "", mw: 1920, mh: 1080 });
    // 벽지를 읽어 정한 글자색. 아직 못 읽었으면 null 이고, 그때는 아래 baseline 을 쓴다.
    const [dynamicTextColor, setDynamicTextColor] = useState<{ text: string; textSecondary: string } | null>(null);
    const [sampledLuminance, setSampledLuminance] = useState<number | null>(null);
    const sampledLuminanceRef = useRef<number | null>(null);
    const hasContrastPaletteRef = useRef(!!contrastPalette);

    const monitorRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const textColorRef = useRef("#ffffff");

    React.useEffect(() => {
        if (!isTauri()) return;

        try { localStorage.setItem(`cronos-widget-open:${kind}`, "1"); } catch {}
        mirrorWidgetStateToFile();

        const win = getCurrentWindow();
        let timer: number | undefined;

        const save = async () => {
            try {
                const sf = await win.scaleFactor();
                const pos = await win.outerPosition();
                const size = await win.innerSize();
                localStorage.setItem(`cronos-widget-bounds:${kind}`, JSON.stringify({
                    x: pos.x / sf,
                    y: pos.y / sf,
                    w: size.width / sf,
                    h: size.height / sf,
                }));
                mirrorWidgetStateToFile();
            } catch {}
        };

        const schedule = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(save, 400);
        };

        const unMoved = win.onMoved(schedule);
        const unResized = win.onResized(schedule);

        return () => {
            unMoved.then(f => f()).catch(() => {});
            unResized.then(f => f()).catch(() => {});
            window.clearTimeout(timer);
        };
    }, [kind]);
    const surfaceColor = theme?.colors?.surface;
    // "테마 바탕"은 그 테마의 카드색(surface). 예전의 Maple 은 종이결 그림을 깔았다(2026-10-15 걷었다)
    const bgStyle = widgetBackgroundStyle(bg, surfaceColor);

    const bgRef = useRef(bg);
    const surfaceColorRef = useRef(surfaceColor);

    useEffect(() => {
        bgRef.current = bg;
        surfaceColorRef.current = surfaceColor;
        sampledLuminanceRef.current = null;
        setSampledLuminance(null);
    }, [bg, surfaceColor]);

    useEffect(() => { hasContrastPaletteRef.current = !!contrastPalette; }, [contrastPalette]);

    /**
     * 벽지를 아직 못 읽었을 때(브라우저·첫 프레임·벽지 읽기 실패) 쓰는 글자색.
     *
     * 예전에는 흰색으로 시작해서, 밝은 테마 위젯이 흰 바탕에 흰 글씨로 떴다.
     * 바탕색만으로도 밝고 어두움은 알 수 있으니 그걸로 먼저 정하고,
     * 벽지를 읽고 나면 그 값으로 바꾼다. 유리 모드는 벽지를 모르면 테마 글자색을 둔다.
     */
    const baselineTextColor = useMemo(() => {
        const lum = bg.mode === "custom" ? getLuminance(bg.customColor)
            : bg.mode === "theme" ? getLuminance(surfaceColor || "#ffffff")
            : null;
        if (lum === null) return {};
        return lum > 0.179
            ? { text: "#1a1a1a", textSecondary: "#555555" }
            : { text: "#ffffff", textSecondary: "#dddddd" };
    }, [bg.mode, bg.customColor, surfaceColor]);

    const widgetTheme = useMemo(() => {
        const contrastColors = bg.autoTextColor && contrastPalette
            ? contrastPalette(theme, bg.mode === 'custom' ? bg.customColor : surfaceColor, sampledLuminance)
            : {};
        return {
            ...theme,
            colors: {
                ...theme?.colors,
                ...(bg.autoTextColor ? (dynamicTextColor ?? baselineTextColor) : {}),
                ...contrastColors,
                surface: "transparent",
            },
            // 모달처럼 불투명해야 하는 요소가 되돌려 쓸 원본 색상
            baseColors: theme?.colors,
        };
    }, [theme, contrastPalette, bg.autoTextColor, bg.mode, bg.customColor, surfaceColor, sampledLuminance, dynamicTextColor, baselineTextColor]);

    const handleLock = useCallback(() => {
        setLocked(true);
        setShowSettings(false);
        applyLocked(kind, true);
    }, [kind]);

    const handleUnlock = useCallback(() => {
        setLocked(false);
        applyLocked(kind, false);
    }, [kind]);

    useEffect(() => {
        applyPriority(kind, "bottom");
    }, [kind]);

    useEffect(() => {
        let cancelled = false;
        let rafId = 0;
        let timerId = 0;
        let wallTimer = 0;
        let onFocus: (() => void) | undefined;
        let unlistenMove: (() => void) | undefined;

        async function setupWallpaperSync() {
            if (!isTauri()) return;

            try {
                const path = await invoke<string>("get_wallpaper_path");
                if (!path) return;

                let wallPath = path;
                let assetUrl = convertFileSrc(path);
                const img = new Image();
                img.crossOrigin = "anonymous";
                let objUrl = "";
                // 벽지를 읽어 들인다 — 켤 때, 그리고 벽지가 바뀌었을 때(슬라이드 쇼·바꿈). 예전엔 켤 때 한 번뿐이라 바뀐 벽지와 어긋났다
                const loadImage = async () => {
                    let next = assetUrl;
                    try {
                        const res = await fetch(assetUrl);
                        next = URL.createObjectURL(await res.blob());
                    } catch {}
                    if (objUrl) URL.revokeObjectURL(objUrl);
                    objUrl = next.startsWith("blob:") ? next : "";
                    img.src = next;
                    await new Promise(r => { img.onload = r; img.onerror = r; });
                };
                await loadImage();

                const win = getCurrentWindow();
                let mx = 0, my = 0, mw = 1920, mh = 1080, sf = 1;
                let baseOffsetX = 0, baseOffsetY = 0;

                const updateMonitor = async () => {
                    const monitor = await currentMonitor();
                    sf = monitor?.scaleFactor ?? window.devicePixelRatio ?? 1;
                    mw = (monitor?.size.width ?? 1920) / sf;
                    mh = (monitor?.size.height ?? 1080) / sf;
                    mx = (monitor?.position.x ?? 0) / sf;
                    my = (monitor?.position.y ?? 0) / sf;
                    setWallpaper({ url: assetUrl, mw, mh });
                };

                const refreshWallpaper = async () => {
                    if (cancelled) return;
                    try {
                        const now = await invoke<string>("get_wallpaper_path");
                        if (!now || now === wallPath) return;
                        wallPath = now;
                        assetUrl = convertFileSrc(now);
                        await loadImage();
                        setWallpaper({ url: assetUrl, mw, mh });
                    } catch {}
                };
                wallTimer = window.setInterval(refreshWallpaper, 5 * 60 * 1000);
                onFocus = () => { void refreshWallpaper(); };
                window.addEventListener("focus", onFocus);

                const syncOffset = async () => {
                    const pos = await win.outerPosition();
                    const logicalX = pos.x / sf;
                    const logicalY = pos.y / sf;
                    if (window.screenX !== 0 || window.screenY !== 0) {
                        baseOffsetX = logicalX - window.screenX;
                        baseOffsetY = logicalY - window.screenY;
                    }
                };

                await updateMonitor();
                await syncOffset();

                let lastRelX = -9999;
                let lastRelY = -9999;
                let lastLumUpdate = 0;

                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                const tick = () => {
                    if (cancelled) return;

                    const currentX = window.screenX + baseOffsetX;
                    const currentY = window.screenY + baseOffsetY;
                    const newRelX = currentX - mx;
                    const newRelY = currentY - my;
                    const curBg = bgRef.current;

                    if (curBg.mode === 'glass') {
                        if (newRelX !== lastRelX || newRelY !== lastRelY) {
                            lastRelX = newRelX;
                            lastRelY = newRelY;

                            if (monitorRef.current) {
                                monitorRef.current.style.transform = `translate(${-newRelX + GLASS_MARGIN}px, ${-newRelY + GLASS_MARGIN}px)`;
                            }
                        }
                    }

                    const now = performance.now();
                    if (now - lastLumUpdate > 150 && ctx && img.naturalWidth > 0 && curBg.autoTextColor) {
                        lastLumUpdate = now;
                        const scaleX = img.naturalWidth / mw;
                        const scaleY = img.naturalHeight / mh;
                        const srcX = Math.max(0, newRelX * scaleX);
                        const srcY = Math.max(0, newRelY * scaleY);
                        const srcW = Math.min(img.naturalWidth - srcX, window.innerWidth * scaleX);
                        const srcH = Math.min(img.naturalHeight - srcY, window.innerHeight * scaleY);

                        if (srcW > 0 && srcH > 0) {
                            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 1, 1);
                            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                            const linear = (c: number) => {
                                c /= 255;
                                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                            };
                            const lum = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

                            let effLum = 0.5;

                            if (curBg.mode === 'glass') {
                                effLum = lum;
                            } else if (curBg.mode === 'custom') {
                                const cLum = getLuminance(curBg.customColor);
                                effLum = lum * (1 - curBg.opacity) + cLum * curBg.opacity;
                            } else {
                                const sLum = getLuminance(surfaceColorRef.current);
                                effLum = lum * (1 - curBg.opacity) + sLum * curBg.opacity;
                            }

                            const newColor = effLum > 0.179 ? "#1a1a1a" : "#ffffff";

                            // Gem's colored controls follow the sampled wallpaper, too. Quantizing
                            // avoids sub-pixel color noise while a stationary widget stays idle.
                            if (hasContrastPaletteRef.current) {
                                const measured = Math.round(effLum * 1000) / 1000;
                                if (sampledLuminanceRef.current !== measured) {
                                    sampledLuminanceRef.current = measured;
                                    setSampledLuminance(measured);
                                }
                            }

                            if (textColorRef.current !== newColor) {
                                textColorRef.current = newColor;
                                setDynamicTextColor(
                                    newColor === "#1a1a1a"
                                        ? { text: "#1a1a1a", textSecondary: "#555555" }
                                        : { text: "#ffffff", textSecondary: "#dddddd" }
                                );
                            }
                        }
                    }

                    if (curBg.mode === 'glass') {
                        rafId = requestAnimationFrame(tick);
                    } else {
                        timerId = window.setTimeout(() => {
                            if (!cancelled) tick();
                        }, 200);
                    }
                };
                tick();

                unlistenMove = await win.onMoved(async ({ payload }) => {
                    // 다른 모니터로 옮겨 가면 그 모니터의 자리·크기·배율로 다시 — 예전엔 켤 때의 모니터만 알아 유리 바탕이 어긋났다
                    const x = payload.x / sf, y = payload.y / sf;
                    if (x < mx || y < my || x >= mx + mw || y >= my + mh) await updateMonitor();
                    await syncOffset();
                });
            } catch {}
        }

        setupWallpaperSync();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            clearTimeout(timerId);
            clearInterval(wallTimer);
            if (onFocus) window.removeEventListener("focus", onFocus);
            if (unlistenMove) unlistenMove();
        };
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        if (locked) {
            e.preventDefault();
            handleUnlock();
        }
    }, [locked, handleUnlock]);

    const closeSettings=useCallback(()=>{setShowSettings(false);requestAnimationFrame(()=>settingsButton.current?.focus());},[]);
    useEffect(()=>{
        if(!showSettings)return;
        settingsPane.current?.focus({preventScroll:true});
        const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();closeSettings();}};
        window.addEventListener('keydown',close);
        return()=>window.removeEventListener('keydown',close);
    },[showSettings,closeSettings]);
    return (
        <WidgetMotionContext.Provider value={appearance.effect}><MotionRules><S.Shell
            style={{background:'transparent',borderColor:'transparent',boxShadow:'none'}}
            data-widget={kind}
            data-widget-design={appearance.design}
            data-widget-motion={widgetMotion}
            $locked={locked}
            onContextMenu={handleContextMenu}
        >
            <ThemeProvider theme={widgetTheme}>
                <S.BackgroundSurface data-widget-background aria-hidden data-ornate={appearance.design==='ornate' && bg.mode==='theme'} style={bgStyle}>
                {bg.mode === "glass" && wallpaper.url && (
                    <S.FakeGlassLayer $blur={bg.glassBlur ?? 36.8}>
                        <S.VirtualMonitor
                            ref={monitorRef}
                            $url={wallpaper.url}
                            $mw={wallpaper.mw}
                            $mh={wallpaper.mh}
                        />
                    </S.FakeGlassLayer>
                )}

                {bg.mode === "glass" && bg.gloss && <S.GlossOverlay />}
                </S.BackgroundSurface>
                {appearance.design==='ornate' && !showSettings && <div aria-hidden style={{position:'absolute',inset:0,pointerEvents:'none',opacity:appearance.intensity}}><WidgetCharm locked={locked} /></div>}
                {appearance.design==='ornate'&&<WidgetDecor kind={kind} locked={locked} intensity={appearance.intensity}/>}

                {!locked && (
                    <S.TopBar onMouseDown={startDrag}>
                        <S.Gem $grip title={title} />
                        <S.Rule />
                        <S.BtnGroup
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <S.Control
                                type="button"
                                ref={settingsButton}
                                $active={showSettings}
                                title={t.widgetShell.appearance}
                                aria-label={t.widgetShell.appearance}
                                aria-expanded={showSettings}
                                onClick={() => setShowSettings((v) => !v)}
                            ><Settings2 size={14} /></S.Control>
                            <S.Control type="button" title={t.widgetShell.lock} aria-label={t.widgetShell.lock} onClick={handleLock}><Lock size={14} /></S.Control>
                            <S.Control
                                type="button"
                                $danger
                                title={t.widgetShell.close}
                                aria-label={t.widgetShell.close}
                                onClick={async () => {
                                    try { localStorage.setItem(`cronos-widget-open:${kind}`, "0"); } catch {}
                                    await mirrorWidgetStateToFile();
                                    closeWindow();
                                }}
                            ><X size={14} /></S.Control>
                        </S.BtnGroup>
                    </S.TopBar>
                )}

                {!locked && showSettings && (
                    <ThemeProvider theme={theme}><Overlay ref={settingsPane} data-settings-open role="dialog" aria-modal="true" tabIndex={-1} aria-label={t.widgetShell.appearance} onKeyDown={(event)=>{
                        if(event.key!=='Tab') return;
                        const pane=settingsPane.current;
                        const controls=Array.from(pane?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),[tabindex="0"]')??[]).filter(e=>e.getClientRects().length>0);
                        const first=controls[0],last=controls[controls.length-1];
                        if(!first) {event.preventDefault();return;}
                        if(event.shiftKey && (document.activeElement===first || document.activeElement===pane)) {event.preventDefault();last.focus();}
                        else if(!event.shiftKey && (document.activeElement===last || document.activeElement===pane)) {event.preventDefault();first.focus();}
                    }}>
                        <WidgetAppearanceSettings kind={kind} title={title} compact onDone={closeSettings}/>
                    </Overlay></ThemeProvider>
                )}

                <S.Content inert={showSettings} ref={contentRef} $kind={kind} $locked={locked}>
                    {children}
                </S.Content>
            </ThemeProvider>
        </S.Shell></MotionRules></WidgetMotionContext.Provider>
    );
}
