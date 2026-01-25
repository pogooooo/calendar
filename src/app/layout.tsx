import "./globals.css";
import {Orbit, Chiron_Hei_HK} from "next/font/google";
import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";
import {Metadata} from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";

const orbit = Orbit({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-orbit",
})

const chironHeiHK = Chiron_Hei_HK({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-chiron",

})

export const metadata: Metadata = {
    title: "Cronos",
    description: "Calendar todo service"
}

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

    return (
        <html lang="en">
        <body className={`relative ${orbit.variable} ${chironHeiHK.className}`}>
            <ThemeProviderWrapper>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                    <StyledComponentsRegistry>
                        {children}
                    </StyledComponentsRegistry>
                </GoogleOAuthProvider>
            </ThemeProviderWrapper>
        </body>
        </html>
    );
}
