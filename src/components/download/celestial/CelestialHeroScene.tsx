"use client";
/**
 * 내려받기 화면의 Celestial 머리 그림 — 둘레에 성긴 별이 뜬 큰 혼천의.
 * 공용 오브제 무대(objet/stage)로 그린다 — 예전처럼 이 그림만의 WebGL 맥락을 따로 열지 않는다.
 * 끌면 돌고(놓으면 관성으로 조금 더), 움직임 '끄기'면 멈춘 한 장. WebGL 이 없으면 예전 표지(CelestialArcana).
 * 칸보다 넓게 그리고 가장자리를 둥글게 지워, 별이 네모난 끝 없이 사라진다.
 */
import Objet from "@/components/objet/Objet";
import CelestialArcana from "@/assets/celestial/CelestialArcana";
import * as S from "./CelestialHeroScene.styles";

const HERO = { detail: "hero", tilt: 0.41, stars: true, frame: 1.42 };

export default function HeroScene() {
    return (
        <S.Mount aria-hidden="true">
            <Objet name="celestial/armillary" size="100%" options={HERO} fallback={<S.Flat><CelestialArcana /></S.Flat>} />
        </S.Mount>
    );
}
