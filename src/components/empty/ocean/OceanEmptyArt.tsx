import type { EmptyArtKind } from '../EmptyArt';
import * as S from './OceanEmptyArt.styles';

/** 빈 자리 — 가는 선으로 그린 조개 하나. 그림이 말을 대신하지 않게 작고 옅게 (Maple: 도감 선화, Celestial: 그림 없음) */
export default function OceanEmptyArt({ kind }: { kind: EmptyArtKind }) {
    return <S.Art data-empty-art={kind} aria-hidden="true" />;
}
