"use client";

import DropdownView from './DropdownView';

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

/* forwardRef 였는데 ref 를 받지도 넘기지도 않아 React 가 매번 경고했다. 아무도 ref 를 주지 않으니 평범한 컴포넌트로 */
export default function Dropdown(props: DropdownProps) {
    return <DropdownView {...props} />;
}