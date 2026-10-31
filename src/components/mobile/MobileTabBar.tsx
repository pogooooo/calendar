"use client";

import * as GemS from "./gem/GemMobileTabBar.styles";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Calendar, Kanban, Trophy, MoreHorizontal, Layers, Cake, Settings, MonitorDown, X, Search, LogOut } from "lucide-react";
import { openQuickNavigation } from "@/components/navigation/QuickNavigation";
import useAuthStore from "@/store/useAuthStore";
import NavIcon from "@/assets/NavIcon";
import { useT } from "@/i18n/useT";
import { isDesktopApp } from "@/lib/apiBase";
import { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT } from "@/styles/breakpoints";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialMobileTabBar.styles";
import * as MapleS from "./maple/MapleMobileTabBar.styles";
import * as OceanS from './ocean/OceanMobileTabBar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT };

export default function MobileTabBar({activePath}:{activePath?:string} = {}) {
    const S = usePickTheme(STYLES);
    const router = useRouter();
    const routePathname = usePathname();
    const pathname = activePath ?? routePathname;
    const t = useT();
    const [more, setMore] = React.useState(false);
    const [showDownload, setShowDownload] = React.useState(false);
    const sheetRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(()=>{
        if(!more) return;
        const previous=document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const sheet=sheetRef.current;
        if(!sheet) return;
        sheet.focus({preventScroll:true});
        const onKey=(event:KeyboardEvent)=>{
            const dialogs=document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
            if(event.defaultPrevented || dialogs[dialogs.length-1]!==sheet) return;
            if(event.key==='Escape') {event.preventDefault();setMore(false);return;}
            if(event.key!=='Tab') return;
            const buttons=Array.from(sheet.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
            const first=buttons[0],last=buttons[buttons.length-1];
            if(!first) {event.preventDefault();return;}
            if(event.shiftKey && (document.activeElement===first || document.activeElement===sheet)) {event.preventDefault();last.focus();}
            else if(!event.shiftKey && (document.activeElement===last || document.activeElement===sheet)) {event.preventDefault();first.focus();}
        };
        window.addEventListener('keydown',onKey);
        return ()=>{window.removeEventListener('keydown',onKey);if(previous?.isConnected) previous.focus({preventScroll:true});};
    },[more]);

    React.useEffect(() => setShowDownload(!isDesktopApp()), []);
    React.useEffect(() => setMore(false), [pathname]);

    // 아이콘은 갈래마다 다르다 — Celestial 은 lucide 선 아이콘, Maple 은 먹 아이콘 시트(D1)
    const tabs = [
        { path: "/", label: t.sidebar.home, icon: <NavIcon name="home" size={19} fallback={<Home size={19} />} /> },
        { path: "/calendar", label: t.sidebar.calendar, icon: <NavIcon name="calendar" size={19} fallback={<Calendar size={19} />} /> },
        { path: "/project", label: t.sidebar.project, icon: <NavIcon name="project" size={19} fallback={<Kanban size={19} />} /> },
        { path: "/challenge", label: t.sidebar.challenge, icon: <NavIcon name="challenge" size={19} fallback={<Trophy size={19} />} /> },
    ];

    const extra = [
        { path: "/category", label: t.sidebar.categories, icon: <NavIcon name="category" size={18} fallback={<Layers size={18} />} /> },
        { path: "/anniversary", label: t.sidebar.anniversary, icon: <NavIcon name="anniversary" size={18} fallback={<Cake size={18} />} /> },
        { path: "/settings", label: t.sidebar.settings, icon: <NavIcon name="settings" size={18} fallback={<Settings size={18} />} /> },
        ...(showDownload ? [{ path: "/download", label: t.sidebar.download, icon: <NavIcon name="download" size={18} fallback={<MonitorDown size={18} />} /> }] : []),
    ];

    const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname?.startsWith(p));
    const moreActive = extra.some(e => isActive(e.path));

    const go = (p: string) => {
        setMore(false);
        router.push(p);
    };

    // 로그아웃은 사이드바의 프로필 메뉴에만 있었는데, 폰에서는 사이드바를 감춘다 — 폰(앱)에서는 로그아웃할 길이 아예 없었다
    const logout = useAuthStore((s) => s.logout);
    const handleLogout = async () => {
        setMore(false);
        await logout();
        router.push("/signIn");
    };

    return (
        <>
            {more && (
                <S.Sheet onClick={() => setMore(false)}>
                    <S.SheetBody ref={sheetRef} data-mobile-more role="dialog" aria-modal="true" aria-label={t.sidebar.more} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
                        <S.SheetHead>
                            <i />
                            {t.sidebar.more}
                            <S.CloseBtn data-more-close onClick={() => setMore(false)} aria-label={t.widgetShell.close}>
                                <X size={16} />
                            </S.CloseBtn>
                        </S.SheetHead>
                        {extra.map(e => (
                            <S.SheetRow key={e.path} $on={!!isActive(e.path)} onClick={() => go(e.path)}>
                                {e.icon}
                                <span>{e.label}</span>
                            </S.SheetRow>
                        ))}
                        <S.SheetRow $on={false} onClick={() => { setMore(false); openQuickNavigation(); }}><Search size={18} /><span>{t.interaction.quickFind}</span></S.SheetRow>
                        <S.SheetRow $on={false} onClick={() => { void handleLogout(); }}><LogOut size={18} /><span>{t.sidebar.logout}</span></S.SheetRow>
                    </S.SheetBody>
                </S.Sheet>
            )}

            <S.Bar data-mobile-nav role="navigation" aria-label="CRONOS">
                {tabs.map(tab => (
                    <S.Tab key={tab.path} aria-current={isActive(tab.path) ? "page" : undefined} $on={!!isActive(tab.path)} onClick={() => go(tab.path)}>
                        {tab.icon}
                        <span>{tab.label}</span>
                    </S.Tab>
                ))}
                <S.Tab aria-expanded={more} $on={moreActive || more} onClick={() => setMore(v => !v)}>
                    <MoreHorizontal size={19} />
                    <span>{t.sidebar.more}</span>
                </S.Tab>
            </S.Bar>
        </>
    );
}
