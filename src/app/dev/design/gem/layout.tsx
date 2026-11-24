import type { ReactNode } from "react";
import { Cormorant_Garamond } from "next/font/google";

const gemAccent = Cormorant_Garamond({
    subsets: ["latin"],
    weight: "600",
    variable: "--font-gem-accent",
    adjustFontFallback: false,
});

export default function GemLayout({ children }: { children: ReactNode }) {
    return <div className={gemAccent.variable}>{children}</div>;
}
