import styled from "styled-components";
import {useRouter} from "next/navigation";
import CelestialSidebarDesign from "@/assets/sidebarDesign/CelestialSidebarDesign";
import {useCallback, useEffect, useState} from "react";
import Profile from "./Profile"
import Menu from "./Menu"
import {useAuthFetch} from "@/hooks/AuthFetch";

const Celestial_SideBar = () => {
    const authFetch = useAuthFetch();

    const [screenHeight, setScreenHeight] = useState(0);
    const [width, setWidth] = useState(200);
    const [isResizing, setIsResizing] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setScreenHeight(window.screen.height);
        }

        const fetchCategories = async () => {
            try {
                const res = await authFetch("/api/category", {
                    method: "GET",
                    cache: 'no-store'
                });

                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        fetchCategories().then();
    }, []);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX;
                if (newWidth > 200 && newWidth < 600) {
                    setWidth(newWidth);
                }
            }
        }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);


    return(
        <SideBarWrapper $width={width} $isResizing={isResizing}>
            <Content>
                <Profile width={width} />

                <Menu width={width} categories={categories} />
            </Content>

            <SidebarContour $height={screenHeight} onMouseDown={startResizing}>
                <CelestialSidebarDesign></CelestialSidebarDesign>
            </SidebarContour>
        </SideBarWrapper>
    )
}

const SideBarWrapper = styled.div<{ $width: number, $isResizing: boolean }>`
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-shrink: 0;

    width: ${(props) => props.$width}px;
    transition: ${(props) => props.$isResizing ? 'none' : 'all 0.3s ease'};
    
    overflow-y: clip;
    padding: 0 20px 0 20px;
    margin-right: 50px;
    cursor: default;
    color: ${(props) => props.theme.colors.text};
    
    position: relative;
`

const Content = styled.div`
    z-index: 1;
`

const SidebarContour = styled.div<{ $height: number }>`
    height: ${(props) => props.$height ? `${props.$height}px` : '100vh'};
    position: absolute;
    right: -60px;
    
    cursor: col-resize;
    transition: filter 0.2s ease-in-out;
    &:hover {
        stroke: ${(props) => props.theme.colors.accent};
        filter: drop-shadow(0 0 5px ${(props) => props.theme.colors.primary});
    }

    user-select: none;
`

export default Celestial_SideBar
