import type { ProjectLayoutProps } from '../ProjectLayout.types';
import * as S from './OceanProjectPage.styles';
export default function OceanProjectLayout(p:ProjectLayoutProps) {
    return <S.ContentLayout ref={p.containerRef} data-theme-layout="ocean-project" data-board-first="true">{p.board}{p.resizer}{p.timeline}</S.ContentLayout>;
}
