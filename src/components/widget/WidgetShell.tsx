"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import styled, { ThemeProvider, css, keyframes, useTheme } from "styled-components";
import { leafBullet } from "@/styles/maple/ink";
import useWidgetStore, { BgMode, WidgetBgSettings } from "@/store/useWidgetStore";
import { useT } from "@/i18n/useT";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow, currentMonitor } from "@tauri-apps/api/window";

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

export default function WidgetShell({ kind, title, children }: Props) {
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
        <Shell
            style={bgStyle}
            data-widget={kind}
            $locked={locked}
            onContextMenu={handleContextMenu}
        >
            <ThemeProvider theme={widgetTheme}>
                {bg.mode === "glass" && wallpaper.url && (
                    <FakeGlassLayer $opacity={bg.opacity}>
                        <VirtualMonitor
                            ref={monitorRef}
                            $url={wallpaper.url}
                            $mw={wallpaper.mw}
                            $mh={wallpaper.mh}
                        />
                    </FakeGlassLayer>
                )}

                {paper && <PaperLayer $url={paper} $opacity={bg.opacity} />}
                {bg.mode === "glass" && bg.gloss && <GlossOverlay />}

                {!locked && (
                    <TopBar onMouseDown={startDrag}>
                        <Gem $grip title={title} />
                        <Rule />
                        <BtnGroup
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Gem
                                as="button"
                                $active={showSettings}
                                title={t.widgetShell.background}
                                onClick={() => setShowSettings((v) => !v)}
                            />
                            <Gem as="button" title={t.widgetShell.lock} onClick={handleLock} />
                            <Gem
                                as="button"
                                $danger
                                title={t.widgetShell.close}
                                onClick={async () => {
                                    try { localStorage.setItem(`cronos-widget-open:${kind}`, "0"); } catch {}
                                    await mirrorWidgetStateToFile();
                                    closeWindow();
                                }}
                            />
                        </BtnGroup>
                    </TopBar>
                )}

                {!locked && showSettings && (
                    <SettingsPanel data-settings-open onClick={(e) => e.stopPropagation()}>
                        <PanelLabel>{t.widgetShell.background}</PanelLabel>
                        <ModeRow>
                            {(["theme", "glass", "custom"] as BgMode[]).map((m) => (
                                <ModeChip
                                    key={m}
                                    $active={bg.mode === m}
                                    onClick={() => handleModeChange(m)}
                                >
                                    {m === "theme" ? t.widgetShell.theme : m === "glass" ? t.widgetShell.glass : t.widgetShell.color}
                                </ModeChip>
                            ))}
                        </ModeRow>

                        <PanelLabel>
                            {bg.mode === "glass"
                                ? t.widgetShell.blur(Math.round(bg.opacity * 40))
                                : t.widgetShell.opacity(Math.round(bg.opacity * 100))}
                        </PanelLabel>
                        <Slider
                            type="range" min={0} max={100}
                            value={Math.round(bg.opacity * 100)}
                            onChange={(e) => handleOpacity(parseInt(e.target.value) / 100)}
                        />

                        {bg.mode === "glass" && (
                            <>
                                <PanelDivider />
                                <ToggleRow>
                                    <ToggleLabel>{t.widgetShell.gloss}</ToggleLabel>
                                    <ToggleSwitch
                                        $on={!!bg.gloss}
                                        onClick={() => handleGloss(!bg.gloss)}
                                    >
                                        {bg.gloss ? "ON" : "OFF"}
                                    </ToggleSwitch>
                                </ToggleRow>
                            </>
                        )}

                        {bg.mode === "custom" && (
                            <>
                                <PanelLabel>{t.widgetShell.color}</PanelLabel>
                                <ColorRow>
                                    <ColorPicker
                                        type="color"
                                        value={bg.customColor}
                                        onChange={(e) => handleColor(e.target.value)}
                                    />
                                    <ColorHex>{bg.customColor}</ColorHex>
                                </ColorRow>
                            </>
                        )}

                        <PanelDivider />
                        <ToggleRow>
                            <ToggleLabel>{t.widgetShell.autoTextColor}</ToggleLabel>
                            <ToggleSwitch
                                $on={bg.autoTextColor}
                                onClick={() => handleAutoTextColor(!bg.autoTextColor)}
                            >
                                {bg.autoTextColor ? "ON" : "OFF"}
                            </ToggleSwitch>
                        </ToggleRow>

                        <PanelDone onClick={() => setShowSettings(false)}>
                            {t.widgetShell.done}
                        </PanelDone>
                    </SettingsPanel>
                )}

                <Content ref={contentRef} $kind={kind} $locked={locked}>
                    {children}
                </Content>
            </ThemeProvider>
        </Shell>
    );
}

