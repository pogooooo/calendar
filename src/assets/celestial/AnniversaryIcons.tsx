"use client";

import * as React from "react";

export interface AnniversaryIconDef {
    key: string;
    label: string;
    draw: React.ReactNode;
}

export const ANNIVERSARY_ICONS: AnniversaryIconDef[] = [
    {
        key: "star",
        label: "별",
        draw: (
            <path d="M12 2.4C12.8 8.4 15.6 11.2 21.6 12C15.6 12.8 12.8 15.6 12 21.6C11.2 15.6 8.4 12.8 2.4 12C8.4 11.2 11.2 8.4 12 2.4Z" />
        ),
    },
    {
        key: "moon",
        label: "달",
        draw: (
            <path d="M16.4 3.6A9 9 0 1 0 20.4 14.6A7 7 0 1 1 16.4 3.6Z" />
        ),
    },
    {
        key: "cake",
        label: "케이크",
        draw: (
            <>
                <path d="M3.6 20.6h16.8" />
                <path d="M5 20.6v-7.2h14v7.2" />
                <path d="M5 16.4c1.17 0 1.17 1.3 2.33 1.3s1.17-1.3 2.34-1.3 1.16 1.3 2.33 1.3 1.17-1.3 2.33-1.3 1.17 1.3 2.34 1.3S18 16.4 19 16.4" />
                <path d="M12 13.4v-2.6" />
                <path d="M12 10.6c-1.5-1.2-.9-2.7 0-4 .9 1.3 1.5 2.8 0 4Z" />
            </>
        ),
    },
    {
        key: "ring",
        label: "반지",
        draw: (
            <>
                <circle cx="12" cy="15.2" r="5.6" />
                <path d="M12 2.8 14.6 6.1 12 9.4 9.4 6.1Z" />
                <path d="M9.4 6.1h5.2" />
            </>
        ),
    },
    {
        key: "heart",
        label: "하트",
        draw: (
            <path d="M12 20.4C4.4 15.2 3.2 11 5.7 8.5c1.9-1.9 4.6-1.3 6.3.8 1.7-2.1 4.4-2.7 6.3-.8 2.5 2.5 1.3 6.7-6.3 11.9Z" />
        ),
    },
    {
        key: "flower",
        label: "꽃",
        draw: (
            <>
                {[0, 60, 120, 180, 240, 300].map(deg => (
                    <ellipse key={deg} cx="12" cy="7.2" rx="2.1" ry="3.5" transform={`rotate(${deg} 12 12)`} />
                ))}
                <circle cx="12" cy="12" r="1.9" />
            </>
        ),
    },
    {
        key: "candle",
        label: "촛불",
        draw: (
            <>
                <path d="M8.6 20.8h6.8" />
                <path d="M9.8 20.8v-8.6h4.4v8.6" />
                <path d="M12 12.2c-2.2-1.8-1.4-4.2 0-6.4 1.4 2.2 2.2 4.6 0 6.4Z" />
            </>
        ),
    },
    {
        key: "gift",
        label: "선물",
        draw: (
            <>
                <path d="M4.4 11.4h15.2v9.2H4.4z" />
                <path d="M3.2 7.6h17.6v3.8H3.2z" />
                <path d="M12 7.6v13" />
                <path d="M12 7.6C9.9 7.6 8 6.8 8 5.6S9.5 3.4 12 7.6Z" />
                <path d="M12 7.6c2.1 0 4-.8 4-2s-1.5-2.2-4 2Z" />
            </>
        ),
    },
];

const LEGACY_EMOJI: Record<string, string> = {
    "🎂": "cake",
    "💍": "ring",
    "🎉": "star",
    "💐": "flower",
    "🕯": "candle",
    "🎁": "gift",
    "✦": "star",
    "❤": "heart",
};

export const resolveIconKey = (raw: string | null | undefined) => {
    if (!raw) return "star";
    if (ANNIVERSARY_ICONS.some(i => i.key === raw)) return raw;
    return LEGACY_EMOJI[raw] ?? "star";
};

export default function AnniversaryIcon({
    name,
    size = 16,
    strokeWidth = 1.4,
}: {
    name?: string | null;
    size?: number;
    strokeWidth?: number;
}) {
    const key = resolveIconKey(name);
    const def = ANNIVERSARY_ICONS.find(i => i.key === key) ?? ANNIVERSARY_ICONS[0];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {def.draw}
        </svg>
    );
}
