import styled from "styled-components";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import { useRouter } from "next/navigation";
import { CategoryType } from "@/store/useCategoryStore";
import { Layers, Calendar, Kanban, Trophy } from "lucide-react";

const Menu = (props: { width: number, categories: CategoryType[] }) => {
    const router = useRouter();

    return(
        <MenuWrapper>
            <SidebarMenuButton
                $height={30}
                $width={props.width - 40}
                label="카테고리"
                onClick={() => { router.push("/category") }}
            >
                <Layers size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton
                $height={30}
                $width={props.width - 40}
                label="캘린더"
                onClick={() => { router.push("/calendar") }}
            >
                <Calendar size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton $height={30} $width={props.width - 40} label="프로젝트">
                <Kanban size={26}/>
            </SidebarMenuButton>

            <SidebarMenuButton $height={30} $width={props.width - 40} label="챌린지">
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