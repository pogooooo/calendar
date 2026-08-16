"use client";

import * as React from 'react';
import CelestialDropdown from './celestial/CelestialDropdown';

export interface DropdownOption {
    label: string;
    value: string;
    color?: string;
}

export interface DropdownProps {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    width?: string;
    disabled?: boolean;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>((props, _ref) => {
    return <CelestialDropdown {...props} />;
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;