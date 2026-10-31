"use client";
/**
 * Maple 의 바탕 장면 — 오른쪽 위에서 단풍 가지가 드리우고, 바람이 불면 가지의 잎이 흔들리다 몇 장 떨어져 나가고,
 * 물든 잎이 3D 로 뒤집히며 지다가 아래 가장자리에 쌓인다(MapleWind). 그리고 지나가는 햇살 한 겹.
 * 내용 뒤에 깔리고(바다처럼 z-index -1) 누르는 것은 받지 않는다(누름은 window 에서 듣고 잎만 흩날린다).
 * WebGL 이 없으면 멈춘 가지에 예전의 납작한 SVG 잎 다섯 장(CSS 로 떨어진다)을 더한다.
 * 위젯 창에서는 ThemeAtmosphere 가 아예 건너뛰고, 로그인 쪽 화면은 그림판(MapleAuthPanel)이 제 가지를 띄우므로 여기서는 비운다.
 */
import { usePathname } from "next/navigation";
import Image from 'next/image';
import * as S from "./MapleAtmosphere.styles";
import MapleWind from "./MapleWind";

const LEAVES=['red','orange','yellow','brown','orange'];
/** 그림판이 제 가지를 그리는 화면 */
const AUTH = ["/signIn", "/signUp", "/forgotPassword", "/resetPassword", "/verifyEmail"];

export default function MapleAtmosphere() {
    const pathname = usePathname() ?? "";
    if (AUTH.some((p) => pathname.startsWith(p))) return null;
    return <S.Garden aria-hidden="true" data-ambient="maple">
        <MapleWind
            variant="screen"
            fallback={LEAVES.map((leaf,i)=><span className={`fall leaf-${i}`} key={i}>
                <Image className="leaf" src={`/themes/maple/leaf-${leaf}.webp`} alt="" width={64} height={64} unoptimized loading="eager"/>
            </span>)}
        />
        <div className="paper-light" />
    </S.Garden>;
}
