"use client";

import MapleNotebook from "@/components/ambient/maple/MapleNotebook";
import * as S from "./MapleHeroScene.styles";

/**
 * Maple 의 소개 그림 — 가을 노트 두 장과 붉은 잎 하나(MapleNotebook, 로그인 옆 그림판과 같은 그림).
 * 2026-10-15 다시 그리며 테이프로 붙인 3D 도감 카드(MapleSpecimen "plate")를 이것으로 바꿨다.
 */
export default function MapleHeroScene() {
    return (
        <S.Scene aria-hidden="true" data-ambient="maple-hero">
            <MapleNotebook />
        </S.Scene>
    );
}
