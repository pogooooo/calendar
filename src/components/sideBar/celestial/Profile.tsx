import styled from "styled-components";
import DefaultProfile from "@/assets/icons/DefaultProfile";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import Setting from "@/assets/icons/Setting";
import Home from "@/assets/icons/Home";
import useAuthStore from "@/store/auth/useAuthStore";
import {useRouter} from "next/navigation";

const Profile = (props: {width: number}) => {
    const user = useAuthStore((state) => state.user)
    const router = useRouter();

    return(
        <ProfileWrapper>
            <Logo onClick={() => {router.push("/")}}>CRONOS</Logo>
            <UserWrapper>
                {user?.image ? (
                    <ProfileImage src={user.image} alt="프로필 이미지" />
                ) : (
                    <DefaultProfile width={30} />
                )}
                <UserName>{user?.name}님</UserName>
            </UserWrapper>

            <SidebarMenuButton $height={30} $width={props.width-40} label="설정"><Setting width={26}/></SidebarMenuButton>

            <SidebarMenuButton $height={30} $width={props.width-40} label="홈" onClick={() => {router.push("/")}}>
                <Home width={26} />
            </SidebarMenuButton>
        </ProfileWrapper>
    )
}

const ProfileWrapper = styled.div`
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

export default Profile