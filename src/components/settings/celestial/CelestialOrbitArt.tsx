"use client";
/**
 * 설정 '모양' 판 머리의 그림 — 금 해 둘레를 세 행성이 도는 3D 오러리(오브제). 올리면 빨리 돈다.
 * 예전의 납작한 궤도 그림(타원 셋)은 바탕 하늘의 좌표선과 겹쳐 서로 다퉜다 — 이제 하늘은 이 칸 둘레를 비운다.
 * WebGL 이 없으면 예전 그림 그대로.
 */
import Objet from "@/components/objet/Objet";
import { Orbit } from "./CelestialSettings.layout";
import * as S from "./CelestialOrbitArt.styles";

const Flat = () => (
    <Orbit viewBox="0 0 200 200" aria-hidden="true" fill="none" strokeWidth=".6">
        <ellipse cx="100" cy="100" rx="80" ry="31" opacity=".55" />
        <ellipse cx="100" cy="100" rx="80" ry="31" opacity=".55" transform="rotate(60 100 100)" />
        <ellipse cx="100" cy="100" rx="80" ry="31" opacity=".55" transform="rotate(120 100 100)" />
        <circle cx="100" cy="100" r="10" opacity=".85" />
        <circle className="pip" cx="180" cy="100" r="3.2" />
        <circle className="pip" cx="60" cy="31" r="2.4" />
    </Orbit>
);

export default function CelestialOrbitArt() {
    return (
        <S.Slot aria-hidden="true">
            <Objet name="celestial/orrery" size="100%" fallback={<Flat />} />
        </S.Slot>
    );
}
