"use client";

import * as React from 'react';
import { ProjectHeaderProps } from '../ProjectHeader';
import { useT } from "@/i18n/useT";
import * as S from "./CelestialProjectHeader.styles";

const CelestialProjectHeader = React.forwardRef<HTMLDivElement, ProjectHeaderProps>(({
                                                                                         selectedProject,
                                                                                         selectedCategory,
                                                                                         projects,
                                                                                         selectedProjectId,
                                                                                         onSelectProject,
                                                                                         onOpenSettings,
                                                                                         onOpenNewProject
                                                                                     }, ref) => {
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
                        onClick={() => onSelectProject(project.id)}
                    >
                        <S.TabText>{project.title}</S.TabText>
                    </S.Tab>
                ))}
            </S.TabContainer>
        </S.HeaderWrapper>
    );
});

CelestialProjectHeader.displayName = 'CelestialProjectHeader';

export default CelestialProjectHeader;

// --- 스타일 컴포넌트 ---