const GLASS_MARGIN = 30;

const Shell = styled.div<{ $locked?: boolean }>`
    --widget-pad: 10px;

    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${p => p.theme?.colors?.primary};
    box-sizing: border-box;
    user-select: none;
    border-radius: 0;
    position: relative;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    contain: layout paint;
`;

const FakeGlassLayer = styled.div<{ $opacity: number }>`
    position: absolute;
    top: -${GLASS_MARGIN}px; left: -${GLASS_MARGIN}px;
    right: -${GLASS_MARGIN}px; bottom: -${GLASS_MARGIN}px;
    z-index: -1;
    filter: blur(${p => Math.round(p.$opacity * 40)}px) saturate(140%);
    will-change: filter;
    pointer-events: none;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
    }
`;

/** 테마의 종이결(theme.paper). 바탕 투명도 슬라이더가 이 겹의 투명도다 */
const PaperLayer = styled.div<{ $url: string; $opacity: number }>`
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: url('${p => p.$url}') center / 384px auto repeat;
    opacity: ${p => p.$opacity};
`;

const GlossOverlay = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.03) 15%, transparent 30%);
    box-shadow: inset 0px 0px 15px rgba(255, 255, 255, 0.05);
`;

const VirtualMonitor = styled.div<{ $url: string; $mw: number; $mh: number }>`
    position: absolute;
    width: ${p => p.$mw}px;
    height: ${p => p.$mh}px;
    left: 0;
    top: 0;
    background-image: url('${p => p.$url}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 0;
    will-change: transform;
`;

/** 상단 바 높이. 내용과 설정 패널이 이 값만큼 비켜선다. */
const TOP_BAR_H = 24;

const TopBar = styled.div`
    position: absolute;
    height: ${TOP_BAR_H}px;
    box-sizing: border-box;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    cursor: default;
    opacity: 0.45;
    transition: opacity 0.14s ease;
    /* 유리 배경에서도 보석이 읽히도록 살짝만 어둡게 */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.18), transparent);

    &:active { cursor: default; }

    ${Shell}:hover &,
    &:focus-within { opacity: 1; }

    ${Shell}:has(> [data-settings-open]) & { opacity: 1; }
`;

const Gem = styled.span<{ $grip?: boolean; $active?: boolean; $danger?: boolean }>`
    width: 9px;
    height: 9px;
    flex-shrink: 0;
    padding: 0;
    transform: rotate(45deg);
    border: 1px solid ${p => p.theme?.colors?.primary};
    background: ${p => p.$active ? (p.theme?.colors?.primary) : "transparent"};
    opacity: ${p => p.$grip ? 0.55 : 0.8};
    cursor: ${p => p.$grip ? "grab" : "pointer"};
    transition: background 0.12s, opacity 0.12s, box-shadow 0.12s;

    &:hover {
        opacity: 1;
        background: ${p => p.$danger ? "#C8687A" : (p.theme?.colors?.primary)};
        border-color: ${p => p.$danger ? "#C8687A" : (p.theme?.colors?.primary)};
        box-shadow: 0 0 5px ${p => p.theme?.colors?.primary}80;
    }

    /* Maple: 보석 대신 잎 (윤곽 → 켜지거나 짚으면 채운 잎), 빛무리 없음 */
    ${p => p.theme?.family === "maple" && css`
        width: 11px; height: 11px;
        ${leafBullet(!!p.$active, "11px")}
        background-color: ${p.$danger ? p.theme.colors.error : p.theme.colors.primary};
        &:hover { ${leafBullet(true, "11px")} background-color: ${p.$danger ? p.theme.colors.error : p.theme.colors.primary}; }
    `}
`;

const Rule = styled.span`
    flex: 1;
    height: 1px;
    background: ${p => p.theme?.colors?.primary}66;
`;

const BtnGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const SettingsPanel = styled.div`
    position: absolute;
    /* 상단 바 바로 아래에서 시작한다. 예전에는 30px 로 못 박혀 있어
       200px 짜리 위젯에서 내용(176px)이 칸(167px)을 넘어 잘렸다. */
    top: ${TOP_BAR_H}px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--widget-pad);
    background: ${p => p.theme?.baseColors?.surface ?? p.theme?.colors?.surface};
    border-top: 1px solid ${p => p.theme?.colors?.primary}66;
    animation: ${slideDown} 0.15s ease;

    &, & * {
        color: ${p => p.theme?.baseColors?.text ?? p.theme?.colors?.text} !important;
    }
