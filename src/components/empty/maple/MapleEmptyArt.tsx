import * as S from "./MapleEmptyArt.styles";
import type { EmptyArtKind } from "../EmptyArt";

const FILE: Record<EmptyArtKind, string> = {
    todos: "empty-todos.webp",
    projects: "empty-projects.webp",
    challenges: "empty-challenges.webp",
    anniversaries: "empty-anniversaries.webp",
};

/** 빈 자리의 선화 — 벤치 위의 잎, 잎을 끼운 공책, 싹이 난 병, 잎을 꽂은 사진틀 */
export default function MapleEmptyArt({ kind }: { kind: EmptyArtKind }) {
    return <S.Art $file={FILE[kind]} aria-hidden="true" />;
}
