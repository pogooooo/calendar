"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const CrescentMoonAndLineIndicator = ({ width = "100%", height = "100%", className = "" }: { width?: string; height?: string; className?: string }) => (
    <svg overflow="visible" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M36 4.5C36 21 36 21 43.5 21C36 21 36 21 36 37.5C36 21 36 21 28.5 21C36 21 36 21 36 4.5Z" stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="25.75" cy="25.75" r="25.25" stroke="#D4AF37"/>
        <path d="M48.5 36.6402C46.5499 40.7118 43.5434 44.1857 39.7939 46.6999C36.0443 49.2141 31.6891 50.6766 27.182 50.9349C22.675 51.1931 18.1811 50.2378 14.1689 48.1684C10.1567 46.0989 6.77306 42.9912 4.3706 39.1691C1.96814 35.347 0.634851 30.9505 0.509702 26.4378C0.384553 21.925 1.47213 17.4614 3.65907 13.512C5.846 9.56262 9.05224 6.27214 12.9436 3.98353C16.8349 1.69492 21.2689 0.491968 25.7833 0.500059C28.0558 0.495113 30.3181 0.802149 32.5071 1.41257C28.0714 2.81948 24.285 5.76637 21.8321 9.7209C19.3792 13.6754 18.4215 18.3768 19.1319 22.9758C19.8424 27.5747 22.1741 31.7679 25.706 34.798C29.2378 37.828 33.7369 39.495 38.3904 39.4978C41.9603 39.5031 45.4611 38.5136 48.5 36.6402Z" stroke="#D4AF37" strokeMiterlimit="10"/>
    </svg>
);

export const SparkleIndicator = ({ width = "100%", height = "100%", className = "" }: { width?: string; height?: string; className?: string }) => (
    <svg overflow="visible" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="25.75" cy="25.75" r="25.25" stroke="#D4AF37"/>
        <path d="M36.5 5C36.5 21.5 36.5 21.5 44 21.5C36.5 21.5 36.5 21.5 36.5 38C36.5 21.5 36.5 21.5 29 21.5C36.5 21.5 36.5 21.5 36.5 5Z" stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const INNER_LINE_PATH = "M36 4.5C36 21 36 21 43.5 21C36 21 36 21 36 37.5C36 21 36 21 28.5 21C36 21 36 21 36 4.5Z";
const INNER_STAR_PATH = "M36.5 5C36.5 21.5 36.5 21.5 44 21.5C36.5 21.5 36.5 21.5 36.5 38C36.5 21.5 36.5 21.5 29 21.5C36.5 21.5 36.5 21.5 36.5 5Z";

const CRESCENT_PATH = "M48.5 36.6402C46.5499 40.7118 43.5434 44.1857 39.7939 46.6999C36.0443 49.2141 31.6891 50.6766 27.182 50.9349C22.675 51.1931 18.1811 50.2378 14.1689 48.1684C10.1567 46.0989 6.77306 42.9912 4.3706 39.1691C1.96814 35.347 0.634851 30.9505 0.509702 26.4378C0.384553 21.925 1.47213 17.4614 3.65907 13.512C5.846 9.56262 9.05224 6.27214 12.9436 3.98353C16.8349 1.69492 21.2689 0.491968 25.7833 0.500059C28.0558 0.495113 30.3181 0.802149 32.5071 1.41257C28.0714 2.81948 24.285 5.76637 21.8321 9.7209C19.3792 13.6754 18.4215 18.3768 19.1319 22.9758C19.8424 27.5747 22.1741 31.7679 25.706 34.798C29.2378 37.828 33.7369 39.495 38.3904 39.4978C41.9603 39.5031 45.4611 38.5136 48.5 36.6402Z";
const CIRCLE_PATH = "M48.5 36.6402C46.5499 40.7118 43.5434 44.1857 39.7939 46.6999C36.0443 49.2141 31.6891 50.6766 27.182 50.9349C22.675 51.1931 18.1811 50.2378 14.1689 48.1684C10.1567 46.0989 6.77306 42.9912 4.3706 39.1691C1.96814 35.347 0.634851 30.9505 0.509702 26.4378C0.384553 21.925 1.47213 17.4614 3.65907 13.512C5.846 9.56262 9.05224 6.27214 12.9436 3.98353C16.8349 1.69492 21.2689 0.491968 25.7833 0.500059C28.0558 0.495113 30.3181 0.802149 32.5071 1.41257C35.34 2.20 38.02 3.49 40.41 5.20C42.80 6.91 44.90 9.03 46.56 11.45C48.22 13.87 49.46 16.58 50.19 19.43C50.93 22.28 51.16 25.24 50.88 28.17C50.60 31.10 49.76 33.99 48.5 36.6402Z";

export const DynamicSticker = ({ isFilled, idx }: { isFilled: boolean, idx: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!containerRef.current) return;

        const starPath = containerRef.current.querySelector("path:nth-of-type(1)");
        const crescentPath = containerRef.current.querySelector("path:nth-of-type(2)");

        if (!starPath || !crescentPath) return;

        if (isFirstRender.current) {
            gsap.set(starPath, { attr: { d: isFilled ? INNER_STAR_PATH : INNER_LINE_PATH } });
            gsap.set(crescentPath, { attr: { d: isFilled ? CIRCLE_PATH : CRESCENT_PATH } });
            gsap.set(containerRef.current, {
                filter: isFilled
                    ? "drop-shadow(0 0 6px rgba(212, 175, 55, 0.8)) drop-shadow(0 0 2px rgba(212, 175, 55, 1))"
                    : "drop-shadow(0 0 0px rgba(212, 175, 55, 0))"
            });
            isFirstRender.current = false;
            return;
        }

        gsap.to(starPath, {
            attr: { d: isFilled ? INNER_STAR_PATH : INNER_LINE_PATH },
            duration: 0.5,
            ease: "power2.inOut"
        });

        gsap.to(crescentPath, {
            attr: { d: isFilled ? CIRCLE_PATH : CRESCENT_PATH },
            duration: 0.5,
            ease: "power2.inOut"
        });

        gsap.to(containerRef.current, {
            filter: isFilled
                ? "drop-shadow(0 0 6px rgba(212, 175, 55, 0.8)) drop-shadow(0 0 2px rgba(212, 175, 55, 1))"
                : "drop-shadow(0 0 0px rgba(212, 175, 55, 0))",
            duration: 0.5,
            ease: "power2.inOut"
        });

    }, [isFilled]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            <CrescentMoonAndLineIndicator width="100%" height="100%" />
        </div>
    );
};