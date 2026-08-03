"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";
import { X, Download } from "lucide-react";
import { useT } from "@/i18n/useT";

type Phase = "idle" | "available" | "downloading" | "ready" | "failed";

interface UpdateInfo {
    version: string;
    notes?: string;
}

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export default function UpdateNotice() {
    const t = useT();
    const [phase, setPhase] = React.useState<Phase>("idle");
    const [info, setInfo] = React.useState<UpdateInfo | null>(null);
    const [percent, setPercent] = React.useState(0);
    const updateRef = React.useRef<{
        version: string;
        body?: string;
        downloadAndInstall: (cb: (event: { event: string; data?: { contentLength?: number; chunkLength?: number } }) => void) => Promise<void>;
    } | null>(null);

    React.useEffect(() => {
        if (!isTauri()) return;

        let cancelled = false;

        (async () => {
            try {
                const { check } = await import("@tauri-apps/plugin-updater");
                const found = await check();
                if (cancelled || !found) return;
                updateRef.current = found as never;
                setInfo({ version: found.version, notes: found.body });
                setPhase("available");
            } catch (e) {}
        })();

        return () => { cancelled = true; };
    }, []);

    const handleInstall = React.useCallback(async () => {
        const update = updateRef.current;
        if (!update) return;

        setPhase("downloading");
        setPercent(0);

        let total = 0;
        let received = 0;

        try {
            await update.downloadAndInstall((event) => {
                if (event.event === "Started") {
                    total = event.data?.contentLength ?? 0;
                } else if (event.event === "Progress") {
                    received += event.data?.chunkLength ?? 0;
                    if (total > 0) setPercent(Math.min(100, Math.round((received / total) * 100)));
                } else if (event.event === "Finished") {
                    setPercent(100);
                }
            });

            setPhase("ready");
            const { relaunch } = await import("@tauri-apps/plugin-process");
            await relaunch();
        } catch (e) {
            setPhase("failed");
        }
    }, []);

    if (phase === "idle" || !info) return null;

    return (
        <Panel role="status">
            <Corner />
            <Head>
                <Label>{t.update.title}</Label>
                {phase === "available" && (
                    <CloseBtn onClick={() => setPhase("idle")} aria-label={t.update.later}>
                        <X size={13} />
                    </CloseBtn>
                )}
            </Head>

            <Version>{t.update.version(info.version)}</Version>

            {phase === "available" && (
                <>
                    <Desc>{t.update.description}</Desc>
                    <Row>
                        <GhostBtn onClick={() => setPhase("idle")}>{t.update.later}</GhostBtn>
                        <PrimaryBtn onClick={handleInstall}>
                            <Download size={13} />
                            {t.update.install}
                        </PrimaryBtn>
                    </Row>
                </>
            )}

            {phase === "downloading" && (
                <>
                    <Desc>{t.update.downloading(percent)}</Desc>
                    <Rail><Fill $pct={percent} /></Rail>
                </>
            )}

            {phase === "ready" && <Desc>{t.update.restarting}</Desc>}

            {phase === "failed" && (
                <>
                    <Desc>{t.update.failed}</Desc>
                    <Row>
                        <GhostBtn onClick={() => setPhase("idle")}>{t.update.later}</GhostBtn>
                        <PrimaryBtn onClick={handleInstall}>{t.update.retry}</PrimaryBtn>
                    </Row>
                </>
            )}
        </Panel>
    );
}

const rise = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const Panel = styled.div`
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 500;
    width: 290px;
    padding: 14px 16px 16px;
    background-color: ${p => p.theme.colors.background};
    border: 1px solid ${p => p.theme.colors.primary};
    box-shadow: 0 0 18px ${p => p.theme.colors.primary}33;
    animation: ${rise} 0.35s ease-out both;
`;

const Corner = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    background: linear-gradient(315deg, transparent 48%, ${p => p.theme.colors.primary} 50%, transparent 52%);
    pointer-events: none;
`;

const Head = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const Label = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.72rem;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.textSecondary};
`;

const CloseBtn = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    color: ${p => p.theme.colors.textSecondary};
    &:hover { color: ${p => p.theme.colors.text}; }
`;

const Version = styled.div`
    margin-top: 6px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
`;

const Desc = styled.p`
    margin: 8px 0 0;
    font-size: 0.78rem;
    line-height: 1.5;
    color: ${p => p.theme.colors.textSecondary};
`;

const Row = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
`;

const GhostBtn = styled.button`
    padding: 6px 12px;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.text};
    cursor: pointer;
    transition: border-color 0.15s;
    &:hover { border-color: ${p => p.theme.colors.primary}; }
`;

const PrimaryBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.text};
    cursor: pointer;
    transition: box-shadow 0.15s;
    &:hover { box-shadow: 0 0 8px ${p => p.theme.colors.primary}66; }
`;

const Rail = styled.div`
    margin-top: 12px;
    height: 1px;
    background: ${p => p.theme.colors.primary}33;
`;

const Fill = styled.div<{ $pct: number }>`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.theme.colors.primary};
    box-shadow: 0 0 6px ${p => p.theme.colors.primary};
    transition: width 0.2s ease;
`;
