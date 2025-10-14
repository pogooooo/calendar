import AuthSessionProvider from "./AuthSessionProvider";
import "./globals.css";
import Link from "next/link";
import {Orbit} from "next/font/google";
import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";
import {Metadata} from "next";

const orbit = Orbit({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-orbit",
})

export const metadata: Metadata = {
    title: "Cronos",
    description: "Calendar todo service"
}

export default function RootLayout({
       children,
    }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={orbit.variable}>
        <body className="relative">
            <StyledComponentsRegistry>
                <AuthSessionProvider>{children}</AuthSessionProvider>
            </StyledComponentsRegistry>
        </body>
        </html>
    );
}
