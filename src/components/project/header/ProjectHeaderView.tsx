"use client";

import * as React from 'react';
import { ProjectHeaderProps } from "./ProjectHeader";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialProjectHeader.styles";
import * as MapleS from "./maple/MapleProjectHeader.styles";
import * as OceanS from './ocean/OceanProjectHeader.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const ProjectHeaderView = React.forwardRef<HTMLDivElement, ProjectHeaderProps>(({
                                                                                         selectedProject,
                                                                                         selectedCategory,
                                                                                         projects,
                                                                                         selectedProjectId,
                                                                                         onSelectProject,
                                                                                         onOpenSettings,
                                                                                         onOpenNewProject
                                                                                     }, ref) => {
    const S = usePickTheme(STYLES);
    const t = useT();
    return (
        <S.HeaderWrapper ref={ref}>
            <S.Header>
                <S.HeaderTitle>
                    <S.TitleText>{t.home.project}</S.TitleText>
                    {selectedCategory && (
                        <S.CategoryTag $color={selectedCategory.color}>
                            {selectedCategory.name}
                        </S.CategoryTag>
                    )}
                    <S.HeaderLine />
                </S.HeaderTitle>
                <S.HeaderActions>
                    {selectedProject && (
                        <S.HeaderActionButton onClick={onOpenSettings}>
                            {t.project.settings}
                        </S.HeaderActionButton>
                    )}
                    <S.HeaderActionButton onClick={onOpenNewProject}>
                        {t.project.newProject}
                    </S.HeaderActionButton>
                </S.HeaderActions>
            </S.Header>

            {/* ✨ page.tsx에 있던 탭 영역이 헤더 컴포넌트 내부로 이동했습니다. */}
            <S.TabContainer>
                {projects.map(project => (
                    <S.Tab
                        key={project.id}
                        $active={project.id === selectedProjectId}
                        aria-pressed={project.id === selectedProjectId}
                        onClick={() => onSelectProject(project.id)}
                    >
                        <S.TabText>{project.title}</S.TabText>
                    </S.Tab>
                ))}
            </S.TabContainer>
        </S.HeaderWrapper>
    );
});

ProjectHeaderView.displayName = 'ProjectHeaderView';

export default ProjectHeaderView;

// --- 스타일 컴포넌트 ---
