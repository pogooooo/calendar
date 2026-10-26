"use client";

import * as GemS from "./gem/GemDropdown.styles";
import * as React from "react";
import Select from "@/components/input/select/Select";
import type { DropdownProps } from "./Dropdown";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDropdown.styles";
import * as MapleS from "./maple/MapleDropdown.styles";
import * as OceanS from './ocean/OceanDropdown.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export default function DropdownView({
    value, options, onChange, placeholder, width, disabled,
}: DropdownProps) {
    const S = usePickTheme(STYLES);
    return (
        <S.Sized $width={width}>
            <Select
                value={value}
                onChange={onChange}
                options={options.map(o => ({ value: o.value, label: o.label, color: o.color }))}
                placeholder={placeholder}
                disabled={disabled}
            />
        </S.Sized>
    );
}
