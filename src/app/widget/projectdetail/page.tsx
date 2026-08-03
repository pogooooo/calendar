"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, ProjectDetailPanel } from "@/components/widget/WidgetPanels";

export default function ProjectDetailWidget() {
    const { ready, authed } = useWidgetInit([]);

    if (!ready) return <Loading>로딩 중...</Loading>;
    if (!authed) return <Loading>로그인이 필요합니다</Loading>;

    return (
        <WidgetShell kind="projectdetail" title="CRONOS  ·  프로젝트 상세">
            <Wrap>
                <Framed>
                    <ProjectDetailPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}

const Loading = styled.div`
    display: flex; align-items: center; justify-content: center;
    height: 100vh; font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    background: ${p => p.theme.colors.surface};
`;

const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
