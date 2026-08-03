"use client";

import React from "react";
import styled from "styled-components";
import Sidebar from "@/components/sideBar/SideBar";
import TitleBar from "@/components/titleBar/TitleBar";
import PageTransition from "@/components/transition/PageTransition";
import UpdateNotice from "@/components/update/UpdateNotice";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
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
            <UpdateNotice />
        </AppShell>
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
`;

const MainContent = styled.main`
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    position: relative;
`;
