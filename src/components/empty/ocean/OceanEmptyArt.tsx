"use client";
/**
 * Ocean 의 빈 자리 그림 — 바다를 품은 액체 유리로 빚은 작은 것 하나가 천천히 움직인다(3D 오브제, objet/ocean).
 * 할 일: 물방울 · 프로젝트: 앵무조개 · 챌린지: 떠오르는 방울 · 기념일: 가리비 위의 진주.
 * 그림이 말을 대신하지 않게 작게. WebGL 이 없으면 예전의 가는 선 조개(옅게)로 물러난다.
 */
import Objet, { type ObjetName } from "@/components/objet/Objet";
import type { EmptyArtKind } from "../EmptyArt";
import * as S from "./OceanEmptyArt.styles";

const OBJET: Record<EmptyArtKind, ObjetName> = {
    todos: "ocean/drop",
    projects: "ocean/shell",
    challenges: "ocean/bubbles",
    anniversaries: "ocean/pearl",
};

export default function OceanEmptyArt({ kind }: { kind: EmptyArtKind }) {
    return (
        <S.Art data-empty-art={kind}>
            <Objet name={OBJET[kind]} size="100%" fallback={<S.Shell aria-hidden="true" />} />
        </S.Art>
    );
}
