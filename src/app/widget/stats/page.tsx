"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, StatsPanel } from "@/components/widget/WidgetPanels";

export default function StatsWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);

    if (!ready) return <Loading>로딩 중...</Loading>;
    if (!authed) return <Loading>로그인이 필요합니다</Loading>;

    return (
        <WidgetShell kind="stats" title="CRONOS  ·  이번 주 통계">
            <Wrap>
                <Framed>
                    <StatsPanel />
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
