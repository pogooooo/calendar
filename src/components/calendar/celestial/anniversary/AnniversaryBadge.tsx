"use client";

import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import AnniversaryIcon from "@/assets/celestial/AnniversaryIcons";
import type { AnniversaryType } from "@/store/useAnniversaryStore";

interface Props {
    items: AnniversaryType[];
    max?: number;
    compact?: boolean;
}

export default function AnniversaryBadge({ items, max = 2, compact = false }: Props) {
    if (items.length === 0) return null;

    const shown = items.slice(0, max);
    const rest = items.length - shown.length;

    return (
        <Stack aria-label={items.map(a => a.title).join(", ")}>
            {shown.map((a, i) => (
                <Badge key={a.id} $compact={compact} style={{ animationDelay: `${i * 1.6}s` }} title={a.title}>
                    <Glide />
                    <Frame $compact={compact}>
                        <AnniversaryIcon name={a.icon} size={compact ? 8 : 9} strokeWidth={1.9} />
                    </Frame>
                    <Name $compact={compact}>{a.title}</Name>
                    <Star>✦</Star>
                </Badge>
            ))}
            {rest > 0 && <More>+{rest}</More>}
        </Stack>
    );
}

const glide = keyframes`
    0%        { transform: translateX(-140%); opacity: 0; }
    12%, 42%  { opacity: 1; }
    55%, 100% { transform: translateX(420%); opacity: 0; }
`;

const twinkle = keyframes`
    0%, 100% { opacity: 0.45; }
    50%      { opacity: 1; text-shadow: 0 0 5px currentColor; }
`;

const settle = keyframes`
    from { opacity: 0; transform: translateY(-3px); }
    to   { opacity: 1; transform: none; }
`;

const motionSafe = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin: 1px 3px 3px;
    min-width: 0;
`;

const Badge = styled.div<{ $compact: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: ${p => (p.$compact ? "4px" : "5px")};
    padding: ${p => (p.$compact ? "1px 2px" : "2px 3px")};
    min-width: 0;
    overflow: hidden;
    color: ${p => p.theme.colors.primary};

    /* 위·아래 괘선은 양끝으로 갈수록 사라진다 */
    &::before,
    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            to right,
            transparent,
            ${p => p.theme.colors.primary} 22%,
            ${p => p.theme.colors.primary} 78%,
            transparent
        );
    }

    &::before { top: 0; }
    &::after  { bottom: 0; opacity: 0.4; }

    ${motionSafe(css`
        animation: ${settle} 0.45s ease-out both;
    `)}
`;

/* 위쪽 괘선을 따라 흐르는 빛 */
const Glide = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    width: 30%;
    height: 1px;
    background: linear-gradient(to right, transparent, ${p => p.theme.colors.primary}, transparent);
    box-shadow: 0 0 6px ${p => p.theme.colors.primary};
    opacity: 0;

    ${motionSafe(css`
        animation: ${glide} 6s ease-in-out infinite;
        animation-delay: inherit;
    `)}
`;

const Frame = styled.span<{ $compact: boolean }>`
    position: relative;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${p => (p.$compact ? "13px" : "15px")};
    height: ${p => (p.$compact ? "13px" : "15px")};

    &::before {
        content: "";
        position: absolute;
        inset: 1px;
        border: 1px solid ${p => p.theme.colors.primary}88;
        transform: rotate(45deg);
    }

    svg { position: relative; }
`;

const Name = styled.em<{ $compact: boolean }>`
    flex: 1;
    min-width: 0;
    font-style: normal;
    font-size: ${p => (p.$compact ? "0.58rem" : "0.62rem")};
    line-height: 1.35;
    letter-spacing: 0.3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Star = styled.span`
    flex: 0 0 auto;
    font-size: 6px;
    line-height: 1;

    ${motionSafe(css`
        animation: ${twinkle} 3.6s ease-in-out infinite;
    `)}
`;

const More = styled.span`
    align-self: flex-end;
    font-size: 0.55rem;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.primary};
    opacity: 0.7;
`;
