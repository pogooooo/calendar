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
    /* 자판이 올라오면 화면(레이아웃 뷰포트)을 줄인다. 크롬 기본값은 자판이 위에 덮어씌우는 것이라,
       아래에 붙은 시트(할 일 추가 창)의 저장 단추가 자판 밑으로 들어가 버렸다. */
    interactiveWidget: 'resizes-content' as const,
};

export const metadata: Metadata = {
    title: "CRONOS",
    applicationName: "CRONOS",
    description: "일정과 목표를 하나의 별자리처럼 — 캘린더 · 프로젝트 · 챌린지를 한 곳에서 관리하는 할 일 앱",
}

/**
 * 첫 그림 전에 바탕색부터. 화면은 스크립트가 돈 뒤에야 그려져서(StoreInitializer) 그 전 한순간이 흰 바탕이었다 —
 * 어두운 테마로 켜면 매번 하얗게 번쩍였다. 저장된 테마의 바탕을 html 에 먼저 칠해 두고, 그린 뒤에는
 * ThemeProviderWrapper 가 지운다(그때부터는 갈래의 Ground 가 칠한다). 위젯 창은 투명해야 하므로 건드리지 않는다.
 * 색은 styles/theme.ts 의 바탕(바다는 OceanGround 의 물빛)과 같게.
 * 움직임(data-theme-motion)도 함께 — 장식의 CSS 몸짓은 이 값으로 켜고 끈다. 그리기 전에 적어 두어야
 * 기기의 동작 줄이기를 따르기로 한 사람(설정의 '기기 설정 따르기' — motionOverOs:false)에게 첫 그림부터 멈춰 있다.
 * 따르기를 고르지 않았으면(기본) 기기 설정과 상관없이 고른 움직임대로 (ThemeProviderWrapper 가 이어받는다).
 */
const PRE_PAINT = `(function(){try{
if(location.pathname.indexOf("/widget")===0)return;
var d=document.documentElement;
var s=JSON.parse(localStorage.getItem("setting-store")||"null");s=s&&s.state;
var r=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
d.setAttribute("data-theme-motion",r&&s&&s.motionOverOs===false?"off":((s&&s.motion)||"full"));
if(!s||!s.theme)return;
var o=(s.themeOptions||{})[s.theme];var k=o&&o!=="light"?s.theme+"-"+o:s.theme;
var c={"celestial":"#FAF8F2","celestial-dark":"#121725","maple":"#F4EADB","maple-dark":"#1F1612","maple-vintage":"#E7DABF","ocean":"#7ACFC9","ocean-dark":"#0A2226"}[k];
if(!c)return;d.style.backgroundColor=c;d.style.colorScheme=/-dark$/.test(k)?"dark":"light";d.setAttribute("data-prepaint","");
}catch(e){}})();`;

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

    return (
        // PRE_PAINT 가 하이드레이션 전에 html 의 style 을 건드리므로 그 한 겹만 비교에서 뺀다
        <html lang="ko" translate="no" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        </head>
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
