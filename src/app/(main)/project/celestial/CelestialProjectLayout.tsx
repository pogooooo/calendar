import type { ProjectLayoutProps } from '../ProjectLayout.types';
import * as S from './CelestialProjectPage.styles';
export default function CelestialProjectLayout(p: ProjectLayoutProps) {
    return <S.ContentLayout ref={p.containerRef} data-theme-layout="celestial-project" data-board-first="true">{p.board}{p.resizer}{p.timeline}</S.ContentLayout>;
}
