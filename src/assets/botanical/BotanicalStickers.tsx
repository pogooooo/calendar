"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const PRIMARY = "#C9B59C";
const PRIMARY_GLOW = "rgba(201, 181, 156, 0.7)";

const LEAF_FILLED = "M26 8 C26 8 14 16 14 26 C14 36 26 42 26 42 C26 42 38 36 38 26 C38 16 26 8 26 8Z";
const LEAF_EMPTY  = "M26 10 C26 10 16 18 16 26 C16 34 26 40 26 40 C26 40 36 34 36 26 C36 18 26 10 26 10Z";

const BotanicalStickerInner = ({ isFilled, idx }: { isFilled: boolean; idx: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const leafRef      = useRef<SVGPathElement>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!containerRef.current || !leafRef.current) return;

        if (isFirstRender.current) {
            gsap.set(leafRef.current, { attr: { d: isFilled ? LEAF_FILLED : LEAF_EMPTY } });
            gsap.set(containerRef.current, {
                filter: isFilled
                    ? `drop-shadow(0 0 5px ${PRIMARY_GLOW}) drop-shadow(0 0 2px ${PRIMARY_GLOW})`
                    : "drop-shadow(0 0 0px rgba(201,181,156,0))",
            });
            isFirstRender.current = false;
            return;
        }

        gsap.to(leafRef.current, {
            attr: { d: isFilled ? LEAF_FILLED : LEAF_EMPTY },
            duration: 0.45,
            ease: "power2.inOut",
        });
        gsap.to(containerRef.current, {
            filter: isFilled
                ? `drop-shadow(0 0 5px ${PRIMARY_GLOW}) drop-shadow(0 0 2px ${PRIMARY_GLOW})`
                : "drop-shadow(0 0 0px rgba(201,181,156,0))",
            duration: 0.45,
            ease: "power2.inOut",
        });
    }, [isFilled]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            <svg overflow="visible" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="22" fill={PRIMARY} fillOpacity={isFilled ? 0.15 : 0} style={{ transition: "fill-opacity 0.45s" }}/>
                <circle cx="26" cy="26" r="24.5" stroke={PRIMARY} strokeWidth="0.9"/>
                <path d={LEAF_FILLED} fill={PRIMARY} fillOpacity={isFilled ? 0.3 : 0} style={{ transition: "fill-opacity 0.45s" }}/>
                <path ref={leafRef} d={LEAF_EMPTY} stroke={PRIMARY} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M26 10 L26 42" stroke={PRIMARY} strokeWidth="0.5" strokeLinecap="round" opacity="0.5"/>
                <path d="M26 18 C22 21 18 24 17 28" stroke={PRIMARY} strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M26 18 C30 21 34 24 35 28" stroke={PRIMARY} strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M26 28 C23 31 20 34 19 38" stroke={PRIMARY} strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M26 28 C29 31 32 34 33 38" stroke={PRIMARY} strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
                <circle cx="26" cy="26" r="2" stroke={PRIMARY} strokeWidth="0.7" opacity="0.6"/>
            </svg>
        </div>
    );
};

export const BotanicalDynamicSticker = React.memo(BotanicalStickerInner);

export const BotanicalFilledIndicator = () => (
    <svg overflow="visible" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24.5" stroke={PRIMARY} strokeWidth="0.9"/>
        <path d="M26 8 C26 8 14 16 14 26 C14 36 26 42 26 42 C26 42 38 36 38 26 C38 16 26 8 26 8Z"
            stroke={PRIMARY} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="26" cy="26" r="2" stroke={PRIMARY} strokeWidth="0.7" opacity="0.6"/>
    </svg>
);
