"use client";

import type { CSSProperties } from "react";
import { Frame } from "./EngravedDayBar.styles";
import { ArrowRight, Check } from "lucide-react";
import { Star4 } from "@/components/ornament/celestial/CelestialOrnaments";
import { PhaseLine } from "@/components/calendar/parts/LunarEvent";

type Props = {
    title: string; color?: string; time?: string; done?: boolean; selected: boolean;
    timed?: boolean; begins?: boolean; ends?: boolean; handle?: boolean;
};

export default function EngravedDayBar({title, color, time, done, selected, timed, begins = true, ends = true, handle}: Props) {
    return <Frame data-engraved-bar={timed ? "timed" : "agenda"} data-done={done || undefined}
        data-selected={selected || undefined} data-handle={handle || undefined}
        data-begins={begins} data-ends={ends} style={{"--category": color} as CSSProperties}>
        <span className="face">
            {begins ? <span className="bookmark" aria-hidden="true">{done ? <Check size={9}/> :
                <svg width="9" height="9" viewBox="0 0 16 16"><Star4 cx={8} cy={8} r={6}/></svg>}</span>
                : <ArrowRight className="carry" size={12} aria-hidden="true"/>}
            <span className="word">{title}</span>
            <PhaseLine/>
            {time && <span className="clock">{time}</span>}
            {ends && <i className="end" aria-hidden="true"/>}
            {["tl","tr","bl","br"].map(c => (c.endsWith("l") ? begins : ends) && <i key={c} className={"etch " + c} aria-hidden="true"/>)}
        </span>
    </Frame>;
}
