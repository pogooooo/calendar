"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setIsDesktop(typeof window !== "undefined" && "__TAURI_INTERNALS__" in window);
    }, []);

    useEffect(() => {
        let unlisten: (() => void) | undefined;

        import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
            const win = getCurrentWindow();
            win.isMaximized().then(setIsMaximized);
            win.onResized(() => {
                win.isMaximized().then(setIsMaximized);
            }).then((fn) => { unlisten = fn; });
        }).catch(() => {});

        return () => { unlisten?.(); };
    }, []);

    const handleMinimize = () => {
        import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
            getCurrentWindow().minimize();
        });
    };

    const handleMaximize = () => {
        import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
            const win = getCurrentWindow();
            if (isMaximized) win.unmaximize();
            else win.maximize();
            setIsMaximized(!isMaximized);
        });
    };

    const handleClose = () => {
        import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
            getCurrentWindow().close();
        });
    };

    if (!isDesktop) return null;

    return (
        <Bar data-tauri-drag-region>
            <Title data-tauri-drag-region>CRONOS</Title>
            <Controls>
                <Btn onClick={handleMinimize} title="최소화">
                    <svg width="10" height="1" viewBox="0 0 10 1"><line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                </Btn>
                <Btn onClick={handleMaximize} title={isMaximized ? "이전 크기로" : "최대화"}>
                    {isMaximized ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <rect x="2" y="0" width="8" height="8" stroke="currentColor" strokeWidth="1.2"/>
                            <rect x="0" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                    ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <rect x="0.6" y="0.6" width="8.8" height="8.8" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                    )}
                </Btn>
                <CloseBtn onClick={handleClose} title="닫기">
                    <svg width="10" height="10" viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>
                </CloseBtn>
            </Controls>
        </Bar>
    );
}

const Bar = styled.div`
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 0 16px;
    background-color: ${(p) => p.theme.colors.background};
    border-bottom: 1px solid ${(p) => p.theme.colors.primary}33;
    user-select: none;
    -webkit-user-select: none;
`;

const Title = styled.span`
    font-family: ${(p) => p.theme.fonts.celestial};
    font-size: 0.7rem;
    letter-spacing: 3px;
    color: ${(p) => p.theme.colors.primary};
    pointer-events: none;
`;

const Controls = styled.div`
    display: flex;
    height: 100%;
`;

const Btn = styled.button`
    width: 46px;
    height: 100%;
    background: transparent;
    border: none;
    color: ${(p) => p.theme.colors.text};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover {
        background-color: ${(p) => p.theme.colors.primary}22;
    }
`;

const CloseBtn = styled(Btn)`
    &:hover {
        background-color: #C42B1C;
        color: #ffffff;
    }
`;
