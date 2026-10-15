"use client";

import { Cake, Flame, Flower, Gem, Gift, Heart, Moon, Sparkle, type LucideIcon } from "lucide-react";
import { resolveIconKey, type AnniversaryIconKey } from "../celestial/AnniversaryIcons";
import * as S from "./MapleAnniversaryIcon.styles";

/**
 * 열쇠는 Celestial 과 같다(star·moon·…) — 그림만 lucide 의 둥근 선 아이콘으로.
 * 예전엔 먹으로 그린 아이콘 시트(D2)를 잘라 씌웠는데, 작게 줄이면 먹이 뭉개져 읽히지 않았다.
 * 별은 네 갈래 반짝임(Sparkle) — 예전 시트의 별 모양을 따른다.
 */
const ICONS: Record<AnniversaryIconKey, LucideIcon> = {
    star: Sparkle,
    moon: Moon,
    cake: Cake,
    ring: Gem,
    heart: Heart,
    flower: Flower,
    candle: Flame,
    gift: Gift,
};

/** Maple 의 기념일 아이콘 — 한 빛깔 선 아이콘. 색은 글자색(currentColor)을 따른다 */
export default function MapleAnniversaryIcon({ name, size = 16, strokeWidth = 1.7 }: { name?: string | null; size?: number; strokeWidth?: number }) {
    const Icon = ICONS[resolveIconKey(name) as AnniversaryIconKey] ?? Sparkle;
    return (
        <S.Glyph $size={size} aria-hidden="true">
            <Icon size={size} strokeWidth={strokeWidth} focusable="false" />
        </S.Glyph>
    );
}
