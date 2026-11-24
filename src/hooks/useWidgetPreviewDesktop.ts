"use client";

import { useEffect, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { availableMonitors, currentMonitor, getCurrentWindow, Window } from "@tauri-apps/api/window";
import { isDesktopShell } from "@/lib/platform";
import type { WidgetKind } from "@/lib/widgetKinds";

const TALL = [200, 416] as const;
const WIDE = [416, 200] as const;
const SQUARE = [200, 200] as const;
const DEFAULT_SIZES: Record<WidgetKind, readonly [number, number]> = {
    today: TALL, quicktask: TALL, challenge: TALL, projects: TALL,
    stats: SQUARE, anniversary: SQUARE, due: SQUARE,
    memo: WIDE, nownext: WIDE, monthly: [416, 416], weekly: [848, 200],
};

type Geometry = { width: number; height: number; x: number; y: number; mw: number; mh: number };
type Desktop = Geometry & { url?: string; luminance?: number };
const initialGeometry = (kind: WidgetKind): Geometry => {
    const [width, height] = DEFAULT_SIZES[kind];
    return { width, height, x: 0, y: 0, mw: width, mh: height };
};

export function rgbLuminance(r: number, g: number, b: number) {
    const linear = (channel: number) => {
        const c = channel / 255;
        return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
    };
    return .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b);
}

export function useWidgetPreviewDesktop(kind: WidgetKind, compact: boolean) {
    const [desktop, setDesktop] = useState<Desktop>(() => initialGeometry(kind));

    useEffect(() => {
        let active = true;
        let revision = 0;
        const key = `cronos-widget-bounds:${kind}`;
        const refresh = async () => {
            const request = ++revision;
            const publish = (next: Desktop) => {
                if (active && request === revision) setDesktop(next);
            };
            let geometry = initialGeometry(kind);
            let saved: { x?: number; y?: number; w?: number; h?: number } | null = null;
            try { saved = JSON.parse(localStorage.getItem(key) ?? "null"); } catch {}
            const width = compact ? window.innerWidth : saved?.w;
            const height = compact ? window.innerHeight : saved?.h;
            if (width && height && Number.isFinite(width) && Number.isFinite(height) && width >= 160 && height >= 120) {
                geometry = { ...geometry, width, height, mw: width, mh: height };
            }
            if (active && request === revision) setDesktop(previous => previous.url ? previous : geometry);
            if (!isDesktopShell()) return;

            try {
                const [path, monitors, current, live] = await Promise.all([
                    invoke<string>("get_wallpaper_path"),
                    availableMonitors().catch(() => []),
                    currentMonitor().catch(() => null),
                    readWidgetBounds(kind, compact),
                ]);
                if (!active || request !== revision) return;
                if (live) geometry = { ...geometry, width: live.w, height: live.h };
                if (!path) { publish(geometry); return; }
                const x = live?.x ?? saved?.x;
                const y = live?.y ?? saved?.y;
                const logical = monitors.map(monitor => ({
                    x: monitor.position.x / monitor.scaleFactor, y: monitor.position.y / monitor.scaleFactor,
                    mw: monitor.size.width / monitor.scaleFactor, mh: monitor.size.height / monitor.scaleFactor,
                }));
                const savedMonitor = x === undefined || y === undefined ? undefined : logical.find(monitor =>
                    x >= monitor.x - 8 && y >= monitor.y - 8 && x < monitor.x + monitor.mw - 40 && y < monitor.y + monitor.mh - 40);
                const monitor = savedMonitor ?? (current && {
                    x: current.position.x / current.scaleFactor, y: current.position.y / current.scaleFactor,
                    mw: current.size.width / current.scaleFactor, mh: current.size.height / current.scaleFactor,
                });
                const mw = monitor?.mw ?? screen.width;
                const mh = monitor?.mh ?? screen.height;
                geometry = {
                    ...geometry, mw, mh,
                    x: savedMonitor && x !== undefined ? x - savedMonitor.x : Math.max(0, (mw - geometry.width) / 2),
                    y: savedMonitor && y !== undefined ? y - savedMonitor.y : Math.max(0, (mh - geometry.height) / 2),
                };
                const url = convertFileSrc(path);
                const image = new Image();
                let source = url;
                try {
                    const response = await fetch(url);
                    if (response.ok) source = URL.createObjectURL(await response.blob());
                } catch {}
                try {
                    image.src = source;
                    await image.decode();
                    publish({ ...geometry, url, luminance: sampleWallpaper(image, geometry) });
                } finally {
                    if (source !== url) URL.revokeObjectURL(source);
                }
            } catch {
                // The preview keeps its fallback surface if the OS image is unavailable.
            }
        };
        const onStorage = (event: StorageEvent) => { if (event.key === key) void refresh(); };
        void refresh();
        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", refresh);
        if (compact) window.addEventListener("resize", refresh);
        return () => {
            active = false;
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("resize", refresh);
        };
    }, [kind, compact]);

    return desktop;
}

async function readWidgetBounds(kind: WidgetKind, compact: boolean) {
    try {
        const win = compact ? getCurrentWindow() : await Window.getByLabel(`widget-${kind}`);
        if (!win) return;
        const [scale, pos, size] = await Promise.all([win.scaleFactor(), win.outerPosition(), win.innerSize()]);
        return { x: pos.x / scale, y: pos.y / scale, w: size.width / scale, h: size.height / scale };
    } catch {
        // Saved bounds cover closed widgets and unavailable window APIs.
    }
}

function sampleWallpaper(image: HTMLImageElement, { x, y, width, height, mw, mh }: Geometry) {
    try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const sx = Math.max(0, x * image.naturalWidth / mw);
        const sy = Math.max(0, y * image.naturalHeight / mh);
        const sw = Math.min(image.naturalWidth - sx, width * image.naturalWidth / mw);
        const sh = Math.min(image.naturalHeight - sy, height * image.naturalHeight / mh);
        if (sw <= 0 || sh <= 0) return;
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return rgbLuminance(r, g, b);
    } catch {
        // Some webviews display the asset URL while blocking canvas reads.
    }
}
