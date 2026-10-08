"use client";

import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import useSettingStore from "@/store/useSettingStore";
import { TIMEZONE_OPTIONS, detectTimeZone, isValidTimeZone } from "@/lib/timezone";
import Select from "@/components/input/select/Select";
import { useT } from "@/i18n/useT";

export default function TimezoneSelect({ size = "md" }: { size?: "sm" | "md" }) {
    const t = useT();
    const locale = useSettingStore((s) => s.locale);
    const timezone = useSettingStore((s) => s.timezone);
    const setTimezone = useSettingStore((s) => s.setTimezone);

    const named = TIMEZONE_OPTIONS.map(o => ({ value: o.value, label: locale === "en" ? o.labelEn ?? o.label : o.label }));
    // 저장된 값이 목록에 없으면(직접 지정했거나 OS 값) 항목을 하나 덧붙여 표시한다
    const options = named.some(o => o.value === timezone) || !isValidTimeZone(timezone)
        ? named
        : [...named, { value: timezone, label: timezone }];

    return (
        <Row>
            <Field>
                <Select
                    size={size}
                    value={timezone}
                    onChange={setTimezone}
                    options={options}
                    ariaLabel={t.system.timezoneAria}
                />
            </Field>
            <DetectBtn
                type="button"
                onClick={() => setTimezone(detectTimeZone())}
                title={t.system.timezoneAutoHint}
            >
                {t.system.timezoneAuto}
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

    ${MOBILE} { min-height: 46px; padding: 0 12px; }
`;
