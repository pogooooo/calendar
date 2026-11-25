"use client";

import type { Ref } from "react";
import { useTheme } from "styled-components";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import { widgetBackgroundStyle, type WidgetBgSettings } from "@/lib/widgetBackground";
import type { WidgetAppearance } from "@/lib/widgetAppearance";
import type { WidgetKind } from "@/lib/widgetKinds";
import * as Celestial from "./celestial/CelestialWidgetShell.styles";
import * as Maple from "./maple/MapleWidgetShell.styles";
import * as Ocean from "./ocean/OceanWidgetShell.styles";
import * as Gem from "./gem/GemWidgetShell.styles";
import WidgetCharm from "./WidgetCharm";
import WidgetDecor from "./WidgetDecor";

export const WIDGET_SHELLS: ThemeImpls<typeof Celestial> = {
    celestial: Celestial, maple: Maple, ocean: Ocean, gem: Gem,
};

export type WidgetWallpaper = { url: string; mw: number; mh: number };

export default function WidgetLayers({
    kind, bg, appearance, wallpaper, wallpaperTransform, monitorRef, locked,
}: {
    kind: WidgetKind;
    bg: WidgetBgSettings;
    appearance: WidgetAppearance;
    wallpaper?: WidgetWallpaper;
    wallpaperTransform?: string;
    monitorRef?: Ref<HTMLDivElement>;
    locked: boolean;
}) {
    const S = usePickTheme(WIDGET_SHELLS);
    const theme = useTheme();
    const surface = theme.baseColors?.surface ?? theme.colors.surface;
    return <>
        <S.BackgroundSurface data-widget-background aria-hidden
            data-widget-background-mode={bg.mode}
            data-ornate={appearance.design === "ornate" && bg.mode === "theme"}
            style={widgetBackgroundStyle(bg, surface)}>
            {bg.mode === "glass" && wallpaper?.url && (
                <S.FakeGlassLayer $blur={bg.glassBlur ?? 36.8}>
                    <S.VirtualMonitor ref={monitorRef} $url={wallpaper.url} $mw={wallpaper.mw} $mh={wallpaper.mh}
                        style={wallpaperTransform ? { transform: wallpaperTransform } : undefined} />
                </S.FakeGlassLayer>
            )}
            {bg.mode === "glass" && bg.gloss && <S.GlossOverlay />}
        </S.BackgroundSurface>
        {appearance.design === "ornate" && <>
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: appearance.intensity }}>
                <WidgetCharm locked={locked} />
            </div>
            <WidgetDecor kind={kind} locked={locked} intensity={appearance.intensity} />
        </>}
    </>;
}
