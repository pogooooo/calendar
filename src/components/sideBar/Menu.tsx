import { useEffect, useState } from "react";
import styled from "styled-components";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import { useRouter } from "next/navigation";
import { CategoryType } from "@/store/useCategoryStore";
import { Layers, Calendar, Kanban, Trophy, Cake, MonitorDown } from "lucide-react";
import { useT } from "@/i18n/useT";
import { isDesktopApp } from "@/lib/apiBase";

const Menu = (props: { categories: CategoryType[] }) => {
    const router = useRouter();
    const t = useT();

    // 데스크톱 앱에서는 이미 설치된 상태라 안내가 필요 없다.
    const [showDownload, setShowDownload] = useState(false);
    useEffect(() => setShowDownload(!isDesktopApp()), []);

    return(
        <MenuWrapper>
            <SidebarMenuButton
                label={t.sidebar.categories}
                onClick={() => { router.push("/category") }}
            >
                <Layers size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                label={t.sidebar.calendar}
                onClick={() => { router.push("/calendar") }}
            >
                <Calendar size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                label={t.sidebar.project}
                onClick={() => { router.push("/project") }}
            >
                <Kanban size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                label={t.sidebar.challenge}
                onClick={() => { router.push("/challenge") }}
            >
                <Trophy size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                label={t.sidebar.anniversary}
                onClick={() => { router.push("/anniversary") }}
            >
                <Cake size={26}/>
            </SidebarMenuButton>

            {showDownload && (
                <SidebarMenuButton
                    label={t.sidebar.download}
                    onClick={() => { router.push("/download") }}
                >
                    <MonitorDown size={26}/>
                </SidebarMenuButton>
            )}
        </MenuWrapper>
    )
}

const MenuWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
`

export default Menu;
