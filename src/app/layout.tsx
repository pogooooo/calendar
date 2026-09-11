import "./globals.css";
import {Orbit} from "next/font/google";
import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";
import {Metadata} from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import StoreInitializer from "@/components/StoreInitializer";
import DesktopWidgetRestore from "@/components/DesktopWidgetRestore";
import DesktopDragRegion from "@/components/DesktopDragRegion";

const orbit = Orbit({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-orbit",
})

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover' as const,
};

export const metadata: Metadata = {
    title: "CRONOS",
    applicationName: "CRONOS",
    description: "일정과 목표를 하나의 별자리처럼 — 캘린더 · 프로젝트 · 챌린지를 한 곳에서 관리하는 할 일 앱",
}

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

    return (
        <html lang="ko" translate="no">
        <body className={`relative notranslate ${orbit.variable}`}>
            <ThemeProviderWrapper>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                    <StyledComponentsRegistry>
                        <StoreInitializer>
                            <DesktopWidgetRestore />
                            <DesktopDragRegion />
                            {children}
                        </StoreInitializer>
                    </StyledComponentsRegistry>
                </GoogleOAuthProvider>
            </ThemeProviderWrapper>
        </body>
        </html>
    );
}
