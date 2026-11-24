"use client";

import { useRef } from "react";
import useHoverOnce from "@/hooks/useHoverOnce";
import { Decor } from "./OceanWidgetDecor.styles";

export default function OceanWidgetDecor() {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 820);

    return <Decor ref={ref} aria-hidden="true" data-ambient="widget-decor">
        <span className="rim-light" />
    </Decor>;
}
