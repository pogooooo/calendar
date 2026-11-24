"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { defaultMaterialUrls, materialBindings, materialMasks, neutralMaterials, type MaterialKey } from "./liveMaterials";
import { DEFAULT_MATERIAL_COLOR, materialRamp, materialSvg, type MaterialMode } from "./materialPalette";
import { materialCrops, type MaterialCropName } from "./materialCrops";

const sources = new Map<string, Promise<string>>();
function embeddedSource(src: string) {
    let cached = sources.get(src);
    if (!cached) {
        cached = fetch(src).then(response => {
            if (!response.ok) throw new Error("Material unavailable");
            return response.blob();
        }).then(blob => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })).catch(error => { sources.delete(src); throw error; });
        sources.set(src, cached);
    }
    return cached;
}

/** One set of colorized textures per window, shared by every component through CSS variables. */
export default function useGemMaterials(mode: MaterialMode, color: string, custom: boolean, enabled: boolean) {
    const [ready, setReady] = useState<{ mode: MaterialMode; color: string; urls: Record<MaterialKey, string>; owned: string[] }>();
    const palette = custom && color !== DEFAULT_MATERIAL_COLOR && ready?.mode === mode ? ready : undefined;
    const defaults = useMemo(() => defaultMaterialUrls(mode), [mode]);

    useLayoutEffect(() => {
        if (!enabled) return;
        const style = document.documentElement.style;
        const urls = palette?.urls ?? defaults;
        Object.entries(materialBindings).forEach(([key, role]) => style.setProperty(key, `url("${urls[role]}")`));
        Object.entries(materialMasks).forEach(([key, src]) => style.setProperty(key, `url("${src}")`));
    }, [defaults, enabled, palette]);

    useEffect(() => () => { ready?.owned.forEach(URL.revokeObjectURL); }, [ready]);

    useEffect(() => {
        if (!enabled || !custom || color === DEFAULT_MATERIAL_COLOR) {
            setReady(undefined);
            return;
        }
        let cancelled = false;
        const needed = new Set(Object.values(materialBindings));
        // Color-picker drags replace pending work; controls never wait for recoloring.
        const timer = setTimeout(() => {
            void Promise.all(Object.entries(neutralMaterials).map(async ([role, asset]) => ({
                role: role as keyof typeof neutralMaterials, asset, data: await embeddedSource(asset.src),
            }))).then(async materials => {
                if (cancelled) return;
                const urls = { ...defaults };
                const owned: string[] = [];
                for (const { role, asset, data } of materials) {
                    if (!needed.has(role)) continue;
                    const svg = materialSvg(data, asset.width, asset.height, materialRamp(color, mode, role));
                    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
                    urls[role] = url;
                    owned.push(url);
                }
                for (const [name, crop] of Object.entries(materialCrops)) {
                    if (!needed.has(name as MaterialCropName)) continue;
                    const source = materials.find(material => material.role === crop.source)!;
                    const svg = materialSvg(source.data, source.asset.width, source.asset.height, materialRamp(color, mode, crop.role, crop.finish), crop);
                    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
                    urls[name as MaterialCropName] = url;
                    owned.push(url);
                }
                try {
                    await Promise.all(owned.map(url => {
                        const image = new Image();
                        image.src = url;
                        return image.decode();
                    }));
                    if (!cancelled) { setReady({ mode, color, urls, owned }); return; }
                } catch {
                    // A partially loaded palette never replaces the currently displayed one.
                }
                owned.forEach(URL.revokeObjectURL);
            }).catch(() => { /* Keep the last complete palette if a texture cannot load. */ });
        }, 100);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [mode, color, custom, enabled, defaults]);
    return palette?.color ?? DEFAULT_MATERIAL_COLOR;
}
