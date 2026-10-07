import type { ProjectLayoutProps } from '../ProjectLayout.types';
import * as S from './OceanProjectPage.styles';

/**
 * 바다의 프로젝트 틀 — 판 넷을 맞물린 격자. 보드 칸 셋과 타임라인을 한 격자에 앉힌다
 * (자리는 OceanProjectPage.styles 의 grid-template-areas). 끄는 손잡이는 숨긴다.
 */
export default function OceanProjectLayout(p: ProjectLayoutProps) {
    return <S.ContentLayout ref={p.containerRef} data-theme-layout="ocean-project" data-board-first="true">{p.board}{p.resizer}{p.timeline}</S.ContentLayout>;
}
