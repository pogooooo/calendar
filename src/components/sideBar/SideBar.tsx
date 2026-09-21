"use client"

import { useState } from "react";
import Profile from "@/components/sideBar/Profile";
import Menu from "@/components/sideBar/Menu";
import CelestialSidebarDesign from "@/assets/sidebarDesign/CelestialSidebarDesign";
import MapleSidebarDesign from "@/assets/sidebarDesign/MapleSidebarDesign";
import { useSidebarLogic } from "@/hooks/useSidebarLogic";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSideBar.styles";
import * as MapleS from "./maple/MapleSideBar.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

const Sidebar = () => {
    const S = usePickTheme(STYLES);
    // 옆선 장식은 테마마다 다른 그림이다.
    const SidebarDesign = usePickTheme({ celestial: CelestialSidebarDesign, maple: MapleSidebarDesign });

    const { width, isResizing, screenHeight, startResizing, sidebarRef } = useSidebarLogic();

    const [isContourHovered, setIsContourHovered] = useState(false);

    return(
        <S.SideBarWrapper ref={sidebarRef} $width={width} $isResizing={isResizing}>
            <S.Content>
                <Profile />
                <Menu />
            </S.Content>

            <S.SidebarContour
                $height={screenHeight}
                $isResizing={isResizing}
                onMouseDown={startResizing}
                onMouseEnter={() => setIsContourHovered(true)}
                onMouseLeave={() => setIsContourHovered(false)}
            >
                <SidebarDesign isHovered={isContourHovered} />
            </S.SidebarContour>

            {isResizing && <S.ResizeOverlay />}
        </S.SideBarWrapper>
    )
}

export default Sidebar
