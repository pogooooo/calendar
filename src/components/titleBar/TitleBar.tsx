"use client";

import { useEffect, useState } from "react";
import { isDesktopShell } from "@/lib/platform";
import { useT } from "@/i18n/useT";

import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialTitleBar.styles";
import * as MapleS from "./maple/MapleTitleBar.styles";
import * as OceanS from './ocean/OceanTitleBar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

export default function TitleBar() {
    const S = usePickTheme(STYLES);
    const t = useT();
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // 안드로이드도 Tauri 라서 "__TAURI_INTERNALS__" 만 보면 폰에 창 단추가 뜬다.
        setIsDesktop(isDesktopShell());
    }, []);

    useEffect(() => {
        if (!isDesktop) return;
        let unlisten: (() => void) | undefined;

        import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
            const win = getCurrentWindow();
            win.isMaximized().then(setIsMaximized);
            win.onResized(() => {
                win.isMaximized().then(setIsMaximized);
            }).then((fn) => { unlisten = fn; });
        }).catch(() => {});

        return () => { unlisten?.(); };
    }, [isDesktop]);

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
        <S.Bar data-tauri-drag-region>
            <S.Title data-tauri-drag-region>CRONOS</S.Title>
            <S.Controls>
                <S.Btn onClick={handleMinimize} title={t.titleBar.minimize}>
                    <svg width="10" height="1" viewBox="0 0 10 1"><line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                </S.Btn>
                <S.Btn onClick={handleMaximize} title={isMaximized ? t.titleBar.restore : t.titleBar.maximize}>
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
                </S.Btn>
                <S.CloseBtn onClick={handleClose} title={t.titleBar.close}>
                    <svg width="10" height="10" viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>
                </S.CloseBtn>
            </S.Controls>
        </S.Bar>
    );
}
