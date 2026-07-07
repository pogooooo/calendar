"use client";

import * as React from 'react';
import { useTheme } from 'styled-components';
import CelestialDropdown from './celestial/CelestialDropdown';
import BotanicalDropdown from './botanical/BotanicalDropdown';

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

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName.startsWith('celestial')) {
        return <CelestialDropdown {...props} />;
    }
    if (themeName === 'botanical') {
        return <BotanicalDropdown {...props} />;
    }

    return <CelestialDropdown {...props} />;
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;