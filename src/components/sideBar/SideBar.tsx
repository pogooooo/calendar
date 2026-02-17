"use client"

import {useTheme} from "styled-components";
import Profile from "@/components/sideBar/Profile";
import Menu from "@/components/sideBar/Menu";
import CelestialSidebarDesign from "@/assets/sidebarDesign/CelestialSidebarDesign";
import styled from "styled-components";
import useCategoryStore from "@/store/category/useCategoryStore";
import { useSidebarLogic } from "@/hooks/useSidebarLogic";

const Sidebar = () => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';
    const categories = useCategoryStore((state) => state.categories);

    const { width, isResizing, screenHeight, startResizing, sidebarRef } = useSidebarLogic();

    return(
        <SideBarWrapper ref={sidebarRef} $width={width} $isResizing={isResizing}>
            <Content>
                <Profile width={width} />
                <Menu width={width} categories={categories} />
            </Content>

            <SidebarContour $height={screenHeight} $isResizing={isResizing} onMouseDown={startResizing}>
                {themeName === 'celestial' && <CelestialSidebarDesign />}
            </SidebarContour>

            {isResizing && <ResizeOverlay />}
        </SideBarWrapper>
    )
}

const SideBarWrapper = styled.div<{ $width: number, $isResizing: boolean }>`
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-shrink: 0;
    width: ${(props) => props.$width}px;

    will-change: width;
    contain: layout;
    transform: translateZ(0);
    transition: ${(props) => props.$isResizing ? 'none' : 'width 0.3s ease-in-out'};
    
    overflow-y: clip;
    padding: 0 20px 0 20px;
    margin-right: 50px;
    cursor: default;
    color: ${(props) => props.theme.colors.text};
    position: relative;
    
    pointer-events: ${(props) => props.$isResizing ? 'none' : 'auto'};
`

const Content = styled.div`
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
        stroke: ${(props) => props.theme.colors.accent};
        filter: drop-shadow(0 0 5px ${(props) => props.theme.colors.primary});
    }

    &::before {
        content: "";
        position: absolute;
        left: 30px;
        width: 60px;
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
