import styled from "styled-components";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import { useRouter } from "next/navigation";
import { CategoryType } from "@/store/useCategoryStore";
import { Layers, Calendar, Kanban, Trophy } from "lucide-react";
import { useT } from "@/i18n/useT";

const Menu = (props: { width: number, categories: CategoryType[] }) => {
    const router = useRouter();
    const t = useT();

    return(
        <MenuWrapper>
            <SidebarMenuButton
                $height={30}
                $width={props.width - 40}
                label={t.sidebar.categories}
                onClick={() => { router.push("/category") }}
            >
                <Layers size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                $height={30}
                $width={props.width - 40}
                label={t.sidebar.calendar}
                onClick={() => { router.push("/calendar") }}
            >
                <Calendar size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                $height={30}
                $width={props.width - 40}
                label={t.sidebar.project}
                onClick={() => { router.push("/project") }}
            >
                <Kanban size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                $height={30}
                $width={props.width - 40}
                label={t.sidebar.challenge}
                onClick={() => { router.push("/challenge") }}
            >
                <Trophy size={26}/>
            </SidebarMenuButton>
        </MenuWrapper>
    )
}

const MenuWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
`

export default Menu;
