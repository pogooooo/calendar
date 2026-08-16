"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import { Framed, CategoryPanel } from "@/components/widget/WidgetPanels";

export default function CategoryWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="category" title="CRONOS  ·  카테고리 현황" authed={authed} />;
    }

    return (
        <WidgetShell kind="category" title="CRONOS  ·  카테고리 현황">
            <Wrap>
                <Framed>
                    <CategoryPanel />
                </Framed>
            </Wrap>
        </WidgetShell>
    );
}


const Wrap = styled.div`
    height: 100%;
    & * { background-color: transparent; }
`;
