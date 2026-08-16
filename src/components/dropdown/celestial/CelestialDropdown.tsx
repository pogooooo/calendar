"use client";

import * as React from "react";
import styled from "styled-components";
import CelestialSelect from "@/components/input/select/CelestialSelect";
import type { DropdownProps } from "../Dropdown";

export default function CelestialDropdown({
    value, options, onChange, placeholder, width, disabled,
}: DropdownProps) {
    return (
        <Sized $width={width}>
            <CelestialSelect
                value={value}
                onChange={onChange}
                options={options.map(o => ({ value: o.value, label: o.label, color: o.color }))}
                placeholder={placeholder}
                disabled={disabled}
            />
        </Sized>
    );
}

const Sized = styled.div<{ $width?: string }>`
    width: ${p => p.$width ?? "100%"};
    min-width: 0;
`;
