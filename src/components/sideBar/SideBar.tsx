"use client"

import { useState, type ComponentType } from "react";
import Profile from "@/components/sideBar/Profile";
import Menu from "@/components/sideBar/Menu";
import CelestialSidebarDesign from "@/assets/sidebarDesign/CelestialSidebarDesign";
import MapleSidebarDesign from "@/assets/sidebarDesign/MapleSidebarDesign";
import { useSidebarLogic } from "@/hooks/useSidebarLogic";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSideBar.styles";
import * as MapleS from "./maple/MapleSideBar.styles";
import * as OceanS from './ocean/OceanSideBar.styles';
import OceanSidebarDesign from '@/assets/sidebarDesign/OceanSidebarDesign';
import * as GemS from "./gem/GemSideBar.styles";
import GemGeodeSidebar from "./gem/GemGeodeSidebar";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS };
const NoSurface = () => null;
const SURFACES: ThemeImpls<ComponentType> = { celestial: NoSurface, maple: NoSurface, ocean: NoSurface, gem: GemGeodeSidebar };

const Sidebar = ({ activePath }: { activePath?: string }) => {
    const S = usePickTheme(STYLES);
    const Surface = usePickTheme(SURFACES);
    // 옆선 장식은 테마마다 다른 그림이다.
    const SidebarDesign = usePickTheme({ celestial: CelestialSidebarDesign, maple: MapleSidebarDesign, ocean: OceanSidebarDesign, gem: null });

    const { width, isResizing, screenHeight, startResizing, sidebarRef } = useSidebarLogic();

    const [isContourHovered, setIsContourHovered] = useState(false);

    return(
        <S.SideBarWrapper data-desktop-sidebar ref={sidebarRef} $width={width} $isResizing={isResizing}>
            <S.Content>
                <Profile activePath={activePath} />
                <Menu activePath={activePath} />
            </S.Content>
            <Surface />

            <S.SidebarContour
                $height={screenHeight}
                $isResizing={isResizing}
                onMouseDown={startResizing}
                onMouseEnter={() => setIsContourHovered(true)}
                onMouseLeave={() => setIsContourHovered(false)}
            >
                {SidebarDesign && <SidebarDesign isHovered={isContourHovered} />}
            </S.SidebarContour>

            {isResizing && <S.ResizeOverlay />}
        </S.SideBarWrapper>
    )
}

export default Sidebar
