"use client";

import * as React from "react";
import styled from "styled-components";
import { useRouter, usePathname } from "next/navigation";
import { Home, Calendar, Kanban, Trophy, MoreHorizontal, Layers, Cake, Settings, MonitorDown, X } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isDesktopApp } from "@/lib/apiBase";
import { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT } from "@/styles/breakpoints";

export { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT };

export default function MobileTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const t = useT();
    const [more, setMore] = React.useState(false);
    const [showDownload, setShowDownload] = React.useState(false);

    React.useEffect(() => setShowDownload(!isDesktopApp()), []);
    React.useEffect(() => setMore(false), [pathname]);

    const tabs = [
        { path: "/", label: t.sidebar.home, icon: <Home size={19} /> },
        { path: "/calendar", label: t.sidebar.calendar, icon: <Calendar size={19} /> },
        { path: "/project", label: t.sidebar.project, icon: <Kanban size={19} /> },
        { path: "/challenge", label: t.sidebar.challenge, icon: <Trophy size={19} /> },
    ];

    const extra = [
        { path: "/category", label: t.sidebar.categories, icon: <Layers size={18} /> },
        { path: "/anniversary", label: t.sidebar.anniversary, icon: <Cake size={18} /> },
        { path: "/settings", label: t.sidebar.settings, icon: <Settings size={18} /> },
        ...(showDownload ? [{ path: "/download", label: t.sidebar.download, icon: <MonitorDown size={18} /> }] : []),
    ];

    const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname?.startsWith(p));
    const moreActive = extra.some(e => isActive(e.path));

    const go = (p: string) => {
        setMore(false);
        router.push(p);
    };

    return (
        <>
            {more && (
                <Sheet onClick={() => setMore(false)}>
                    <SheetBody onClick={(e) => e.stopPropagation()}>
                        <SheetHead>
                            <i />
                            {t.sidebar.more}
                            <CloseBtn onClick={() => setMore(false)} aria-label={t.widgetShell.close}>
                                <X size={16} />
                            </CloseBtn>
                        </SheetHead>
                        {extra.map(e => (
                            <SheetRow key={e.path} $on={!!isActive(e.path)} onClick={() => go(e.path)}>
                                {e.icon}
                                <span>{e.label}</span>
                            </SheetRow>
                        ))}
                    </SheetBody>
                </Sheet>
            )}

            <Bar role="navigation">
                {tabs.map(tab => (
                    <Tab key={tab.path} $on={!!isActive(tab.path)} onClick={() => go(tab.path)}>
                        {tab.icon}
                        <span>{tab.label}</span>
                    </Tab>
                ))}
                <Tab $on={moreActive || more} onClick={() => setMore(v => !v)}>
                    <MoreHorizontal size={19} />
                    <span>{t.sidebar.more}</span>
                </Tab>
            </Bar>
        </>
    );
}

const Bar = styled.nav`
    display: none;

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 60;
        height: calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        background: ${p => p.theme.colors.background};
        border-top: 1px solid ${p => p.theme.colors.primary}40;
    }
`;

const Tab = styled.button<{ $on: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 0;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    color: ${p => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};

    span {
        font-size: 0.6rem;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 6px;
        height: 6px;
        margin-left: -3px;
        transform: rotate(45deg) scale(${p => (p.$on ? 1 : 0)});
        background: ${p => p.theme.colors.primary};
        transition: transform 0.18s ease;
    }
`;

const Sheet = styled.div`
    position: fixed;
    inset: 0;
    z-index: 61;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
`;

const SheetBody = styled.div`
    width: 100%;
    background: ${p => p.theme.colors.background};
    border-top: 1px solid ${p => p.theme.colors.primary};
    padding: 0 0 calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px));
`;

const SheetHead = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px 12px;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 0.2em;
    color: ${p => p.theme.colors.primary};

    i {
        width: 7px;
        height: 7px;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme.colors.primary};
    }
`;

const CloseBtn = styled.button`
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: ${p => p.theme.colors.textSecondary};
    display: flex;
    padding: 4px;
`;

const SheetRow = styled.button<{ $on: boolean }>`
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    min-height: 52px;
    padding: 0 18px;
    background: none;
    border: none;
    border-bottom: 1px solid ${p => p.theme.colors.text}12;
    cursor: pointer;
    font-size: 0.9rem;
    text-align: left;
    color: ${p => (p.$on ? p.theme.colors.primary : p.theme.colors.text)};
`;
