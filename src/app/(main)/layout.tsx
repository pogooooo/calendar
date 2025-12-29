"use client";

import styled from "styled-components";
import Sidebar from "@/components/sideBar/SideBar";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <LayoutWrapper>
            <Sidebar />

            <MainContent>
                {children}
            </MainContent>
        </LayoutWrapper>
    );
}

const LayoutWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.surface};
`;

const MainContent = styled.main`
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    position: relative;
`;
