"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";
import { AlertTriangle, X } from "lucide-react";
import { subscribeSaveFailure, type SaveScope } from "@/lib/saveError";
import { useT } from "@/i18n/useT";
import { MOBILE, TAB_BAR_HEIGHT, SAFE_B } from "@/styles/breakpoints";

/**
 * 저장이 실패해 화면이 되돌아갔을 때 뜨는 알림.
 *
 * 대화상자로 막지 않는 이유: 실패는 대개 네트워크가 잠깐 끊긴 것이고,
 * 그때마다 확인을 누르게 하면 더 성가시다. 무슨 일이 있었는지만 알리고
 * 스스로 사라진다. 여러 건이 몰리면 한 줄로 묶어 센다.
 */
const HIDE_AFTER = 5000;

export default function SaveFailureNotice() {
    const t = useT();
    const [state, setState] = React.useState<{ scope: SaveScope; count: number } | null>(null);
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(() => {
        const stop = subscribeSaveFailure((f) => {
            setState((prev) =>
                prev && prev.scope === f.scope
                    ? { scope: f.scope, count: prev.count + 1 }
                    : { scope: f.scope, count: 1 });

            clearTimeout(timer.current);
            timer.current = setTimeout(() => setState(null), HIDE_AFTER);
        });
        return () => { stop(); clearTimeout(timer.current); };
    }, []);

    if (!state) return null;

    const what = t.saveError.scopes[state.scope];

    return (
        <Bar role="status" aria-live="polite">
            <AlertTriangle size={15} />
            <span className="msg">
                {t.saveError.message(what)}
                {state.count > 1 && <b>{` ×${state.count}`}</b>}
            </span>
            <button type="button" onClick={() => setState(null)} aria-label={t.widgetShell.close}>
                <X size={14} />
            </button>
        </Bar>
    );
}

const slideUp = keyframes`
    from { opacity: 0; transform: translate(-50%, 12px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
`;

const Bar = styled.div`
    position: fixed;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    z-index: 1200;

    display: flex;
    align-items: center;
    gap: 10px;
    max-width: min(560px, calc(100vw - 32px));
    padding: 10px 12px 10px 14px;

    background-color: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => p.theme.colors.error};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
    color: ${(p) => p.theme.colors.text};

    svg { flex: none; color: ${(p) => p.theme.colors.error}; }

    .msg {
        flex: 1;
        min-width: 0;
        font-size: 0.82rem;
        line-height: 1.5;
    }

    button {
        flex: none;
        display: flex;
        padding: 4px;
        background: none;
        border: none;
        cursor: pointer;
        color: ${(p) => p.theme.colors.textSecondary};

        &:hover { color: ${(p) => p.theme.colors.text}; }
    }

    @media (prefers-reduced-motion: no-preference) {
        animation: ${slideUp} 0.22s ease-out both;
    }

    /* 폰에서는 탭바를 피해 그 위에 뜬다 */
    ${MOBILE} {
        bottom: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B} + 14px);
        left: 12px;
        right: 12px;
        transform: none;
        max-width: none;

        @media (prefers-reduced-motion: no-preference) {
            animation: none;
        }
    }
`;
