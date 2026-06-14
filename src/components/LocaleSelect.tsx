"use client";

import styled from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import type { Locale } from "@/i18n/types";
import { useT } from "@/i18n/useT";

export default function LocaleSelect({ size = "md" }: { size?: "sm" | "md" }) {
    const locale = useSettingStore((s) => s.locale);
    const setLocale = useSettingStore((s) => s.setLocale);
    const t = useT();

    return (
        <Wrapper $size={size}>
            <Select
                $size={size}
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
            >
                <option value="ko">{t.system.korean}</option>
                <option value="en">{t.system.english}</option>
            </Select>
            <Chevron $size={size} viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Chevron>
        </Wrapper>
    );
}

const Wrapper = styled.div<{ $size: "sm" | "md" }>`
    position: relative;
    display: inline-flex;
    align-items: center;
`;

const Select = styled.select<{ $size: "sm" | "md" }>`
    appearance: none;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary}70;
    color: ${p => p.theme.colors.text};
    font-family: ${p => p.theme.fonts.celestial};
    font-size: ${p => p.$size === "sm" ? "0.72rem" : "0.8rem"};
    letter-spacing: ${p => p.$size === "sm" ? "0.5px" : "1px"};
    padding: ${p => p.$size === "sm" ? "3px 28px 3px 10px" : "6px 32px 6px 12px"};
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
    }
    &:focus {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 0 2px ${p => p.theme.colors.primary}25;
    }

    option {
        background: ${p => p.theme.colors.surface};
        color: ${p => p.theme.colors.text};
    }
`;

const Chevron = styled.svg<{ $size: "sm" | "md" }>`
    position: absolute;
    right: ${p => p.$size === "sm" ? "8px" : "10px"};
    width: ${p => p.$size === "sm" ? "8px" : "10px"};
    height: auto;
    pointer-events: none;
    stroke: ${p => p.theme.colors.primary};
`;
