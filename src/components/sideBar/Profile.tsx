"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import DefaultProfile from "@/assets/icons/DefaultProfile";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import Setting from "@/assets/icons/Setting";
import Home from "@/assets/icons/Home";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut, UserCog, ChevronDown } from "lucide-react";
import { useT } from "@/i18n/useT";

const Profile = (props: { width: number }) => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    const t = useT();
    const [open, setOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        router.push("/login");
    };

    return (
        <ProfileWrapper>
            <Logo onClick={() => { router.push("/") }}>CRONOS</Logo>

            <UserWrapper ref={popupRef}>
                <UserClickable onClick={() => setOpen((v) => !v)} $open={open}>
                    {user?.image ? (
                        <ProfileImage src={user.image} alt="profile" />
                    ) : (
                        <DefaultProfile width={30} />
                    )}
                    <UserName>{user?.name}{t.sidebar.userSuffix}</UserName>
                    <ChevronDown
                        size={14}
                        style={{
                            marginLeft: "auto",
                            flexShrink: 0,
                            transition: "transform 0.2s",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            opacity: 0.6,
                        }}
                    />
                </UserClickable>

                {open && (
                    <ProfilePopup>
                        <PopupHeader>
                            <PopupName>{user?.name}</PopupName>
                            <PopupEmail>{user?.email}</PopupEmail>
                        </PopupHeader>
                        <PopupDivider />
                        <PopupItem
                            onClick={() => {
                                setOpen(false);
                                router.push("/settings?tab=account");
                            }}
                        >
                            <UserCog size={15} />
                            <span>{t.sidebar.memberManagement}</span>
                        </PopupItem>
                        <PopupDivider />
                        <PopupItem $danger onClick={handleLogout}>
                            <LogOut size={15} />
                            <span>{t.sidebar.logout}</span>
                        </PopupItem>
                    </ProfilePopup>
                )}
            </UserWrapper>

            <SidebarMenuButton $height={30} $width={props.width - 40} label={t.sidebar.settings} onClick={() => { router.push("/settings") }}>
                <Setting width={26} />
            </SidebarMenuButton>

            <SidebarMenuButton $height={30} $width={props.width - 40} label={t.sidebar.home} onClick={() => { router.push("/") }}>
                <Home width={26} />
            </SidebarMenuButton>
        </ProfileWrapper>
    );
};

const ProfileWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
    display: flex;
    flex-direction: column;
    margin-bottom: 100px;
`;

const Logo = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: ${(props) => props.theme.fontSizes.h3};
    margin-top: 30px;
    cursor: pointer;
`;

const UserWrapper = styled.div`
    position: relative;
    margin: 20px 0 10px 0;
`;

const UserClickable = styled.div<{ $open: boolean }>`
    display: flex;
    font-size: ${(props) => props.theme.fontSizes.body};
    align-items: center;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.$open
        ? props.theme.colors.primary + "60"
        : "transparent"};
    background: ${(props) => props.$open
        ? props.theme.colors.primary + "12"
        : "transparent"};
    transition: background 0.15s, border-color 0.15s;
    user-select: none;

    &:hover {
        background: ${(props) => props.theme.colors.primary}12;
        border-color: ${(props) => props.theme.colors.primary}40;
    }
`;

const ProfileImage = styled.img`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
`;

const UserName = styled.div`
    margin-left: 10px;
`;

const ProfilePopup = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}45;
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12),
                0 0 0 1px ${(props) => props.theme.colors.primary}15;
    z-index: 200;
`;

const PopupHeader = styled.div`
    padding: 8px 10px 6px;
`;

const PopupName = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${(props) => props.theme.colors.text};
`;

const PopupEmail = styled.div`
    font-size: 0.72rem;
    color: ${(props) => props.theme.colors.textSecondary};
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const PopupDivider = styled.div`
    height: 1px;
    background: ${(props) => props.theme.colors.primary}25;
    margin: 4px 4px;
`;

const PopupItem = styled.button<{ $danger?: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: ${(props) => props.$danger ? "#e57373" : props.theme.colors.text};
    font-size: 0.83rem;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, color 0.12s;

    &:hover {
        background: ${(props) => props.$danger
            ? "#e5737320"
            : props.theme.colors.primary + "18"};
        color: ${(props) => props.$danger ? "#e57373" : props.theme.colors.primary};
    }
`;

export default Profile;
