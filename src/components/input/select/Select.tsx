"use client";

import { ControlSeal, CornerStars, MenuCrown } from "@/components/ornament/celestial/ControlOrnaments";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSelect.styles";
import * as MapleS from "./maple/MapleSelect.styles";
import * as OceanS from './ocean/OceanSelect.styles';
import styled from "styled-components";
import { gemField, gemPanel } from "@/features/gem/GemLive.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const GemTrigger = styled(OceanS.Trigger)`
    ${gemField}
    padding-inline: 13px;
    &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
`;
const GemMenu = styled(OceanS.Menu)`${gemPanel} backdrop-filter: none;`;
const GemItem = styled(OceanS.Item)`
    border-radius: var(--gem-radius);
    &[aria-selected="true"] { background: color-mix(in srgb, ${({ theme }) => theme.colors.primary} 16%, transparent); }
`;
const STYLES: ThemeImpls<typeof CelestialS> = {
    celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: { ...OceanS, Trigger: GemTrigger, Menu: GemMenu, Item: GemItem },
};

export interface SelectOption {
    value: string;
    label: string;
    /** 카테고리처럼 색이 있는 항목이면 마름모 대신 색 점을 보여준다 */
    color?: string;
    disabled?: boolean;
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

export default function Select({
    value, onChange, options, placeholder,
    disabled, size = "md", ariaLabel, className,
}: Props) {
    const S = usePickTheme(STYLES);
    const celestial = S === CelestialS;
    const listId = React.useId();
    const t = useT();
    const hint = placeholder ?? t.form.choose;
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [open, setOpen] = React.useState(false);
    const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);

    const selected = options.find(o => o.value === value) ?? null;

    const place = React.useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = celestial ? Math.min(rect.width, window.innerWidth - 16) : rect.width;
        const left = celestial ? Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) : rect.left;
        setPos({ top: rect.bottom + MENU_GAP, left, width });
    }, [celestial]);

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
                if (celestial) triggerRef.current?.focus({ preventScroll: true });
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
    }, [open, place, celestial]);

    const positioned = pos !== null;
    React.useLayoutEffect(() => {
        if (!celestial || !open || !positioned) return;
        const row = menuRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
        const list = row?.parentElement;
        if (!row || !list) return;
        const bounds = row.getBoundingClientRect();
        const viewport = list.getBoundingClientRect();
        if (bounds.top < viewport.top) list.scrollTop += bounds.top - viewport.top;
        else if (bounds.bottom > viewport.bottom) list.scrollTop += bounds.bottom - viewport.bottom;
    }, [celestial, open, positioned, value]);

    const move = (delta: number) => {
        const enabled = options.filter(o => !o.disabled);
        const i = enabled.findIndex(o => o.value === value);
        const start = celestial && i < 0 ? (delta > 0 ? -1 : enabled.length) : Math.max(0, i);
        const next = enabled[Math.min(enabled.length - 1, Math.max(0, start + delta))];
        if (next) onChange(next.value);
    };

    const onTriggerKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) { setOpen(true); return; }
            move(e.key === "ArrowDown" ? 1 : -1);
        } else if (celestial && e.key === "Tab" && open) {
            setOpen(false);
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(v => !v);
        }
    };

    const mark = (o: SelectOption | null, on: boolean) =>
        o?.color
            ? <S.Dot $color={o.color} />
            : <S.Diamond $on={on} />;

    const items = open && options.map(o => {
        const on = o.value === value;
        return (
            <S.Item
                key={o.value}
                type="button"
                role="option"
                aria-selected={on}
                disabled={o.disabled}
                tabIndex={celestial ? -1 : undefined}
                $on={on}
                onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    if (celestial) triggerRef.current?.focus({ preventScroll: true });
                }}
            >
                {celestial && !o.color ? <ControlSeal kind="orbit" size={15} /> : mark(o, on)}
                <S.Value>{o.label}</S.Value>
                {celestial ? <span aria-hidden="true" className="ce-choice" /> : on && <S.Tick aria-hidden="true">✦</S.Tick>}
            </S.Item>
        );
    });

    return (
        <S.Wrapper className={className}>
            <S.Trigger
                ref={triggerRef}
                type="button"
                $size={size}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onTriggerKey}
            >
                {celestial && <ControlSeal kind="orbit" size={19} />}
                {(!celestial || selected?.color) && mark(selected, true)}
                <S.Value $placeholder={!selected}>{selected ? selected.label : hint}</S.Value>
                <S.Chev $open={open} aria-hidden="true">{celestial ? <ChevronDown size={16} focusable="false" /> : "▾"}</S.Chev>
            </S.Trigger>

            {open && pos && typeof document !== "undefined" && createPortal(
                <S.Menu
                    ref={menuRef}
                    role="listbox"
                    id={listId}
                    aria-label={ariaLabel}
                    style={{ top: pos.top, left: pos.left, ...(celestial ? { width: pos.width } : { minWidth: pos.width }) }}
                >
                    {celestial && <><CornerStars four /><MenuCrown /></>}
                    {celestial ? <div className="ce-list" role="presentation">{items}</div> : items}
                </S.Menu>,
                document.body,
            )}
        </S.Wrapper>
    );
}
