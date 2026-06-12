"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import styled, { ThemeProvider, keyframes, useTheme } from "styled-components";
import { Settings, X, GripHorizontal, Lock } from "lucide-react";
import useWidgetStore, { BgMode, WidgetBgSettings } from "@/store/useWidgetStore";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow, currentMonitor } from "@tauri-apps/api/window";

type WidgetKind = "daily" | "weekly" | "monthly";

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
    } catch (e) {}
}

async function closeWindow() {
    if (!isTauri()) { window.close(); return; }
    try {
        const win = getCurrentWindow();
        await win.close();
    } catch (e) {
        window.close();
    }
}

async function applyPriority(kind: string, priority: string) {
    if (!isTauri()) return;
    try {
        await invoke("set_widget_priority", { kind, priority });
    } catch (e) {}
}

async function applyLocked(kind: string, locked: boolean) {
    if (!isTauri()) return;
    try {
        await invoke("set_widget_locked", { kind, locked });
    } catch (e) {}
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

function computeTextOverride(bg: WidgetBgSettings): { text: string; textSecondary: string; } | null {
    if (!bg.autoTextColor) return null;
    let effectiveLum = 0;
    if (bg.mode === "custom") {
        effectiveLum = getLuminance(bg.customColor) * bg.opacity;
    } else if (bg.mode === "glass") {
        return null;
    } else {
        return null;
    }
    if (effectiveLum > 0.2) {
        return { text: "#1a1a1a", textSecondary: "#4a4a4a" };
    }
    return null;
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
    const theme = useTheme() as any;
    const bg = useWidgetStore((s) => s[kind].bg);
    const updateBg = useWidgetStore((s) => s.updateBg);

    const [showSettings, setShowSettings] = useState(false);
    const [locked, setLocked] = useState(false);
    const [wallpaper, setWallpaper] = useState({ url: "", mw: 1920, mh: 1080 });
    const [relPos, setRelPos] = useState({ x: 0, y: 0 });

    const bgStyle = buildBackground(bg, theme?.colors?.surface ?? "#1a160e");

    const widgetTheme = useMemo(() => {
        const textOverride = computeTextOverride(bg);
        return {
            ...theme,
            colors: {
                ...theme?.colors,
                surface: "transparent",
                ...(textOverride
                        ? { text: textOverride.text, textSecondary: textOverride.textSecondary }
                        : {}
                ),
            },
        };
    }, [theme, bg]);

    const handleModeChange = useCallback((mode: BgMode) => {
        updateBg(kind, { mode });
    }, [kind, updateBg]);

    const handleOpacity = useCallback((v: number) =>
        updateBg(kind, { opacity: v }), [kind, updateBg]);

    const handleColor = useCallback((c: string) =>
        updateBg(kind, { customColor: c }), [kind, updateBg]);

    const handleAutoTextColor = useCallback((v: boolean) =>
        updateBg(kind, { autoTextColor: v }), [kind, updateBg]);

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
        let unlistenMove: (() => void) | undefined;

        async function setupFakeGlass() {
            if (!isTauri() || bg.mode !== "glass") {
                setWallpaper({ url: "", mw: 1920, mh: 1080 });
                return;
            }

            try {
                const path = await invoke<string>("get_wallpaper_path");
                if (!path) return;

                const assetUrl = convertFileSrc(path);
                const win = getCurrentWindow();

                let mx = 0, my = 0, mw = 1920, mh = 1080;

                const updateMonitor = async () => {
                    const monitor = await currentMonitor();
                    const sf = monitor?.scaleFactor ?? window.devicePixelRatio ?? 1;
                    mw = (monitor?.size.width ?? 1920) / sf;
                    mh = (monitor?.size.height ?? 1080) / sf;
                    mx = (monitor?.position.x ?? 0) / sf;
                    my = (monitor?.position.y ?? 0) / sf;
                    setWallpaper({ url: assetUrl, mw, mh });
                };

                await updateMonitor();

                let lastRelX = -9999;
                let lastRelY = -9999;

                const tick = () => {
                    if (cancelled) return;

                    const newRelX = window.screenX - mx;
                    const newRelY = window.screenY - my;

                    if (newRelX !== lastRelX || newRelY !== lastRelY) {
                        lastRelX = newRelX;
                        lastRelY = newRelY;
                        setRelPos({ x: newRelX, y: newRelY });
                    }
                    rafId = requestAnimationFrame(tick);
                };
                tick();

                unlistenMove = await win.onMoved(async () => {
                    await updateMonitor();
                });
            } catch (e) {}
        }

        setupFakeGlass();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            if (unlistenMove) unlistenMove();
        };
    }, [bg.mode]);

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
            {bg.mode === "glass" && wallpaper.url && (
                <FakeGlassLayer $opacity={bg.opacity}>
                    <VirtualMonitor
                        $url={wallpaper.url}
                        $mw={wallpaper.mw}
                        $mh={wallpaper.mh}
                        $relX={relPos.x}
                        $relY={relPos.y}
                    />
                </FakeGlassLayer>
            )}
            {!locked && (
                <TopBar onMouseDown={startDrag}>
                    <GripIcon><GripHorizontal size={13} /></GripIcon>
                    <TitleText>{title}</TitleText>
                    <BtnGroup
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IconBtn
                            $active={showSettings}
                            onClick={() => setShowSettings((v) => !v)}
                        >
                            <Settings size={13} />
                        </IconBtn>
                        <IconBtn onClick={handleLock}>
                            <Lock size={13} />
                        </IconBtn>
                        <IconBtn onClick={closeWindow} $danger>
                            <X size={13} />
                        </IconBtn>
                    </BtnGroup>
                </TopBar>
            )}

            {!locked && showSettings && (
                <SettingsPanel onClick={(e) => e.stopPropagation()}>
                    <PanelLabel>배경</PanelLabel>
                    <ModeRow>
                        {(["theme", "glass", "custom"] as BgMode[]).map((m) => (
                            <ModeChip
                                key={m}
                                $active={bg.mode === m}
                                onClick={() => handleModeChange(m)}
                            >
                                {m === "theme" ? "테마" : m === "glass" ? "글래스" : "색상"}
                            </ModeChip>
                        ))}
                    </ModeRow>

                    <PanelLabel>
                        {bg.mode === "glass"
                            ? `블러 강도 ${Math.round(bg.opacity * 40)}px`
                            : `투명도 ${Math.round(bg.opacity * 100)}%`}
                    </PanelLabel>
                    <Slider
                        type="range" min={0} max={100}
                        value={Math.round(bg.opacity * 100)}
                        onChange={(e) => handleOpacity(parseInt(e.target.value) / 100)}
                    />

                    {bg.mode === "custom" && (
                        <>
                            <PanelLabel>색상</PanelLabel>
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
                        <ToggleLabel>글자색 자동 조정</ToggleLabel>
                        <ToggleSwitch
                            $on={bg.autoTextColor}
                            onClick={() => handleAutoTextColor(!bg.autoTextColor)}
                        >
                            {bg.autoTextColor ? "ON" : "OFF"}
                        </ToggleSwitch>
                    </ToggleRow>

                    <PanelDivider />
                    <LockBtn onClick={handleLock}>
                        <Lock size={12} /> 고정
                    </LockBtn>
                </SettingsPanel>
            )}

            <Content $kind={kind}>
                <ThemeProvider theme={widgetTheme}>
                    {children}
                </ThemeProvider>
            </Content>
        </Shell>
    );
}

