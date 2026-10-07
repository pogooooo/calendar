"use client";

import { Cake, Flame, Flower2, Gem, Gift, Heart, Moon, Star, type LucideIcon } from "lucide-react";
import { resolveIconKey, type AnniversaryIconKey } from "../celestial/AnniversaryIcons";

export * from "../celestial/AnniversaryIcons";

/** 열쇠는 Celestial 과 같다(star·moon·…) — 그림만 lucide 의 둥근 선 아이콘으로 */
const ICONS: Record<AnniversaryIconKey, LucideIcon> = {
    star: Star,
    moon: Moon,
    cake: Cake,
    ring: Gem,
    heart: Heart,
    flower: Flower2,
    candle: Flame,
    gift: Gift,
};

/** 바다의 기념일 아이콘 — lucide 선 아이콘(선 굵기 1.75). 색은 글자색을 따른다 */
export default function OceanAnniversaryIcon({ name, size = 16, strokeWidth = 1.75 }: { name?: string | null; size?: number; strokeWidth?: number }) {
    const Icon = ICONS[resolveIconKey(name) as AnniversaryIconKey] ?? Star;
    return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" />;
}
