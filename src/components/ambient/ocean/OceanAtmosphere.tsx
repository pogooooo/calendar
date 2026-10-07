"use client";
/**
 * 바다의 바탕 장면 — 맑은 물 아래 모래 바닥에 어른거리는 빛 하나만.
 * 반짝이·떠오르는 물방울 같은 잔장식은 두지 않는다(배경이 할 일은 한 가지). 고운 결(grain)만 한 겹 얹어 화면이 납작하지 않게.
 * 내용 뒤(z-index -1)에 깔리고, 화면을 누르는 것은 받지 않는다.
 */
import OceanCaustics from "./OceanCaustics";
import * as S from "./OceanAtmosphere.styles";

export default function OceanAtmosphere() {
    return (
        <S.Sea aria-hidden="true" data-ambient="ocean">
            <OceanCaustics />
            <S.Grain />
        </S.Sea>
    );
}