const GLASS_MARGIN = 30;

const Shell = styled.div<{ $locked?: boolean }>`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: none;
    box-sizing: border-box;
    user-select: none;
    border-radius: 0;
    position: relative;
`;

const FakeGlassLayer = styled.div<{ $opacity: number }>`
    position: absolute;
    top: -${GLASS_MARGIN}px; left: -${GLASS_MARGIN}px;
    right: -${GLASS_MARGIN}px; bottom: -${GLASS_MARGIN}px;
    z-index: -1;
    filter: blur(${p => Math.round(p.$opacity * 40)}px) saturate(140%);
    pointer-events: none;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, ${p => p.$opacity * 0.3});
        z-index: 1;
    }
`;

const VirtualMonitor = styled.div<{ $url: string; $mw: number; $mh: number; $relX: number; $relY: number }>`
    position: absolute;
    width: ${p => p.$mw}px;
    height: ${p => p.$mh}px;
    left: ${p => -p.$relX + GLASS_MARGIN}px;
    top: ${p => -p.$relY + GLASS_MARGIN}px;
    background-image: url('${p => p.$url}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 0;
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    cursor: default;
    flex-shrink: 0;
    &:active { cursor: default; }
`;

const GripIcon = styled.span`
    color: ${p => p.theme?.colors?.primary ?? "#D4AF37"};
    opacity: 0.5;
    display: flex;
    align-items: center;
`;

const TitleText = styled.span`
    font-family: ${p => p.theme?.fonts?.celestial ?? "inherit"};
    font-size: 0.72rem;
    letter-spacing: 2px;
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    opacity: 0.85;
    flex: 1;
`;

