"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { subscribeSaveFailure, type SaveScope } from "@/lib/saveError";
import { useT } from "@/i18n/useT";

import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./notice/celestial/CelestialSaveFailureNotice.styles";
import * as MapleS from "./notice/maple/MapleSaveFailureNotice.styles";
import * as OceanS from './notice/ocean/OceanSaveFailureNotice.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

/**
 * 저장이 실패해 화면이 되돌아갔을 때 뜨는 알림.
 *
 * 대화상자로 막지 않는 이유: 실패는 대개 네트워크가 잠깐 끊긴 것이고,
 * 그때마다 확인을 누르게 하면 더 성가시다. 무슨 일이 있었는지만 알리고
 * 스스로 사라진다. 여러 건이 몰리면 한 줄로 묶어 센다.
 */
const HIDE_AFTER = 5000;

export default function SaveFailureNotice() {
    const S = usePickTheme(STYLES);
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
        <S.Bar role="status" aria-live="polite">
            <AlertTriangle size={15} />
            <span className="msg">
                {t.saveError.message(what)}
                {state.count > 1 && <b>{` ×${state.count}`}</b>}
            </span>
            <button type="button" onClick={() => setState(null)} aria-label={t.widgetShell.close}>
                <X size={14} />
            </button>
        </S.Bar>
    );
}
