"use client";

import React from "react";
import styled from "styled-components";
import Sidebar from "@/components/sideBar/SideBar";
import TitleBar from "@/components/titleBar/TitleBar";
import PageTransition from "@/components/transition/PageTransition";
import UpdateNotice from "@/components/update/UpdateNotice";
import SaveFailureNotice from "@/components/SaveFailureNotice";
import AndroidWidgetSync from "@/components/AndroidWidgetSync";
import QuickNavigation from "@/components/navigation/QuickNavigation";
import { DialogProvider } from "@/components/dialog/DialogProvider";
import MobileTabBar, { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT } from "@/components/mobile/MobileTabBar";
import { SAFE_B, SAFE_T } from "@/styles/breakpoints";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <DialogProvider>
            <AppShell data-app-shell>
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
                <SaveFailureNotice />
                <AndroidWidgetSync />
                <QuickNavigation />
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

    /* 탭바 자리는 여기서 뗀다.
       스크롤 영역(main)의 padding-bottom 으로 떼면, 안쪽 내용이 부모 높이를
       넘어 흘러넘칠 때 그 padding 이 스크롤 범위에 안 들어가서
       화면 맨 아래가 탭바에 가린 채 끝까지 내려가지지 않는다. */
    /* 위쪽은 상태 표시줄(시계·배터리) 자리다. 안드로이드 15 부터는 앱이 화면
       끝까지 그려지므로, 여기서 비켜 주지 않으면 첫 줄이 시계에 깔린다. */
    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        height: 100dvh;
        padding-top: ${SAFE_T};
        padding-bottom: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B});
    }

    /* 자판이 떠 있는 동안(안드로이드 앱이 html[data-keyboard] 를 단다)은 탭바를 내린다.
       줄어든 화면에서 탭바가 자판 바로 위에 남아 입력칸 자리를 먹는다. */
    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        html[data-keyboard] & { padding-bottom: 0; }
    }
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
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    /* 화면 밖으로 걸쳐 둔 장식(카테고리·기념일의 별자리 워터마크)이 가로 스크롤바를 만들지 않게 */
    overflow-x: hidden;
    /* 갈래가 화면 위·아래에 띄운 것(바다의 상표 칩·독)이 있으면 그 갈래가 이 값을 적는다. 없으면 0 — 그대로 2rem.
       위(칩)는 여백으로 비워 내용이 칩 밑으로 굴러가게 두고, 아래(독)는 스크롤 칸 밖으로 뺀다 — 판보다 긴 화면은
       아래 여백 없이 칸 끝까지 굴러가므로, 칸이 독 밑까지 내려가 있으면 마지막 줄이 독에 깔린다. 그 대신 아래 여백은 1rem */
    padding: calc(2rem + var(--app-top-clearance, 0px)) 2rem max(1rem, calc(2rem - var(--app-dock-clearance, 0px)));
    margin-bottom: var(--app-dock-clearance, 0px);
    position: relative;

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        padding: 12px 12px 16px;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
    }
`;
