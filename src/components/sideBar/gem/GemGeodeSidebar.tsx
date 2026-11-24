"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { Volume2, VolumeX } from "lucide-react";
import useThemeMotion from "@/hooks/useThemeMotion";
import useSettingStore from "@/store/useSettingStore";
import { useT } from "@/i18n/useT";
import { GeodeFacet, GeodeSurface, SoundButton } from "./GemSideBar.styles";
import { playGeodeSound } from "./geodeSound";

export default function GemGeodeSidebar() {
    const ref = useRef<HTMLDivElement>(null);
    const motion = useThemeMotion();
    const { mode } = useTheme();
    const t = useT();
    const sound = useSettingStore(s => s.gemSidebarSound);
    const setSound = useSettingStore(s => s.setGemSidebarSound);

    useEffect(() => {
        const surface = ref.current;
        const sidebar = surface?.parentElement;
        if (!surface || !sidebar) return;
        const facets = Array.from(surface.querySelectorAll<HTMLElement>("[data-gem-facet]"));
        let frame = 0;
        let inside = false;
        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        let energy = 0;
        let initialized = false;
        let lastTime = 0;
        const draw = (time: number) => {
            frame = 0;
            const dt = Math.min(40, lastTime ? time - lastTime : 16);
            lastTime = time;
            const follow = 1 - Math.exp(-dt / 75);
            const targetEnergy = inside ? motion === "gentle" ? .48 : 1 : 0;
            x += (targetX - x) * follow;
            y += (targetY - y) * follow;
            energy += (targetEnergy - energy) * (1 - Math.exp(-dt / (inside ? 100 : 170)));
            const bounds = facets.map(facet => facet.getBoundingClientRect());
            facets.forEach((facet, index) => {
                const rect = bounds[index];
                facet.style.setProperty("--gem-facet-light-x", `${x - rect.left}px`);
                facet.style.setProperty("--gem-facet-light-y", `${y - rect.top}px`);
            });
            surface.style.setProperty("--gem-rail-energy", energy.toFixed(3));
            if (Math.abs(targetEnergy - energy) > .002 || Math.abs(targetX - x) + Math.abs(targetY - y) > .15) {
                frame = requestAnimationFrame(draw);
            } else {
                surface.style.setProperty("--gem-rail-energy", String(targetEnergy));
                lastTime = 0;
            }
        };
        const move = (event: PointerEvent) => {
            if (motion === "off" || event.pointerType !== "mouse") return;
            inside = true;
            targetX = event.clientX;
            targetY = event.clientY;
            if (!initialized) { x = targetX; y = targetY; initialized = true; }
            if (!frame) frame = requestAnimationFrame(draw);
        };
        const leave = () => {
            inside = false;
            if (motion !== "off" && !frame) frame = requestAnimationFrame(draw);
        };
        const stop = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            lastTime = 0;
            inside = false;
            initialized = false;
            energy = 0;
            surface.style.setProperty("--gem-rail-energy", "0");
        };
        const visibility = () => { if (document.hidden) stop(); };
        const click = (event: MouseEvent) => {
            if (!event.isTrusted || !(event.target instanceof Element)) return;
            const target = event.target.closest<HTMLElement>("button:not(:disabled), [role='button'], a[href]");
            if (!target || !sidebar.contains(target) || target.hasAttribute("data-gem-sound")) return;
            if (sound) playGeodeSound(target.getAttribute("aria-current") !== "page");
        };
        sidebar.addEventListener("pointermove", move, { passive: true });
        sidebar.addEventListener("pointerleave", leave, { passive: true });
        sidebar.addEventListener("click", click, { capture: true, passive: true });
        window.addEventListener("blur", stop);
        document.addEventListener("visibilitychange", visibility);
        return () => {
            stop();
            sidebar.removeEventListener("pointermove", move);
            sidebar.removeEventListener("pointerleave", leave);
            sidebar.removeEventListener("click", click, true);
            window.removeEventListener("blur", stop);
            document.removeEventListener("visibilitychange", visibility);
        };
    }, [motion, sound]);

    return <>
        <GeodeSurface ref={ref} aria-hidden="true" data-gem-geode data-gem-rail-motion={motion}
            data-light-mode={mode === "light" ? "" : undefined}>
            <GeodeFacet data-gem-facet="crystal">
                <i />
            </GeodeFacet>
        </GeodeSurface>
        <SoundButton type="button" data-gem-sound aria-pressed={sound} aria-label={t.sidebar.effectSound}
            title={t.sidebar.effectSound} onClick={() => { setSound(!sound); if (!sound) playGeodeSound(true); }}>
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </SoundButton>
    </>;
}
