import type { ProjectLayoutProps } from '../ProjectLayout.types';
import * as S from './MapleProjectPage.styles';
export default function MapleProjectLayout(p: ProjectLayoutProps) {
    return <S.ContentLayout ref={p.containerRef} data-theme-layout="maple-project" data-board-first="false">{p.timeline}{p.resizer}{p.board}</S.ContentLayout>;
}