`;

const PanelDone = styled.button`
    /**
     * 패널 안이 넘쳐 굴려야 할 때도 이 단추는 늘 아래에 붙어 있어야 한다.
     * 예전에는 목록 끝에 매달려 있어서, 작은 위젯에서는 끝까지 굴려야 나왔다.
     */
    position: sticky;
    bottom: 0;
    z-index: 1;
    background-color: ${p => p.theme?.baseColors?.surface ?? p.theme?.colors?.surface};

    margin-top: auto;
    padding-top: 10px;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: none;
    border: none;
    border-top: 1px solid ${p => p.theme?.colors?.primary}33;
    cursor: pointer;
    font-family: ${p => p.theme?.fonts?.display};
    font-size: 0.7rem;
    letter-spacing: 2px;
    opacity: 0.75;

    &:hover { opacity: 1; }

    &::before {
        content: "";
        width: 7px;
        height: 7px;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme?.colors?.primary};
    }

    /* Maple: 마름모 대신 잎 */
    ${p => p.theme?.family === "maple" && css`
        &::before { ${leafBullet(true, "9px")} background-color: ${p.theme.colors.primary}; }
    `}
`;

const PanelLabel = styled.div`
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme?.colors?.text};
    opacity: 0.6;
    margin: 8px 0 4px;
    &:first-child { margin-top: 0; }
`;

const PanelDivider = styled.div`
    height: 1px;
    background: ${p => p.theme?.colors?.primary}20;
    margin: 10px 0 8px;
`;

const ToggleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const ToggleLabel = styled.span`
    font-size: 0.68rem;
    color: ${p => p.theme?.colors?.text};
    opacity: 0.85;
    letter-spacing: 0.3px;
`;

const ToggleSwitch = styled.button<{ $on: boolean }>`
    padding: 2px 8px;
    font-size: 0.62rem;
    letter-spacing: 0.5px;
    border: 1px solid ${p => p.$on
            ? p.theme?.colors?.primary
            : (p.theme?.colors?.primary) + "50"};
    background: ${p => p.$on ? (p.theme?.colors?.primary) + "25" : "transparent"};
    color: ${p => p.theme?.colors?.text};
    cursor: pointer;
    transition: all 0.12s;
    opacity: ${p => p.$on ? 1 : 0.5};
`;

const ModeRow = styled.div`
    display: flex;
    gap: 5px;
`;

const ModeChip = styled.button<{ $active: boolean }>`
    padding: 3px 10px;
    font-size: 0.7rem;
    border: 1px solid ${p => p.$active
            ? p.theme?.colors?.primary
            : (p.theme?.colors?.primary) + "40"};
    background: ${p => p.$active ? (p.theme?.colors?.primary) + "20" : "transparent"};
    color: ${p => p.theme?.colors?.text};
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.12s;
    opacity: ${p => p.$active ? 1 : 0.55};
`;

const Slider = styled.input`
    width: 100%;
    accent-color: ${p => p.theme?.colors?.primary};
    cursor: pointer;
`;

const ColorRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ColorPicker = styled.input`
    width: 32px;
    height: 24px;
    border: 1px solid ${p => p.theme?.colors?.primary}60;
    background: transparent;
    cursor: pointer;
    padding: 1px;
`;

const ColorHex = styled.span`
    font-size: 0.72rem;
    color: ${p => p.theme?.colors?.text};
    opacity: 0.7;
    letter-spacing: 1px;
    font-family: monospace;
`;

const Content = styled.div<{ $kind?: string; $locked?: boolean }>`
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    position: relative;

    /**
     * 상단 바 자리는 잠기지 않은 동안 늘 비워 둔다.
     *
     * 예전에는 마우스를 올릴 때만 바 높이만큼 내용을 밀었다. 그러면 바가 내용을
     * 덮진 않지만, 위젯에 마우스가 닿을 때마다 안의 내용이 24px 씩 들썩였다.
     * 자리를 고정해 두면 바가 나타나도 내용은 그대로다. 잠그면 바가 없으니
     * 그 자리도 내용에 돌려준다.
     */
    padding: ${p => p.$locked ? 0 : TOP_BAR_H}px 0 0;

    &, & * {
        color: ${p => p.theme?.colors?.text} !important;
    }

    & *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
    }
    & * {
        scrollbar-width: none !important;
    }
`;