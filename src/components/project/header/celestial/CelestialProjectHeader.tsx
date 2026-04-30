"use client";

import * as React from 'react';
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import { ProjectHeaderProps } from '../ProjectHeader';
import styled from "styled-components";

const CelestialProjectHeader = React.forwardRef<HTMLDivElement, ProjectHeaderProps>(({
                                                                                         selectedProject,
                                                                                         selectedCategory,
                                                                                         projects,
                                                                                         selectedProjectId,
                                                                                         onSelectProject,
                                                                                         onOpenSettings,
                                                                                         onOpenNewProject
                                                                                     }, ref) => {
    return (
        <HeaderWrapper ref={ref}>
            <Header>
                <HeaderTitle>
                    <TitleText>프로젝트</TitleText>
                    {selectedCategory && (
                        <CategoryTag $color={selectedCategory.color}>
                            {selectedCategory.name}
                        </CategoryTag>
                    )}
                    <HeaderLine />
                </HeaderTitle>
                <HeaderActions>
                    {selectedProject && (
                        <SecondaryButton
                            $variant="default"
                            onClick={onOpenSettings}
                            $width="150px"
                        >
                            프로젝트 설정
                        </SecondaryButton>
                    )}
                    <SecondaryButton
                        $variant="primary"
                        $width="150px"
                        onClick={onOpenNewProject}
                    >
                        새 프로젝트
                    </SecondaryButton>
                </HeaderActions>
            </Header>

            {/* ✨ page.tsx에 있던 탭 영역이 헤더 컴포넌트 내부로 이동했습니다. */}
            <TabContainer>
                {projects.map(project => (
                    <Tab
                        key={project.id}
                        $active={project.id === selectedProjectId}
                        onClick={() => onSelectProject(project.id)}
                    >
                        <TabText>{project.title}</TabText>
                    </Tab>
                ))}
            </TabContainer>
        </HeaderWrapper>
    );
});

CelestialProjectHeader.displayName = 'CelestialProjectHeader';

export default CelestialProjectHeader;

// --- 스타일 컴포넌트 ---

export const HeaderWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export const Header = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
`;

export const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
`;

export const TitleText = styled.span`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
`;

export const CategoryTag = styled.div<{ $color: string }>`
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    color: ${(props) => props.$color};
    border: 1px solid ${(props) => props.$color};
    background-color: transparent;
    white-space: nowrap;
`;

export const HeaderLine = styled.hr`
    flex: 0.8;
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.primary};
    margin: 0;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

export const TabContainer = styled.div`
    display: flex;
    gap: 10px;
    width: 100%;
    margin-bottom: 10px;
    overflow-x: auto;
    padding-bottom: 5px;

    &::-webkit-scrollbar { height: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const Tab = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    background: ${(props) => props.$active ? `${props.theme.colors.primary}22` : 'transparent'};
    border: 1px solid ${(props) => props.$active ? props.theme.colors.primary : `${props.theme.colors.primary}40`};
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const TabText = styled.span`
    color: ${(props) => props.theme.colors.text};
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.85rem;
    white-space: nowrap;
`;