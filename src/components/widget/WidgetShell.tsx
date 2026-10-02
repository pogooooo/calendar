"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ThemeProvider, useTheme } from "styled-components";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialWidgetShell.styles";
import * as MapleS from "./maple/MapleWidgetShell.styles";
import { GLASS_MARGIN } from "./celestial/CelestialWidgetShell.styles";
import useWidgetStore, { BgMode, WidgetBgSettings } from "@/store/useWidgetStore";
import { useT } from "@/i18n/useT";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow, currentMonitor } from "@tauri-apps/api/window";
import { Settings2, Lock, X } from "lucide-react";

import type { WidgetKind } from "@/store/useWidgetStore";
import { mirrorWidgetStateToFile } from "@/lib/widgetStateFile";

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

function buildBackground(bg: WidgetBgSettings, surfaceColor: string): React.CSSProperties {
    switch (bg.mode) {
        case "theme": {
            const alpha = Math.round(bg.opacity * 255).toString(16).padStart(2, "0");
            return {
                background: surfaceColor + alpha,
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
            };
        }
        case "glass": {
            return {
                background: "transparent",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
            };
        }
        case "custom": {
            const hex = bg.customColor.replace("#", "");
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return {
                background: `rgba(${r},${g},${b},${bg.opacity})`,
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
            };
        }
    }
}

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

