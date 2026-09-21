import { useEffect, useState } from "react";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import { useRouter, usePathname } from "next/navigation";
import { Layers, Calendar, Kanban, Trophy, Cake, MonitorDown } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isDesktopApp } from "@/lib/apiBase";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSideBar.styles";
import * as MapleS from "./maple/MapleSideBar.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const Menu = () => {
    const S = usePickTheme(STYLES);
    const router = useRouter();
    const pathname = usePathname();
    const t = useT();

    // 데스크톱 앱에서는 이미 설치된 상태라 안내가 필요 없다.
    const [showDownload, setShowDownload] = useState(false);
    useEffect(() => setShowDownload(!isDesktopApp()), []);

    const items = [
        { path: "/category", label: t.sidebar.categories, icon: <Layers size={26} /> },
        { path: "/calendar", label: t.sidebar.calendar, icon: <Calendar size={26} /> },
        { path: "/project", label: t.sidebar.project, icon: <Kanban size={26} /> },
        { path: "/challenge", label: t.sidebar.challenge, icon: <Trophy size={26} /> },
        { path: "/anniversary", label: t.sidebar.anniversary, icon: <Cake size={26} /> },
        ...(showDownload ? [{ path: "/download", label: t.sidebar.download, icon: <MonitorDown size={26} /> }] : []),
    ];

    return(
        <S.MenuWrapper>
            <S.Divider aria-hidden><i /></S.Divider>

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
