"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, ProjectBoardPanel } from "@/components/widget/WidgetPanels";

export default function ProjectBoardWidget() {
    const { ready, authed } = useWidgetInit([]);

    if (!ready) return <Loading>로딩 중...</Loading>;
    if (!authed) return <Loading>로그인이 필요합니다</Loading>;

    return (
        <WidgetShell kind="projectboard" title="CRONOS  ·  프로젝트 보드">
            <Wrap>
                <Framed>
                    <ProjectBoardPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}

const Loading = styled.div`
    display: flex; align-items: center; justify-content: center;
    height: 100vh; font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    background: transparent;
`;

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
