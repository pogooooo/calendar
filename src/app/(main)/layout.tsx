"use client";

import React from "react";
import styled from "styled-components";
import Sidebar from "@/components/sideBar/SideBar";
import TitleBar from "@/components/titleBar/TitleBar";
import PageTransition from "@/components/transition/PageTransition";
import UpdateNotice from "@/components/update/UpdateNotice";
import { DialogProvider } from "@/components/dialog/DialogProvider";
import MobileTabBar, { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT } from "@/components/mobile/MobileTabBar";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <DialogProvider>
            <AppShell>
                <TitleBar />
                <LayoutWrapper>
                    <Sidebar />
                    <MainContent>
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </MainContent>
                </LayoutWrapper>
                <MobileTabBar />
                <UpdateNotice />
            </AppShell>
        </DialogProvider>
    );
}

const AppShell = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
`;

const LayoutWrapper = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        & > div:first-child { display: none; }
    }
`;

const MainContent = styled.main`
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    position: relative;

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        padding: 12px 12px calc(${TAB_BAR_HEIGHT}px + 12px + env(safe-area-inset-bottom, 0px));
        -webkit-overflow-scrolling: touch;
    }
`;