export default function WidgetShell({ kind, title, children }: Props) {
    const S = usePickTheme(STYLES);
    const theme = useTheme();
    const t = useT();
    const bg = useWidgetStore((s) => s[kind].bg);
    const updateBg = useWidgetStore((s) => s.updateBg);

    const [showSettings, setShowSettings] = useState(false);
    const [locked, setLocked] = useState(false);
    const [wallpaper, setWallpaper] = useState({ url: "", mw: 1920, mh: 1080 });
    // 벽지를 읽어 정한 글자색. 아직 못 읽었으면 null 이고, 그때는 아래 baseline 을 쓴다.
    const [dynamicTextColor, setDynamicTextColor] = useState<{ text: string; textSecondary: string } | null>(null);

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
    // 테마가 종이결(Maple)을 가지면 "테마 바탕"은 색이 아니라 그 종이를 깐다 — 투명도는 종이 겹에 준다
    const paper = bg.mode === "theme" ? theme?.paper : undefined;
    const bgStyle = paper ? buildBackground({ ...bg, mode: "glass" }, surfaceColor) : buildBackground(bg, surfaceColor);

    const bgRef = useRef(bg);
    const surfaceColorRef = useRef(surfaceColor);

    useEffect(() => {
        bgRef.current = bg;
        surfaceColorRef.current = surfaceColor;
    }, [bg, surfaceColor]);

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
        return {
            ...theme,
            colors: {
                ...theme?.colors,
                surface: "transparent",
                ...(bg.autoTextColor ? (dynamicTextColor ?? baselineTextColor) : {}),
            },
            // 모달처럼 불투명해야 하는 요소가 되돌려 쓸 원본 색상
            baseColors: theme?.colors,
        };
    }, [theme, bg.autoTextColor, dynamicTextColor, baselineTextColor]);

    const handleModeChange = useCallback((mode: BgMode) => {
        updateBg(kind, { mode });
    }, [kind, updateBg]);

    const handleOpacity = useCallback((v: number) =>
        updateBg(kind, { opacity: v }), [kind, updateBg]);

    const handleColor = useCallback((c: string) =>
        updateBg(kind, { customColor: c }), [kind, updateBg]);

    const handleAutoTextColor = useCallback((v: boolean) =>
        updateBg(kind, { autoTextColor: v }), [kind, updateBg]);

    const handleGloss = useCallback((v: boolean) =>
        updateBg(kind, { gloss: v }), [kind, updateBg]);

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
        let unlistenMove: (() => void) | undefined;

        async function setupWallpaperSync() {
            if (!isTauri()) return;

            try {
                const path = await invoke<string>("get_wallpaper_path");
                if (!path) return;

                const assetUrl = convertFileSrc(path);
                let objUrl = assetUrl;

                try {
                    const res = await fetch(assetUrl);
                    const blob = await res.blob();
                    objUrl = URL.createObjectURL(blob);
                } catch {}

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = objUrl;
                await new Promise(r => { img.onload = r; img.onerror = r; });

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

                unlistenMove = await win.onMoved(async () => {
                    await syncOffset();
                });
            } catch {}
        }

        setupWallpaperSync();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            clearTimeout(timerId);
            if (unlistenMove) unlistenMove();
        };
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        if (locked) {
            e.preventDefault();
            handleUnlock();
        }
    }, [locked, handleUnlock]);

    return (
        <S.Shell
            style={bgStyle}
            data-widget={kind}
            $locked={locked}
            onContextMenu={handleContextMenu}
        >
            <ThemeProvider theme={widgetTheme}>
                {bg.mode === "glass" && wallpaper.url && (
                    <S.FakeGlassLayer $opacity={bg.opacity}>
                        <S.VirtualMonitor
                            ref={monitorRef}
                            $url={wallpaper.url}
                            $mw={wallpaper.mw}
                            $mh={wallpaper.mh}
                        />
                    </S.FakeGlassLayer>
                )}

                {paper && <S.PaperLayer $url={paper} $opacity={bg.opacity} />}
                {bg.mode === "glass" && bg.gloss && <S.GlossOverlay />}

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
                                $active={showSettings}
                                title={t.widgetShell.background}
                                aria-label={t.widgetShell.background}
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
                    <S.SettingsPanel data-settings-open onClick={(e) => e.stopPropagation()}>
                        <S.PanelLabel>{t.widgetShell.background}</S.PanelLabel>
                        <S.ModeRow>
                            {(["theme", "glass", "custom"] as BgMode[]).map((m) => (
                                <S.ModeChip
                                    key={m}
                                    $active={bg.mode === m}
                                    onClick={() => handleModeChange(m)}
                                >
                                    {m === "theme" ? t.widgetShell.theme : m === "glass" ? t.widgetShell.glass : t.widgetShell.color}
                                </S.ModeChip>
                            ))}
                        </S.ModeRow>

                        <S.PanelLabel>
                            {bg.mode === "glass"
                                ? t.widgetShell.blur(Math.round(bg.opacity * 40))
                                : t.widgetShell.opacity(Math.round(bg.opacity * 100))}
                        </S.PanelLabel>
                        <S.Slider
                            aria-label={bg.mode === "glass" ? t.widgetShell.blur(Math.round(bg.opacity * 40)) : t.widgetShell.opacity(Math.round(bg.opacity * 100))}
                            type="range" min={0} max={100}
                            value={Math.round(bg.opacity * 100)}
                            onChange={(e) => handleOpacity(parseInt(e.target.value) / 100)}
                        />

                        {bg.mode === "glass" && (
                            <>
                                <S.PanelDivider />
                                <S.ToggleRow>
                                    <S.ToggleLabel>{t.widgetShell.gloss}</S.ToggleLabel>
                                    <S.ToggleSwitch
                                        aria-label={t.widgetShell.gloss}
                                        aria-pressed={!!bg.gloss}
                                        $on={!!bg.gloss}
                                        onClick={() => handleGloss(!bg.gloss)}
                                    >
                                        {bg.gloss ? "ON" : "OFF"}
                                    </S.ToggleSwitch>
                                </S.ToggleRow>
                            </>
                        )}

                        {bg.mode === "custom" && (
                            <>
                                <S.PanelLabel>{t.widgetShell.color}</S.PanelLabel>
                                <S.ColorRow>
                                    <S.ColorPicker
                                        aria-label={t.widgetShell.color}
                                        type="color"
                                        value={bg.customColor}
                                        onChange={(e) => handleColor(e.target.value)}
                                    />
                                    <S.ColorHex>{bg.customColor}</S.ColorHex>
                                </S.ColorRow>
                            </>
                        )}

                        <S.PanelDivider />
                        <S.ToggleRow>
                            <S.ToggleLabel>{t.widgetShell.autoTextColor}</S.ToggleLabel>
                            <S.ToggleSwitch
                                aria-label={t.widgetShell.autoTextColor}
                                aria-pressed={bg.autoTextColor}
                                $on={bg.autoTextColor}
                                onClick={() => handleAutoTextColor(!bg.autoTextColor)}
                            >
                                {bg.autoTextColor ? "ON" : "OFF"}
                            </S.ToggleSwitch>
                        </S.ToggleRow>

                        <S.PanelDone onClick={() => setShowSettings(false)}>
                            {t.widgetShell.done}
                        </S.PanelDone>
                    </S.SettingsPanel>
                )}

                <S.Content ref={contentRef} $kind={kind} $locked={locked}>
                    {children}
                </S.Content>
            </ThemeProvider>
        </S.Shell>
    );
}
