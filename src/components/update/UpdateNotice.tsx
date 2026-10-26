"use client";

import * as GemS from "./gem/GemUpdateNotice.styles";
import * as React from "react";
import { X, Download } from "lucide-react";
import { useT } from "@/i18n/useT";
import { checkForUpdate, UPDATE_FOUND_EVENT, type FoundUpdate } from "@/lib/updater";
import useSettingStore from "@/store/useSettingStore";

import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialUpdateNotice.styles";
import * as MapleS from "./maple/MapleUpdateNotice.styles";
import * as OceanS from './ocean/OceanUpdateNotice.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

type Phase = "idle" | "available" | "downloading" | "ready" | "failed";

interface UpdateInfo {
    version: string;
    notes?: string;
    /** 영어 화면이면 이걸 — 예전엔 영어 화면에도 한국어 패치 노트가 떴다 */
    notesEn?: string;
}

export default function UpdateNotice() {
    const S = usePickTheme(STYLES);
    const t = useT();
    const [phase, setPhase] = React.useState<Phase>("idle");
    const [info, setInfo] = React.useState<UpdateInfo | null>(null);
    const [percent, setPercent] = React.useState(0);
    const updateRef = React.useRef<FoundUpdate | null>(null);
    const locale = useSettingStore((s) => s.locale);

    React.useEffect(() => {
        // 어디서 찾았든(켜질 때·6시간마다·설정의 확인 단추) 여기로 모인다
        const onFound = (e: Event) => {
            const update = (e as CustomEvent<FoundUpdate>).detail;
            updateRef.current = update;
            setInfo({ version: update.version, notes: update.body, notesEn: typeof update.rawJson?.notes_en === "string" ? update.rawJson.notes_en : undefined });
            setPhase((p) => (p === "idle" || p === "failed" ? "available" : p));
        };
        window.addEventListener(UPDATE_FOUND_EVENT, onFound);

        // 켜질 때 한 번, 그 뒤로는 6시간마다. 앱을 며칠씩 켜 두는 사람이 새 버전을 놓치지 않게.
        checkForUpdate();
        const timer = window.setInterval(() => { checkForUpdate(); }, 6 * 60 * 60 * 1000);

        return () => {
            window.removeEventListener(UPDATE_FOUND_EVENT, onFound);
            window.clearInterval(timer);
        };
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

            // Windows NSIS(passive)는 설치 직후 스스로 앱을 재시작한다.
            // 여기서 relaunch 까지 부르면 인스턴스가 둘로 갈릴 수 있어 다른 OS 에서만 호출한다.
            setPhase("ready");
            const isWindows = navigator.userAgent.includes("Windows");
            if (!isWindows) {
                const { relaunch } = await import("@tauri-apps/plugin-process");
                await relaunch();
            }
        } catch {
            setPhase("failed");
        }
    }, []);

    if (phase === "idle" || !info) return null;
    const notes = locale === "en" && info.notesEn ? info.notesEn : info.notes;

    return (
        <S.Panel role="status">
            <S.Corner />
            <S.Head>
                <S.Label>{t.update.title}</S.Label>
                {phase === "available" && (
                    <S.CloseBtn onClick={() => setPhase("idle")} aria-label={t.update.later}>
                        <X size={13} />
                    </S.CloseBtn>
                )}
            </S.Head>

            <S.Version>{t.update.version(info.version)}</S.Version>

            {phase === "available" && (
                <>
                    {/* latest.json 의 notes(영어 화면은 notes_en) — 릴리스 스크립트가 그 판의 패치 노트를 넣는다. 한 줄에 하나씩. */}
                    {notes && notes.trim() && (
                        <S.Notes>
                            {notes.split(/\r?\n/).map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).slice(0, 6).map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </S.Notes>
                    )}
                    <S.Desc>{t.update.description}</S.Desc>
                    <S.Row>
                        <S.GhostBtn onClick={() => setPhase("idle")}>{t.update.later}</S.GhostBtn>
                        <S.PrimaryBtn onClick={handleInstall}>
                            <Download size={13} />
                            {t.update.install}
                        </S.PrimaryBtn>
                    </S.Row>
                </>
            )}

            {phase === "downloading" && (
                <>
                    <S.Desc>{t.update.downloading(percent)}</S.Desc>
                    <S.Rail><S.Fill $pct={percent} /></S.Rail>
                </>
            )}

            {phase === "ready" && <S.Desc>{t.update.restarting}</S.Desc>}

            {phase === "failed" && (
                <>
                    <S.Desc>{t.update.failed}</S.Desc>
                    <S.Row>
                        <S.GhostBtn onClick={() => setPhase("idle")}>{t.update.later}</S.GhostBtn>
                        <S.PrimaryBtn onClick={handleInstall}>{t.update.retry}</S.PrimaryBtn>
                    </S.Row>
                </>
            )}
        </S.Panel>
    );
}
