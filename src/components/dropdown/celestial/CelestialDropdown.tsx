"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as S from './CelestialDropdown.styles';
import { DropdownProps } from '../Dropdown';

export default function CelestialDropdown({
                                              value,
                                              options,
                                              onChange,
                                              placeholder = "선택하세요",
                                              width,
                                              disabled
                                          }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 현재 선택된 옵션 찾기
    const selectedOption = options.find(opt => opt.value === value);

    // 드롭다운 바깥 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <S.DropdownContainer ref={containerRef} $width={width}>
            <S.DropdownHeader
                $disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="content-wrapper">
                    {selectedOption?.color && <S.ColorDot $color={selectedOption.color} />}
                    <span className={!selectedOption ? "placeholder" : ""}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </S.DropdownHeader>

            {isOpen && !disabled && (
                <S.DropdownList>
                    {options.map((opt) => (
                        <S.DropdownItem
                            key={opt.value}
                            $selected={opt.value === value}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.color && <S.ColorDot $color={opt.color} />}
                            {opt.label}
                        </S.DropdownItem>
                    ))}
                </S.DropdownList>
            )}
        </S.DropdownContainer>
    );
}