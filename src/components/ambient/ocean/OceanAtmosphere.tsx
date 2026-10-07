"use client";
/**
 * 바다의 바탕 장면 — 햇살이 비치는 맑은 물 속.
 *   햇빛 번짐 · 물빛 그물(three.js, OceanCaustics) · 반짝이는 빛망울(보케) · 천천히 떠오르는 물방울
 * 모래와 조개는 사이드바(물가, OceanSideBar)와 폰 탭바(모래 띠)가 맡는다 — 물과 뭍이 나뉘는 구조.
 * 내용 뒤(z-index -1)에 깔리고, 화면을 누르는 것은 받지 않는다.
 */
import OceanCaustics from "./OceanCaustics";
import { Bubble } from "@/assets/ocean/SeaLife";
import * as S from "./OceanAtmosphere.styles";

const SPARKS = 16;
const BUBBLES = 6;

export default function OceanAtmosphere() {
    return (
        <S.Sea aria-hidden="true" data-ambient="ocean">
            <S.Glare />
            <OceanCaustics />
            <S.Sparks>{Array.from({ length: SPARKS }, (_, i) => <span key={i} className={`s s${i}`} />)}</S.Sparks>
            <S.Rising>{Array.from({ length: BUBBLES }, (_, i) => <Bubble key={i} className={`b b${i}`} />)}</S.Rising>
        </S.Sea>
    );
}
