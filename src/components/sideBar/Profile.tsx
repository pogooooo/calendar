"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import DefaultProfile from "@/assets/icons/DefaultProfile";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import Setting from "@/assets/icons/Setting";
import Home from "@/assets/icons/Home";
import NavIcon from "@/assets/NavIcon";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut, UserCog, ChevronDown } from "lucide-react";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSideBar.styles";
import * as MapleS from "./maple/MapleSideBar.styles";
import * as OceanS from './ocean/OceanSideBar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const Profile = () => {
    const S = usePickTheme(STYLES);
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
        <S.ProfileWrapper>
            <S.LogoRow onClick={() => { router.push("/") }}>
                <S.Logo>CRONOS</S.Logo>
                <hr />
            </S.LogoRow>

            <S.UserWrapper ref={popupRef}>
                <S.UserClickable
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
                        <S.ProfileImage src={user.image} alt="profile" />
                    ) : (
                        <DefaultProfile width={30} />
                    )}
                    <S.UserName>{`${user?.name ?? ""}${t.sidebar.userSuffix}`}</S.UserName>
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
                </S.UserClickable>

                <AnimatePresence>
                    {open && (
                        <S.ProfilePopup
                            key="profile-popup"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -2, pointerEvents: "none" }}
                            transition={{ duration: dur(0.16), ease: [0.22, 1, 0.36, 1] }}
                        >
                            <S.PopupHeader>
                                <S.SigilFrame>
                                    {user?.image ? (
                                        <S.SigilImage src={user.image} alt="profile" />
                                    ) : (
                                        <S.Sigil>{(user?.name ?? "?").charAt(0)}</S.Sigil>
                                    )}
                                </S.SigilFrame>
                                <S.PopupIdentity>
                                    <S.PopupName title={user?.name ?? ""}>{user?.name}</S.PopupName>
                                    <S.PopupEmail title={user?.email ?? ""}>{user?.email}</S.PopupEmail>
                                </S.PopupIdentity>
                            </S.PopupHeader>

                            <S.StarDivider aria-hidden="true">
                                <S.RuleLine
                                    $origin="right"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: dur(0.26), delay: dur(0.04), ease: "easeOut" }}
                                />
                                <S.RuleStar
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: dur(0.22), delay: dur(0.06), ease: "easeOut" }}
                                />
                                <S.RuleLine
                                    $origin="left"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: dur(0.26), delay: dur(0.04), ease: "easeOut" }}
                                />
                            </S.StarDivider>

                            <S.SectionLabel>{t.popup.account}</S.SectionLabel>

                            <S.PopupItem
                                onClick={() => {
                                    setOpen(false);
                                    router.push("/settings?tab=account");
                                }}
                            >
                                <UserCog size={15} />
                                <span>{t.sidebar.memberManagement}</span>
                            </S.PopupItem>
                            <S.PopupDivider />
                            <S.PopupItem $danger onClick={handleLogout}>
                                <LogOut size={15} />
                                <span>{t.sidebar.logout}</span>
                            </S.PopupItem>
                        </S.ProfilePopup>
                    )}
                </AnimatePresence>
            </S.UserWrapper>

            <SidebarMenuButton label={t.sidebar.settings} onClick={() => { router.push("/settings") }}>
                <NavIcon name="settings" size={26} fallback={<Setting width={26} />} />
            </SidebarMenuButton>

            <SidebarMenuButton label={t.sidebar.home} onClick={() => { router.push("/") }}>
                <NavIcon name="home" size={26} fallback={<Home width={26} />} />
            </SidebarMenuButton>
        </S.ProfileWrapper>
    );
};

export default Profile;
