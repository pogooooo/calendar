"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import * as S from "./CelestialSelect.styles";

export interface SelectOption {
    value: string;
    label: string;
    /** 카테고리처럼 색이 있는 항목이면 마름모 대신 색 점을 보여준다 */
    color?: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    size?: "sm" | "md";
    ariaLabel?: string;
    className?: string;
}

const MENU_GAP = 4;

export default function CelestialSelect({
    value, onChange, options, placeholder = "선택하세요",
    disabled, size = "md", ariaLabel, className,
}: Props) {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [open, setOpen] = React.useState(false);
    const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);

    const selected = options.find(o => o.value === value) ?? null;

    const place = React.useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ top: rect.bottom + MENU_GAP, left: rect.left, width: rect.width });
    }, []);

    // 모달 안에서 잘리지 않도록 화면 기준으로 띄우고, 아래가 좁으면 위로 뒤집는다
    React.useLayoutEffect(() => {
        if (!open) return;
        place();
    }, [open, place]);

    React.useLayoutEffect(() => {
        if (!open || !pos) return;
        const el = menuRef.current;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!el || !rect) return;

        const h = el.offsetHeight;
        let top = rect.bottom + MENU_GAP;
        if (top + h > window.innerHeight - 8) {
            top = rect.top - h - MENU_GAP > 8
                ? rect.top - h - MENU_GAP
                : Math.max(8, window.innerHeight - h - 8);
        }
        setPos(p => (p && p.top === top ? p : p ? { ...p, top } : p));
    }, [open, pos]);

    React.useEffect(() => {
        if (!open) return;

        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                // 목록만 닫고 뒤의 모달은 열어 둔다
                e.stopImmediatePropagation();
                e.preventDefault();
                setOpen(false);
            }
        };
        const reposition = () => place();

        window.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey, true);
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        return () => {
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey, true);
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
        };
    }, [open, place]);

    const move = (delta: number) => {
        const i = options.findIndex(o => o.value === value);
        const next = options[Math.min(options.length - 1, Math.max(0, (i < 0 ? 0 : i) + delta))];
        if (next) onChange(next.value);
    };

    const onTriggerKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) { setOpen(true); return; }
            move(e.key === "ArrowDown" ? 1 : -1);
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(v => !v);
        }
    };

    const mark = (o: SelectOption | null, on: boolean) =>
        o?.color
            ? <S.Dot $color={o.color} />
            : <S.Diamond $on={on} />;

    return (
        <S.Wrapper className={className}>
            <S.Trigger
                ref={triggerRef}
                type="button"
                $size={size}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onTriggerKey}
            >
                {mark(selected, true)}
                <S.Value $placeholder={!selected}>{selected ? selected.label : placeholder}</S.Value>
                <S.Chev $open={open} aria-hidden="true">▾</S.Chev>
            </S.Trigger>

            {open && pos && typeof document !== "undefined" && createPortal(
                <S.Menu
                    ref={menuRef}
                    role="listbox"
                    style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
                >
                    {options.map(o => {
                        const on = o.value === value;
                        return (
                            <S.Item
                                key={o.value}
                                type="button"
                                role="option"
                                aria-selected={on}
                                $on={on}
                                onClick={() => { onChange(o.value); setOpen(false); }}
                            >
                                {mark(o, on)}
                                <S.Value>{o.label}</S.Value>
                                {on && <S.Tick aria-hidden="true">✦</S.Tick>}
                            </S.Item>
                        );
                    })}
                </S.Menu>,
                document.body,
            )}
        </S.Wrapper>
    );
}
