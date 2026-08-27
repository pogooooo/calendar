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
    title: "Cronos",
    description: "Calendar todo service"
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
