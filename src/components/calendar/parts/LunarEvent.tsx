"use client";

import type { CSSProperties } from "react";
import styled, { css } from "styled-components";
import { Check } from "lucide-react";
import { MoonDisc, Star4, crescentPath } from "@/components/ornament/celestial/CelestialOrnaments";

export function PhaseLine() {
    return <svg className="phase-line" viewBox="0 0 160 36" aria-hidden="true" focusable="false">
        <path d="M5 18h19m18 0h7m15 0h6m20 0h6m15 0h7m18 0h19" fill="none" stroke="currentColor" strokeWidth=".8" />
        <Star4 cx={10} cy={18} r={3} /><Star4 cx={150} cy={18} r={3} />
        <path d={crescentPath(34,18,6)} /><path d={crescentPath(34,18,6)} transform="translate(160) scale(-1 1)" />
        <MoonDisc cx={56} cy={18} r={5.5} phase={.75} />
        <MoonDisc cx={104} cy={18} r={5.5} phase={.25} />
        <circle className="line" cx="80" cy="18" r="7.5" /><circle cx="80" cy="18" r="5.2" />
        <path className="engraved-rays" d="m80 3 1.2 2.5L80 8l-1.2-2.5Zm0 25 1.2 2.5L80 33l-1.2-2.5Z" />
    </svg>;
}

interface LunarEventProps {
    title: string;
    color?: string;
    done: boolean;
    selected: boolean;
    count?: number;
    index?: number;
}

/** Each day keeps its drag and resize target. It shows its own slice of the same inscription. */
export function LunarEvent({title, color, done, selected, count = 1, index = 0}: LunarEventProps) {
    return <Window className="lunar-viewport" data-lunar-state={selected ? "selected" : done ? "done" : "normal"}
        data-complete={done || undefined}
        style={{"--ribbon-color":color, "--days":count, "--offset":index} as CSSProperties}>
        <Face>
            <span className="engraving">
                <span className="ribbon" aria-hidden="true">{done ? <Check size={10} /> :
                    <svg viewBox="0 0 16 16" width="11" height="11"><Star4 cx={8} cy={8} r={6} /></svg>}</span>
                <span className="inscription">{title}</span>
                <PhaseLine />
                <i className="finial" aria-hidden="true" />
            </span>
        </Face>
    </Window>;
}

const Window = styled.span`

    --ink: ${p => p.theme.mode === "light" ? "#292D3B" : p.theme.colors.text};
    --frame: ${p => p.theme.mode === "light" ? "#AA9567" : "#948364"};
    --inset: ${p => p.theme.mode === "light" ? "#B9AE924D" : "#AC98704D"};
    --metal: ${p => p.theme.mode === "light" ? "#937633" : "#CBB581"};
    --ribbon: var(--ribbon-color, #586F87);
    --mark: #F1E1AE;
    display: block; position: relative; width: 100%; min-width: 0;
    height: 100%; overflow: hidden; pointer-events: none; text-align: start;
    &[data-lunar-state="done"] {

        --ink: ${p => p.theme.mode === "light" ? "#55564F" : "#C6CEC3"};
        --frame: ${p => p.theme.mode === "light" ? "#B3B19D" : "#748175"};
        --inset: #B3B19D4D; --metal: ${p => p.theme.mode === "light" ? "#7E897A" : "#A5B4A2"};
        --ribbon: #7E897A; --mark: #F2EEE4;
    }
    &[data-lunar-state="selected"] {
        --ink: ${p => p.theme.colors.text}; --frame: #937633; --inset: #D4AF3752;
        --metal: ${p => p.theme.mode === "light" ? "#806321" : "#E1C773"}; --ribbon: #D4AF37; --mark: #352A10;
    }
    :focus-visible > &, [data-track-hover] > & { --inset: var(--frame); }
    &[data-complete] .inscription { text-decoration: line-through; }
`;
const Face = styled.span`
    display: block; position: relative; container: lunar-strip / inline-size;
    left: calc(2px - 100% * var(--offset));
    width: calc(100% * var(--days) - 4px); height: 100%;
    .engraving {
        display: flex; align-items: center; gap: 5px; box-sizing: border-box; height: 100%;
        padding: 0 5px; color: var(--ink); background: transparent; position: relative;
        border: 1px solid var(--frame); border-radius: 2px;
        &::after { content: ""; position: absolute; inset: 2px; border: 1px solid var(--inset); pointer-events: none; }
    }
    .ribbon {
        flex: none; align-self: stretch; display: grid; place-items: center; width: 13px;
        background: var(--ribbon); color: var(--mark);
        clip-path: polygon(0 0,100% 0,100% 100%,50% 85%,0 100%);
    }
    .ribbon svg { display: block; }
    .ribbon svg path.fill { fill: none; stroke: currentColor; stroke-width: 1.4; }
    .inscription { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 500 .73rem/1.35 ${p => p.theme.fonts.body}; }
    .phase-line { flex: none; width: 94px; height: 100%; max-height: 24px; color: var(--metal); fill: currentColor; }
    .phase-line .line { fill: none; stroke: currentColor; stroke-width: .9; }
    @media (hover: hover) {
        html[data-theme-motion="full"] & .engraved-rays {
            transform-origin: 80px 18px;
            transition: transform 240ms ease-out;
        }
        html[data-theme-motion="full"] [data-track-hover] & .engraved-rays { transform: rotate(18deg); }
        [data-widget-motion="off"] && .engraved-rays, [data-widget-motion="gentle"] && .engraved-rays {
            transform: none !important; transition: none;
        }
    }
    .finial { flex: none; width: 3px; height: 3px; background: var(--metal); transform: rotate(45deg); }
    @container lunar-strip (max-width: 260px) { .phase-line { width: 70px; } }
    @container lunar-strip (max-width: 186px) { .phase-line { display: none; } }
    @container lunar-strip (max-width: 76px) {
        .engraving { gap: 2px; padding-inline: 2px; }
        .ribbon { width: 6px; } .ribbon svg, .finial { display: none; }
        .inscription { font-size: .66rem; }
    }
`;

export const lunarTrack = css`
    &&&[data-lunar-track] {
        position: relative; box-sizing: border-box; display: flex; align-items: center;
        width: 100%; min-width: 0; margin-inline: 0; padding: 0;
        border: none; border-radius: 0; box-shadow: none; background: transparent;
        transform: none; clip-path: none; opacity: 1;
        &::before, &::after { display: none; }
        > .lunar-viewport { display: block; }
        &[data-dragging] { opacity: .55; }
        &:focus-visible { outline-offset: -1px; }
    }
`;
