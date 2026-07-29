"use client";

import * as React from 'react';
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
                        <HeaderActionButton onClick={onOpenSettings}>
                            프로젝트 설정
                        </HeaderActionButton>
                    )}
                    <HeaderActionButton onClick={onOpenNewProject}>
                        새 프로젝트
                    </HeaderActionButton>
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
    flex-wrap: wrap;
    gap: 10px 15px;
    margin-bottom: 15px;
`;

export const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    min-width: 200px;
`;

export const TitleText = styled.span`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    white-space: nowrap;
`;

export const CategoryTag = styled.div<{ $color: string }>`
    font-size: 0.7rem;
    padding: 2px 8px;
    letter-spacing: 1px;
    color: ${(props) => props.$color};
    border: 1px solid ${(props) => props.$color};
    background-color: transparent;
    white-space: nowrap;
`;

export const HeaderLine = styled.hr`
    flex: 1;
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.primary};
    margin: 0;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
    flex-shrink: 0;
    margin-left: auto;
`;

export const HeaderActionButton = styled.button`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.8rem;
    letter-spacing: 1.5px;
    padding: 8px 18px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, box-shadow 0.2s;

    &:hover {
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}66;
    }
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
    background: transparent;
    border: 1px solid ${(props) => props.$active ? props.theme.colors.primary : `${props.theme.colors.primary}40`};
    box-shadow: ${(props) => props.$active ? `0 0 6px ${props.theme.colors.primary}55` : 'none'};
    padding: 6px 16px;
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