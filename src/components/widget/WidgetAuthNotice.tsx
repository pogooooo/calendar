"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import type { WidgetKind } from "@/store/useWidgetStore";

/**
 * 인증 전/실패 상태에서도 셸(제목줄·닫기 버튼)을 그린다.
 * 맨몸 텍스트만 띄우면 사용자가 그 위젯을 끌 방법이 없다.
 */
export default function WidgetAuthNotice({
    kind,
    title,
    authed,
}: {
    kind: WidgetKind;
    title: string;
    authed: boolean;
}) {
    return (
        <WidgetShell kind={kind} title={title}>
            <Center>
                {authed ? "로딩 중..." : "연결을 기다리는 중입니다"}
                {!authed && <Sub>네트워크가 연결되면 자동으로 다시 시도합니다</Sub>}
            </Center>
        </WidgetShell>
    );
}

const Center = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 100%;
    min-height: 90px;
    font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    text-align: center;
`;

const Sub = styled.span`
    font-size: 0.7rem;
    opacity: 0.75;
`;
