"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowUpRight } from "lucide-react";
import BaseModal from "@/components/modal/baseModal/BaseModal";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialQuickNavigation.styles";
import * as MapleS from "./maple/MapleQuickNavigation.styles";

const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };
export const OPEN_QUICK_NAVIGATION = "cronos:quick-navigation";
export const openQuickNavigation = () => window.dispatchEvent(new Event(OPEN_QUICK_NAVIGATION));

export default function QuickNavigation() {
    const S = usePickTheme(STYLES);
    const t = useT();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [selected, setSelected] = React.useState(0);
    const input = React.useRef<HTMLInputElement>(null);
    const items = [
        { path: '/', title: t.sidebar.home },
        { path: '/calendar', title: t.sidebar.calendar },
        { path: '/project', title: t.sidebar.project },
        { path: '/challenge', title: t.sidebar.challenge },
        { path: '/category', title: t.sidebar.categories },
        { path: '/anniversary', title: t.sidebar.anniversary },
        { path: '/settings', title: t.sidebar.settings },
    ].filter(item => item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    const go = (path: string) => { setOpen(false); router.push(path); };

    React.useEffect(() => {
        const show = () => { setQuery(''); setSelected(0); setOpen(true); };
        const key = (e: KeyboardEvent) => {
            if (e.isComposing || e.key.toLowerCase() !== 'k' || !(e.ctrlKey || e.metaKey)) return;
            // Keep other open editors intact; their Escape key closes their own dialog.
            if (document.querySelector('[role="dialog"]')) return;
            e.preventDefault(); show();
        };
        window.addEventListener(OPEN_QUICK_NAVIGATION, show);
        window.addEventListener('keydown', key);
        return () => { window.removeEventListener(OPEN_QUICK_NAVIGATION, show); window.removeEventListener('keydown', key); };
    }, []);
    React.useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [open]);
    React.useEffect(() => {
        if (open) document.getElementById(`quick-navigation-${selected}`)?.scrollIntoView({ block: 'nearest' });
    }, [open, selected, query]);

    return <BaseModal isOpen={open} onClose={() => setOpen(false)} ariaLabel={t.interaction.quickFind} maxWidth="480px">
        <S.SearchRow>
            <Search size={18} aria-hidden />
            <S.Input ref={input} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }} placeholder={t.interaction.quickFindPlaceholder} aria-label={t.interaction.quickFind} role="combobox" aria-autocomplete="list" aria-expanded aria-controls="quick-navigation-results" aria-activedescendant={items[selected] ? `quick-navigation-${selected}` : undefined}
                onKeyDown={e => {
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelected(value => items.length ? (value + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length : 0);
                    }
                    if (e.key === 'Enter' && items[selected]) { e.preventDefault(); go(items[selected].path); }
                }} />
            <S.Close type="button" onClick={() => setOpen(false)} aria-label={t.interaction.dismiss}><X size={18} /></S.Close>
        </S.SearchRow>
        <S.Results id="quick-navigation-results" role="listbox" aria-label={t.interaction.quickFind}>
            {items.map((item, i) => <S.Result key={item.path} id={`quick-navigation-${i}`} role="option" aria-selected={selected === i} $selected={selected === i} type="button" onClick={() => go(item.path)} onMouseEnter={() => setSelected(i)}><span>{item.title}</span><ArrowUpRight size={16} /></S.Result>)}
            {!items.length && <S.Empty>{t.interaction.noMatches}</S.Empty>}
        </S.Results>
    </BaseModal>;
}
