"use client";

import { useRef } from "react";
import useHoverOnce from "@/hooks/useHoverOnce";
import { Decor } from "./MapleWidgetDecor.styles";

export default function MapleWidgetDecor({ locked }: { locked: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 720);

    return <Decor ref={ref} aria-hidden="true" data-ambient="widget-decor">
        {!locked && <span className="pressed-leaf" />}
        <span className="corner-leaf" />
        <span className="small-leaf" />
    </Decor>;
}
