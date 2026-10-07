"use client";
/**
 * Celestial 의 빈 자리 그림 — 작은 금 천문 기구 하나가 천천히 움직인다(3D 오브제).
 * 할 일: 모래시계 · 프로젝트: 아스트롤라베 · 챌린지: 별을 겨누는 망원경 · 기념일: 차고 기우는 달.
 * 그림이 말을 대신하지 않게 작게. WebGL 이 없으면 그림 없이 글만 남는다(예전 그대로).
 */
import Objet, { type ObjetName } from "@/components/objet/Objet";
import type { EmptyArtKind } from "../EmptyArt";
import * as S from "./CelestialEmptyArt.styles";

const OBJET: Record<EmptyArtKind, ObjetName> = {
    todos: "celestial/hourglass",
    projects: "celestial/astrolabe",
    challenges: "celestial/telescope",
    anniversaries: "celestial/moon",
};

export default function CelestialEmptyArt({ kind }: { kind: EmptyArtKind }) {
    return (
        <S.Art data-empty-art={kind}>
            <Objet name={OBJET[kind]} size="100%" />
        </S.Art>
    );
}
