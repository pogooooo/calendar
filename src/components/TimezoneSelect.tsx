"use client";

import styled from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import { TIMEZONE_OPTIONS, detectTimeZone, isValidTimeZone } from "@/lib/timezone";

export default function TimezoneSelect({ size = "md" }: { size?: "sm" | "md" }) {
    const timezone = useSettingStore((s) => s.timezone);
    const setTimezone = useSettingStore((s) => s.setTimezone);

    // 저장된 값이 목록에 없으면(직접 지정했거나 OS 값) 항목을 하나 덧붙여 표시한다
    const options = TIMEZONE_OPTIONS.some(o => o.value === timezone) || !isValidTimeZone(timezone)
        ? TIMEZONE_OPTIONS
        : [...TIMEZONE_OPTIONS, { value: timezone, label: timezone }];

    return (
        <Wrapper $size={size}>
            <Select
                $size={size}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                aria-label="시간대"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </Select>
            <Chevron $size={size} viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Chevron>
            <DetectBtn
                type="button"
                onClick={() => setTimezone(detectTimeZone())}
                title="이 기기의 시간대로 맞춥니다"
            >
                자동
            </DetectBtn>
        </Wrapper>
    );
}

const Wrapper = styled.div<{ $size: "sm" | "md" }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
`;

const Select = styled.select<{ $size: "sm" | "md" }>`
    appearance: none;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary}70;
    color: ${p => p.theme.colors.text};
    font-family: ${p => p.theme.fonts.celestial};
    font-size: ${p => p.$size === "sm" ? "0.72rem" : "0.8rem"};
    letter-spacing: ${p => p.$size === "sm" ? "0.5px" : "0.5px"};
    padding: ${p => p.$size === "sm" ? "3px 28px 3px 10px" : "6px 32px 6px 12px"};
    max-width: 190px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover { border-color: ${p => p.theme.colors.primary}; }
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
    right: ${p => p.$size === "sm" ? "52px" : "58px"};
    width: ${p => p.$size === "sm" ? "8px" : "10px"};
    height: auto;
    pointer-events: none;
    stroke: ${p => p.theme.colors.primary};
`;

const DetectBtn = styled.button`
    flex-shrink: 0;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary}40;
    color: ${p => p.theme.colors.textSecondary};
    font-family: inherit;
    font-size: 0.7rem;
    padding: 5px 9px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};
    }
`;
