import styled from "styled-components";
import {useRouter} from "next/navigation";
import CelestialSidebarDesign from "@/components/svg/CelestialSidebarDesign";
import {useCallback, useEffect, useState} from "react";
import useAuthStore from "@/store/auth/useAuthStore";
import DefaultProfile from "@/components/svg/DefaultProfile";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import Home from "@/components/svg/Home"
import Setting from "@/components/svg/Setting";
import Category from "@/components/svg/Category";
import Todo from "@/components/svg/Todo";
import Project from "@/components/svg/Project";
import LoadMap from "@/components/svg/LoadMap";

const Celestial_SideBar = () => {
    const router = useRouter();
    const [screenHeight, setScreenHeight] = useState(0);
    const user = useAuthStore((state) => state.user)

    const [width, setWidth] = useState(200);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setScreenHeight(window.screen.height);
            console.log("ScreenHeight", screen.height);
        }
    }, []);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX;
                if (newWidth > 200 && newWidth < 600) {
                    setWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

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
                <Profile>
                    <Logo onClick={() => {router.push("/")}}>CRONOS</Logo>
                    <UserWrapper>
                        {user?.image ? (
                            <ProfileImage src={user.image} alt="프로필 이미지" />
                        ) : (
                            <DefaultProfile width={30} />
                        )}
                        <UserName>{user?.name}님</UserName>
                    </UserWrapper>
                    <SidebarMenuButton $height={30} $width={width-40} label="설정"><Setting width={26}/></SidebarMenuButton>
                    <SidebarMenuButton $height={30} $width={width-40} label="홈"><Home width={26} /></SidebarMenuButton>
                </Profile>

                <Menu>
                    <SidebarMenuButton $height={30} $width={width-40} label="카테고리"><Category width={26}/></SidebarMenuButton>
                    <SidebarMenuButton $height={30} $width={width-40} label="일정"><Todo width={26}/></SidebarMenuButton>
                    <SidebarMenuButton $height={30} $width={width-40} label="프로젝트"><Project width={26}/></SidebarMenuButton>
                    <SidebarMenuButton $height={30} $width={width-40} label="로드맵"><LoadMap width={26}/></SidebarMenuButton>
                </Menu>
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

const Profile = styled.div`
    & > * {
        margin-top: 10px;
    }
    
    display: flex;
    flex-direction: column;
    margin-bottom: 100px;
`

const Logo = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.celestial_heading};
    font-size: ${(props) => props.theme.fontSizes.h3};
    font-weight: bold;
    
    margin-top: 30px;
    
    cursor: pointer;
`

const UserWrapper = styled.div`
    margin: 20px 0 10px 0;
    display: flex;
    font-size: ${(props) => props.theme.fontSizes.body};
    align-items: center;`

const ProfileImage = styled.img``

const UserName = styled.div`
    margin-left: 10px;
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

const Menu = styled.div`
    & > * {
        margin-top: 10px;
    }
`

export default Celestial_SideBar
