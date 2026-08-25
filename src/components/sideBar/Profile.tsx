"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { celestial_corner_accent, celestial_star } from "@/styles/celestial_theme";
import DefaultProfile from "@/assets/icons/DefaultProfile";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import Setting from "@/assets/icons/Setting";
import Home from "@/assets/icons/Home";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut, UserCog, ChevronDown } from "lucide-react";
import { useT } from "@/i18n/useT";

const Profile = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    const t = useT();
    const [open, setOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const dur = (v: number) => (reduceMotion ? 0 : v);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        router.push("/signIn");
    };

    return (
        <ProfileWrapper>
            <LogoRow onClick={() => { router.push("/") }}>
                <Logo>CRONOS</Logo>
                <hr />
            </LogoRow>

            <UserWrapper ref={popupRef}>
                <UserClickable
                    role="button"
                    tabIndex={0}
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpen((v) => !v);
                        }
                    }}
                    $open={open}
                >
                    {user?.image ? (
                        <ProfileImage src={user.image} alt="profile" />
                    ) : (
                        <DefaultProfile width={30} />
                    )}
                    <UserName>{`${user?.name ?? ""}${t.sidebar.userSuffix}`}</UserName>
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

                <AnimatePresence>
                    {open && (
                        <ProfilePopup
                            key="profile-popup"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -2, pointerEvents: "none" }}
                            transition={{ duration: dur(0.16), ease: [0.22, 1, 0.36, 1] }}
                        >
                            <PopupHeader>
                                {user?.image ? (
                                    <SigilImage src={user.image} alt="profile" />
                                ) : (
                                    <Sigil>{(user?.name ?? "?").charAt(0)}</Sigil>
                                )}
                                <PopupIdentity>
                                    <PopupName title={user?.name ?? ""}>{user?.name}</PopupName>
                                    <PopupEmail title={user?.email ?? ""}>{user?.email}</PopupEmail>
                                </PopupIdentity>
                            </PopupHeader>

                            <StarDivider aria-hidden="true">
                                <RuleLine
                                    $origin="right"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: dur(0.26), delay: dur(0.04), ease: "easeOut" }}
                                />
                                <RuleStar
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: dur(0.22), delay: dur(0.06), ease: "easeOut" }}
                                />
                                <RuleLine
                                    $origin="left"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: dur(0.26), delay: dur(0.04), ease: "easeOut" }}
                                />
                            </StarDivider>

                            <SectionLabel>{t.popup.account}</SectionLabel>

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
                </AnimatePresence>
            </UserWrapper>

            <SidebarMenuButton label={t.sidebar.settings} onClick={() => { router.push("/settings") }}>
                <Setting width={26} />
            </SidebarMenuButton>

            <SidebarMenuButton label={t.sidebar.home} onClick={() => { router.push("/") }}>
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

const LogoRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 30px;
    cursor: pointer;

    & > hr {
        flex: 1;
        min-width: 0;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        margin: 0;
    }
`;

const Logo = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: clamp(0.85rem, 13cqw, ${(props) => props.theme.fontSizes.h3});
    line-height: 1.2;
    white-space: nowrap;
    flex-shrink: 0;
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
    padding: 5px 7px;
    background: transparent;
    border: 1px solid ${(props) => props.$open
        ? props.theme.colors.primary
        : "transparent"};
    transition: border-color 0.25s ease;
    user-select: none;
    color: ${(props) => props.theme.colors.text};

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}80;
    }

    &:focus-visible {
        outline: none;
        border-color: ${(props) => props.theme.colors.primary};
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
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ProfilePopup = styled(motion.div)`
    ${celestial_corner_accent}

    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: auto;
    width: 100%;
    min-width: 240px;
    max-width: 320px;
    box-sizing: border-box;
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    padding: 6px 0 9px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 200;
`;

const PopupHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 14px 11px;
`;

const Sigil = styled.div`
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: 1px solid ${(props) => props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: ${(props) => props.theme.colors.primary};
    text-transform: uppercase;
`;

const SigilImage = styled.img`
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    object-fit: cover;
    border: 1px solid ${(props) => props.theme.colors.primary};
`;

const PopupIdentity = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

const PopupName = styled.div`
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: ${(props) => props.theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const PopupEmail = styled.div`
    font-size: 0.75rem;
    color: ${(props) => props.theme.colors.textSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const StarDivider = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin: 4px 14px 6px;
`;

const SectionLabel = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.68rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 2px 14px 6px;
`;

const RuleLine = styled(motion.span)<{ $origin: "left" | "right" }>`
    display: block;
    flex: 1 1 0;
    min-width: 0;
    height: 1px;
    background-color: ${(props) => props.theme.colors.primary}59;
    transform-origin: ${(props) => props.$origin} center;
`;

const RuleStar = styled(motion.span)`
    display: block;
    flex: 0 0 auto;
    ${celestial_star}
`;

const PopupDivider = styled.div`
    height: 0;
    margin: 3px 14px;
    border-top: 1px dashed ${(props) => props.theme.colors.primary}40;
`;

const PopupItem = styled.button<{ $danger?: boolean }>`
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px 13px;
    box-sizing: border-box;
    border: none;
    color: ${(props) => props.$danger ? "#e57373" : props.theme.colors.text};
    font-size: 0.87rem;
    letter-spacing: 0.3px;
    font-family: inherit;
    cursor: pointer;
    text-align: left;

    background-color: transparent;
    background-image: linear-gradient(
        ${(props) => props.$danger ? "#e57373" : props.theme.colors.primary},
        ${(props) => props.$danger ? "#e57373" : props.theme.colors.primary}
    );
    background-repeat: no-repeat;
    background-position: 24px calc(100% - 5px);
    background-size: 0 1px;
    transition: background-size 0.3s ease;

    & > span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    & > svg {
        flex: 0 0 auto;
    }

    &::before,
    &::after {
        content: "";
        position: absolute;
        bottom: 2px;
        ${celestial_star}
        background-color: ${(props) => props.$danger ? "#e57373" : props.theme.colors.primary};
        transform: scale(0) rotate(-45deg);
        transition: transform 0.35s ease 0.08s;
    }

    &::before {
        left: 14px;
    }

    &::after {
        right: 14px;
    }

    &:hover, &:focus-visible {
        outline: none;
        background-size: calc(100% - 48px) 1px;
    }

    &:hover::before, &:hover::after,
    &:focus-visible::before, &:focus-visible::after {
        transform: scale(1) rotate(0deg);
    }
`;

export default Profile;
