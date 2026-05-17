"use client";

import * as React from "react";
import { motion } from "framer-motion";

export const CrescentMoonAndLineIndicator = ({ width = "100%", height = "100%", className = "" }: { width?: string; height?: string; className?: string }) => (
    <svg overflow="visible" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M36 4.5C36 21 36 21 43.5 21C36 21 36 21 36 37.5C36 21 36 21 28.5 21C36 21 36 21 36 4.5Z" stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="25.75" cy="25.75" r="25.25" stroke="#D4AF37"/>
        <path d="M48.5 36.6402C46.5499 40.7118 43.5434 44.1857 39.7939 46.6999C36.0443 49.2141 31.6891 50.6766 27.182 50.9349C22.675 51.1931 18.1811 50.2378 14.1689 48.1684C10.1567 46.0989 6.77306 42.9912 4.3706 39.1691C1.96814 35.347 0.634851 30.9505 0.509702 26.4378C0.384553 21.925 1.47213 17.4614 3.65907 13.512C5.846 9.56262 9.05224 6.27214 12.9436 3.98353C16.8349 1.69492 21.2689 0.491968 25.7833 0.500059C28.0558 0.495113 30.3181 0.802149 32.5071 1.41257C28.0714 2.81948 24.285 5.76637 21.8321 9.7209C19.3792 13.6754 18.4215 18.3768 19.1319 22.9758C19.8424 27.5747 22.1741 31.7679 25.706 34.798C29.2378 37.828 33.7369 39.495 38.3904 39.4978C41.9603 39.5031 45.4611 38.5136 48.5 36.6402Z" stroke="#D4AF37" strokeMiterlimit="10"/>
    </svg>
);

export const SparkleIndicator = ({width = "100%", height = "100%", className = ""}: { width?: string; height?: string; className?: string }) => (
    <svg overflow="visible" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="25.75" cy="25.75" r="25.25" fill="#D4AF37" stroke="#D4AF37"/>
        <path d="M36.5 5C36.5 21.5 36.5 21.5 44 21.5C36.5 21.5 36.5 21.5 36.5 38C36.5 21.5 36.5 21.5 29 21.5C36.5 21.5 36.5 21.5 36.5 5Z" stroke="white" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const DynamicSticker = ({ isFilled, idx }: { isFilled: boolean, idx: number }) => {
    return (
        <div style={{ position: "relative", width: "45px", height: "45px" }}>
            <svg style={{ position: "absolute", top: 0, left: 0 }} width="0" height="0">
                <defs>
                    <clipPath id={`fillClip-${idx}`}>
                        <motion.rect
                            x="-10" y="0"
                            width="72" height="52"
                            initial={{ y: 52 }}
                            animate={{ y: isFilled ? 0 : 52 }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        />
                    </clipPath>
                </defs>
            </svg>

            <motion.div
                initial={false}
                animate={{ opacity: isFilled ? 0 : 1 }}
                transition={{ duration: 0.4 }}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            >
                <CrescentMoonAndLineIndicator width="100%" height="100%" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{ opacity: isFilled ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.8))"
                }}
            >
                <div style={{ width: "100%", height: "100%", clipPath: `url(#fillClip-${idx})` }}>
                    <SparkleIndicator width="100%" height="100%" />
                </div>
            </motion.div>
        </div>
    );
};