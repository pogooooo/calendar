"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import { usePickTheme, useThemeFamily } from "@/styles/themed";
import { useWidgetPreviewDesktop, rgbLuminance } from "@/hooks/useWidgetPreviewDesktop";
import type { WidgetBgSettings } from "@/lib/widgetBackground";
import type { WidgetAppearance, WidgetEffect } from "@/lib/widgetAppearance";
import type { WidgetKind } from "@/lib/widgetKinds";
import WidgetContent from "./WidgetContent";
import WidgetLayers, { WIDGET_SHELLS } from "./WidgetLayers";
import { GLASS_MARGIN } from "./celestial/CelestialWidgetShell.styles";
import { WidgetMotionContext } from "./WidgetMotionContext";
import { WidgetPreviewContext } from "./WidgetPreviewContext";
import { MotionRules } from "./WidgetAppearance.styles";

const SAMPLE_WALLPAPER = "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="none">
        <defs>
            <linearGradient id="sky" x2="100%" y2="100%">
                <stop stop-color="#dfbb9c"/>
                <stop offset=".54" stop-color="#66949e"/>
                <stop offset="1" stop-color="#23334d"/>
            </linearGradient>
        </defs>
        <path fill="url(#sky)" d="M0 0h400v400H0z"/>
        <path fill="#344b63" opacity=".6" d="M0 310Q106 118 215 232T400 191V400H0z"/>
        <path fill="#223249" d="M0 362Q120 212 232 315T400 278V400H0z"/>
    </svg>
`);

export default function WidgetAppearancePreview({
    kind, label, appearance, bg, compact, previewMotion,
}: {
    kind: WidgetKind;
    label: string;
    appearance: WidgetAppearance;
    bg: WidgetBgSettings;
    compact: boolean;
    previewMotion?: Exclude<WidgetEffect, "inherit">;
}) {
    const ko = useSettingStore(state => state.locale) === "ko";
    const theme = useTheme();
    const S = usePickTheme(WIDGET_SHELLS);
    const desktop = useWidgetPreviewDesktop(kind, compact);
    const stage = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);
    const [inspect, setInspect] = useState(false);
    const playback = useRef<Animation[]>([]);
    const gem = useThemeFamily() === "gem";
    const { width, height, url, mw, mh, x, y, luminance } = desktop;
    useEffect(() => {
        const node = stage.current;
        if (!node) return;
        const fit = () => setScale(Math.min(node.clientWidth / width, node.clientHeight / height, 1));
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(node);
        return () => observer.disconnect();
    }, [width, height]);
    useLayoutEffect(() => {
        stage.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [inspect]);
    useEffect(() => () => { playback.current.forEach(animation => animation.cancel()); }, [previewMotion]);
    const replay = () => {
        playback.current.forEach(animation => animation.cancel());
        const decor = stage.current?.querySelector("[data-gem-widget-setting] > i");
        const content = stage.current?.querySelector("[data-gem-preview-content]");
        const gentle = previewMotion === "gentle";
        const target = decor ?? content;
        if (!target) return;
        const frames = decor ? [{ transform: "none" }, { transform: gentle ? "scale(1.035, 1.02)" : "scale(1.08, 1.04)" }, { transform: "none" }]
            : [{ opacity: .68 }, { opacity: 1 }];
        playback.current = [target.animate(frames, { duration: gentle ? 230 : 460, easing: "ease-out" })];
    };

    const surface = bg.mode === "custom" ? bg.customColor : theme.colors.surface;
    const hex = /^#[\da-f]{6}$/i.test(surface) ? parseInt(surface.slice(1), 16) : null;
    const solid = hex === null ? null : rgbLuminance(hex >> 16, (hex >> 8) & 255, hex & 255);
    const wallpaperLuminance = url ? luminance : rgbLuminance(52, 75, 99);
    const effective = bg.mode === "glass" ? wallpaperLuminance
        : wallpaperLuminance !== undefined && solid !== null ? wallpaperLuminance * (1 - bg.opacity) + solid * bg.opacity
        : solid ?? undefined;
    const contrast = !bg.autoTextColor || effective === undefined ? {}
        : effective > .179 ? { text: "#1a1a1a", textSecondary: "#555555" }
        : { text: "#ffffff", textSecondary: "#dddddd" };
    const widgetTheme = { ...theme, baseColors: theme.colors, colors: { ...theme.colors, ...contrast, surface: "transparent" } };
    const wallpaper = { url: url ?? SAMPLE_WALLPAPER, mw, mh };
    const wallpaperOffset = `translate(${-x}px, ${-y}px)`;
    return <aside className="appearance-preview" aria-label={ko ? `${label} 미리보기` : `${label} preview`}>
        <div className="preview-heading"><strong>{ko ? "미리보기" : "Preview"}</strong><span>{url ? (ko ? "내 바탕화면" : "Your wallpaper") : (ko ? "예시 바탕화면" : "Sample wallpaper")}</span></div>
        {gem && <div className="gem-preview-actions">
            <button type="button" aria-pressed={inspect} onClick={() => setInspect(value => !value)}>{ko ? "실제 크기" : "Actual size"}</button>
            {previewMotion && <button type="button" disabled={previewMotion === "off"} onClick={replay}>{ko ? "움직임 재생" : "Play motion"}</button>}
        </div>}
        <div className="sample" ref={stage} data-inspect={inspect ? "" : undefined}
            tabIndex={inspect ? 0 : undefined} role={inspect ? "region" : undefined}
            aria-label={inspect ? (ko ? "실제 크기 위젯 미리보기" : "Actual size widget preview") : undefined}>
            <div className="preview-wallpaper" style={{ width: width * (inspect ? 1 : scale), height: height * (inspect ? 1 : scale) }} inert>
                <div style={{ position: "absolute", inset: 0, width, height, transform: `scale(${inspect ? 1 : scale})`, transformOrigin: "top left" }}>
                    <S.VirtualMonitor $url={wallpaper.url} $mw={mw} $mh={mh} style={{ transform: wallpaperOffset }} />
                    <WidgetPreviewContext.Provider value>
                        <WidgetMotionContext.Provider value="off">
                            <ThemeProvider theme={widgetTheme}>
                                <MotionRules>
                                    <S.Shell data-widget={kind} data-widget-preview data-widget-design={appearance.design}
                                        data-widget-motion="off"
                                        style={{ width, height,
                                            background: "transparent", borderColor: "transparent", boxShadow: "none" }}>
                                        <WidgetLayers kind={kind} bg={bg} appearance={appearance} wallpaper={wallpaper}
                                            wallpaperTransform={`translate(${-x + GLASS_MARGIN}px, ${-y + GLASS_MARGIN}px)`} locked={false} />
                                        <S.Content $kind={kind} data-gem-preview-content><WidgetContent kind={kind} /></S.Content>
                                    </S.Shell>
                                </MotionRules>
                            </ThemeProvider>
                        </WidgetMotionContext.Provider>
                    </WidgetPreviewContext.Provider>
                </div>
            </div>
        </div>
        <div className="preview-caption"><span>{ko ? "배경" : "Backdrop"} {Math.round(bg.opacity * 100)}%</span><span>{ko ? "장식" : "Ornaments"} {appearance.design === "simple" ? 0 : Math.round(appearance.intensity * 100)}%</span></div>
        <p className="preview-note">{inspect
            ? (ko ? "스크롤하여 위젯의 나머지 부분을 확인할 수 있습니다." : "Scroll to see the rest of the widget.")
            : (ko ? "위젯 크기에 맞춰 축소한 고정 미리보기입니다." : "A still preview scaled to fit the widget’s size.")}</p>
    </aside>;
}
