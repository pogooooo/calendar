"use client"

import { useState } from "react";
import { usePickTheme } from "@/styles/themed";
import Profile from "@/components/sideBar/Profile";
import Menu from "@/components/sideBar/Menu";
import CelestialSidebarDesign from "@/assets/sidebarDesign/CelestialSidebarDesign";
import MapleSidebarDesign from "@/assets/sidebarDesign/MapleSidebarDesign";
import styled from "styled-components";
import { useSidebarLogic } from "@/hooks/useSidebarLogic";

const Sidebar = () => {
    // 옆선 장식은 테마마다 다른 그림이다.
    const SidebarDesign = usePickTheme({ celestial: CelestialSidebarDesign, maple: MapleSidebarDesign });

    const { width, isResizing, screenHeight, startResizing, sidebarRef } = useSidebarLogic();

    const [isContourHovered, setIsContourHovered] = useState(false);

    return(
        <SideBarWrapper ref={sidebarRef} $width={width} $isResizing={isResizing}>
            <Content>
                <Profile />
                <Menu />
            </Content>

            <SidebarContour
                $height={screenHeight}
                $isResizing={isResizing}
                onMouseDown={startResizing}
                onMouseEnter={() => setIsContourHovered(true)}
                onMouseLeave={() => setIsContourHovered(false)}
            >
                <SidebarDesign isHovered={isContourHovered} />
            </SidebarContour>

            {isResizing && <ResizeOverlay />}
        </SideBarWrapper>
    )
}

const SideBarWrapper = styled.div<{ $width: number, $isResizing: boolean }>`
    background-color: ${(props) => props.theme.colors.background};
    display: flex;
    flex-shrink: 0;
    width: ${(props) => props.$width}px;

    will-change: width;
    contain: layout style;
    container-type: inline-size;
    transform: translateZ(0);
    transition: ${(props) => props.$isResizing ? 'none' : 'width 0.15s ease-out'};
    
    padding: 0 20px 0 20px;
    margin-right: 50px;
    cursor: default;
    color: ${(props) => props.theme.colors.text};
    position: relative;
    
    pointer-events: ${(props) => props.$isResizing ? 'none' : 'auto'};
`

const Content = styled.div`
    flex: 1;
    min-width: 0;
    z-index: 1;
`

const SidebarContour = styled.div<{ $height: number, $isResizing: boolean }>`
    height: ${(props) => props.$height ? `${props.$height}px` : '100vh'};
    position: absolute;
    right: -60px;
    
    cursor: col-resize;
    transition: filter 0.2s ease-in-out;
    pointer-events: auto;
    
    &:hover {
        stroke: ${(props) => props.theme.colors.primary};
    }

    &::before {
        content: "";
        position: absolute;
        left: 58px;
        width: 90px;
        height: 100%;
        background: transparent;
    }

    user-select: none;
`

const ResizeOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    cursor: col-resize;
    background: transparent;
`

export default Sidebar
