import { useEffect, useState } from "react";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import { useRouter, usePathname } from "next/navigation";
import { Layers, Calendar, Kanban, Trophy, Cake, MonitorDown, Search } from "lucide-react";
import { openQuickNavigation } from "@/components/navigation/QuickNavigation";
import NavIcon from "@/assets/NavIcon";
import { useT } from "@/i18n/useT";
import { isDesktopApp } from "@/lib/apiBase";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSideBar.styles";
import * as MapleS from "./maple/MapleSideBar.styles";
import * as OceanS from './ocean/OceanSideBar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const Menu = () => {
    const S = usePickTheme(STYLES);
    const router = useRouter();
    const pathname = usePathname();
    const t = useT();

    // 데스크톱 앱에서는 이미 설치된 상태라 안내가 필요 없다.
    const [showDownload, setShowDownload] = useState(false);
    useEffect(() => setShowDownload(!isDesktopApp()), []);

    // 아이콘은 갈래마다 다르다 — Celestial 은 lucide 선 아이콘, Maple 은 먹 아이콘 시트(D1)
    const items = [
        { path: "/category", label: t.sidebar.categories, icon: <NavIcon name="category" size={26} fallback={<Layers size={26} />} /> },
        { path: "/calendar", label: t.sidebar.calendar, icon: <NavIcon name="calendar" size={26} fallback={<Calendar size={26} />} /> },
        { path: "/project", label: t.sidebar.project, icon: <NavIcon name="project" size={26} fallback={<Kanban size={26} />} /> },
        { path: "/challenge", label: t.sidebar.challenge, icon: <NavIcon name="challenge" size={26} fallback={<Trophy size={26} />} /> },
        { path: "/anniversary", label: t.sidebar.anniversary, icon: <NavIcon name="anniversary" size={26} fallback={<Cake size={26} />} /> },
        ...(showDownload ? [{ path: "/download", label: t.sidebar.download, icon: <NavIcon name="download" size={26} fallback={<MonitorDown size={26} />} /> }] : []),
    ];

    return(
        <S.MenuWrapper>
            <S.Divider aria-hidden><i /></S.Divider>
            <SidebarMenuButton label={`${t.interaction.quickFind} · Ctrl K`} onClick={openQuickNavigation}><Search size={24} /></SidebarMenuButton>

            {items.map((item, i) => (
                <SidebarMenuButton
                    key={item.path}
                    label={item.label}
                    $numeral={ROMAN[i] ?? String(i + 1)}
                    $active={pathname?.startsWith(item.path)}
                    onClick={() => { router.push(item.path) }}
                >
                    {item.icon}
                </SidebarMenuButton>
            ))}
        </S.MenuWrapper>
    )
}

export default Menu;
