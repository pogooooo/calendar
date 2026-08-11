import { useEffect, useState } from "react";
import styled from "styled-components";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import { useRouter, usePathname } from "next/navigation";
import { CategoryType } from "@/store/useCategoryStore";
import { Layers, Calendar, Kanban, Trophy, Cake, MonitorDown } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isDesktopApp } from "@/lib/apiBase";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const Menu = (props: { categories: CategoryType[] }) => {
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
        <MenuWrapper>
            <Divider aria-hidden><i /></Divider>

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
        </MenuWrapper>
    )
}

const MenuWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
`

const Divider = styled.div`
    position: relative;
    height: 1px;
    margin: 18px 8px 6px;
    background: linear-gradient(to right, transparent, ${(props) => props.theme.colors.primary}66, transparent);

    i {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 5px;
        height: 5px;
        transform: translate(-50%, -50%) rotate(45deg);
        border: 1px solid ${(props) => props.theme.colors.primary};
        background: ${(props) => props.theme.colors.background};
    }
`

export default Menu;
