"use client";

import * as React from "react";
import CelestialSelect from "@/components/input/select/CelestialSelect";
import type { DropdownProps } from "../Dropdown";
import * as S from "./CelestialDropdown.styles";

export default function CelestialDropdown({
    value, options, onChange, placeholder, width, disabled,
}: DropdownProps) {
    return (
        <S.Sized $width={width}>
            <CelestialSelect
                value={value}
                onChange={onChange}
                options={options.map(o => ({ value: o.value, label: o.label, color: o.color }))}
                placeholder={placeholder}
                disabled={disabled}
            />
        </S.Sized>
    );
}