const BtnGroup = styled.div`
    display: flex;
    gap: 4px;
`;

const IconBtn = styled.button<{ $active?: boolean; $danger?: boolean }>`
    background: ${p => p.$active ? (p.theme?.colors?.primary ?? "#D4AF37") + "20" : "transparent"};
    border: none;
    cursor: pointer;
    padding: 3px;
    display: flex;
    align-items: center;
    color: ${p => p.$danger ? "#e57373" : p.theme?.colors?.primary ?? "#D4AF37"};
    opacity: 0.7;
    border-radius: 3px;
    transition: opacity 0.1s, background 0.1s;
    &:hover {
        opacity: 1;
        background: ${p => p.$danger ? "#e5737320" : (p.theme?.colors?.primary ?? "#D4AF37") + "20"};
    }
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const SettingsPanel = styled.div`
    padding: 10px 12px;
    animation: ${slideDown} 0.15s ease;
    flex-shrink: 0;
`;

const PanelLabel = styled.div`
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    opacity: 0.6;
    margin: 8px 0 4px;
    &:first-child { margin-top: 0; }
`;

const PanelHint = styled.div`
    font-size: 0.62rem;
    color: ${p => p.theme?.colors?.textSecondary ?? "#888"};
    opacity: 0.7;
    margin: 3px 0 0;
    line-height: 1.4;
    word-break: keep-all;
`;

const PanelDivider = styled.div`
    height: 1px;
    background: ${p => p.theme?.colors?.primary ?? "#D4AF37"}20;
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
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    opacity: 0.85;
    letter-spacing: 0.3px;
`;

const ToggleSwitch = styled.button<{ $on: boolean }>`
    padding: 2px 8px;
    font-size: 0.62rem;
    letter-spacing: 0.5px;
    border: 1px solid ${p => p.$on
            ? p.theme?.colors?.primary ?? "#D4AF37"
            : (p.theme?.colors?.primary ?? "#D4AF37") + "50"};
    background: ${p => p.$on ? (p.theme?.colors?.primary ?? "#D4AF37") + "25" : "transparent"};
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    cursor: pointer;
    transition: all 0.12s;
    opacity: ${p => p.$on ? 1 : 0.5};
`;

const LockBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid ${p => p.theme?.colors?.primary ?? "#D4AF37"}40;
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    font-size: 0.68rem;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    cursor: pointer;
    opacity: 0.75;
    width: 100%;
    justify-content: center;
    transition: opacity 0.12s, background 0.12s;
    &:hover {
        opacity: 1;
        background: ${p => p.theme?.colors?.primary ?? "#D4AF37"}15;
    }
`;

const ModeRow = styled.div`
    display: flex;
    gap: 5px;
`;

const ModeChip = styled.button<{ $active: boolean }>`
    padding: 3px 10px;
    font-size: 0.7rem;
    border: 1px solid ${p => p.$active
            ? p.theme?.colors?.primary ?? "#D4AF37"
            : (p.theme?.colors?.primary ?? "#D4AF37") + "40"};
    background: ${p => p.$active ? (p.theme?.colors?.primary ?? "#D4AF37") + "20" : "transparent"};
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.12s;
    opacity: ${p => p.$active ? 1 : 0.55};
`;

const Slider = styled.input`
    width: 100%;
    accent-color: ${p => p.theme?.colors?.primary ?? "#D4AF37"};
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
    border: 1px solid ${p => p.theme?.colors?.primary ?? "#D4AF37"}60;
    background: transparent;
    cursor: pointer;
    padding: 1px;
`;

const ColorHex = styled.span`
    font-size: 0.72rem;
    color: ${p => p.theme?.colors?.text ?? "#e8e0d0"};
    opacity: 0.7;
    letter-spacing: 1px;
    font-family: monospace;
`;

const Content = styled.div<{ $kind?: string }>`
    flex: 1;
    min-height: 0;
    overflow-y: ${p => p.$kind === "monthly" ? "hidden" : "auto"};
    overflow-x: hidden;
    padding: 10px;
    position: relative;
    scrollbar-width: thin;
    scrollbar-color: ${p => p.theme?.colors?.primary ?? "#D4AF37"}40 transparent;
    ${p => p.$kind === "monthly" ? `
        & *, & *::-webkit-scrollbar {
            scrollbar-width: none !important;
        }
        & *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }
        & * {
            overflow-x: hidden !important;
        }
    ` : ""}
`;