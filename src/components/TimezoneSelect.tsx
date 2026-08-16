"use client";

import styled from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import { TIMEZONE_OPTIONS, detectTimeZone, isValidTimeZone } from "@/lib/timezone";
import CelestialSelect from "@/components/input/select/CelestialSelect";

export default function TimezoneSelect({ size = "md" }: { size?: "sm" | "md" }) {
    const timezone = useSettingStore((s) => s.timezone);
    const setTimezone = useSettingStore((s) => s.setTimezone);

    // 저장된 값이 목록에 없으면(직접 지정했거나 OS 값) 항목을 하나 덧붙여 표시한다
    const options = TIMEZONE_OPTIONS.some(o => o.value === timezone) || !isValidTimeZone(timezone)
        ? TIMEZONE_OPTIONS
        : [...TIMEZONE_OPTIONS, { value: timezone, label: timezone }];

    return (
        <Row>
            <Field>
                <CelestialSelect
                    size={size}
                    value={timezone}
                    onChange={setTimezone}
                    options={options}
                    ariaLabel="시간대"
                />
            </Field>
            <DetectBtn
                type="button"
                onClick={() => setTimezone(detectTimeZone())}
                title="이 기기의 시간대로 맞춥니다"
            >
                자동
            </DetectBtn>
        </Row>
    );
}

const Row = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
`;

const Field = styled.div`
    width: 190px;
`;

const DetectBtn = styled.button`
    flex-shrink: 0;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary}40;
    color: ${p => p.theme.colors.textSecondary};
    font-family: inherit;
    font-size: 0.7rem;
    padding: 6px 9px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};
    }
`;
