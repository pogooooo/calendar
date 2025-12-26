import styled from "styled-components";
import {useRouter} from "next/navigation";
import CelestialSidebarDesign from "@/components/svg/CelestialSidebarDesign";
import {useEffect, useState} from "react";
import useAuthStore from "@/store/auth/useAuthStore";

const Celestial_SideBar = () => {
    const router = useRouter();
    const [screenHeight, setScreenHeight] = useState(0);

    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setScreenHeight(window.screen.height);
            console.log("ScreenHeight", screen.height);
        }
    }, []);


    return(
        <SideBarWrapper>
            <Content>
                <Profile>
                    <Logo onClick={() => {router.push("/")}}>CRONOS</Logo>
                    <UserWrapper>
                        {/*Todo: 유저 프로필 사진 출력*/}
                        <UserName>{user?.name}님</UserName>
                    </UserWrapper>
                </Profile>
            </Content>
            <SidebarContour $height={screenHeight}>
                <CelestialSidebarDesign></CelestialSidebarDesign>
            </SidebarContour>
        </SideBarWrapper>
    )
}

const SideBarWrapper = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-shrink: 0;
    min-width: 160px;
    overflow-y: hidden;
    margin-left: 20px;
    cursor: default;
`

const Content = styled.div``

const Profile = styled.div``

const Logo = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.celestial_heading};
    font-size: ${(props) => props.theme.fontSizes.h3};
    
    margin-top: 30px;
    
    cursor: pointer;
`

const UserWrapper = styled.div`
        margin-top: 20px;
`

const UserName = styled.div``

const SidebarContour = styled.div<{ $height: number }>`
    height: ${(props) => props.$height ? `${props.$height}px` : '100vh'};
    display: flex;
    flex-direction: column;
`


export default Celestial_SideBar
