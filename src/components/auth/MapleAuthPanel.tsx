"use client";

import React, { useEffect } from "react";
import { useT } from "@/i18n/useT";
import MapleNotebook from "@/components/ambient/maple/MapleNotebook";
import MapleWind from "@/components/ambient/maple/MapleWind";
import { mapleGust } from "@/components/ambient/maple/gust";
import * as S from "./MapleAuthPanel.styles";

/**
 * 로그인 옆의 그림판 — 오른쪽 위에서 단풍 가지가 드리워 바람에 흔들리고(MapleWind — 앱 바탕과 같은 바람 장면을 판 안에),
 * 가을 노트 두 장(MapleNotebook)이 종이 위에 놓여 있고, 왼쪽 아래에 수채 잎과 상표·한 줄 소개.
 * 기다리는 동안(busy)에는 노트 앞의 잎이 빨리 지고, 기다림이 시작될 때 가지에 돌풍이 한 번 분다.
 * 2026-10-15 다시 그리며 3D 표본 카드(테이프·도장·"ACER PALMATUM" 이름표)와 먹 장식선을 걷었다.
 */
function MapleAuthPanel({ busy = false }: { busy?: boolean }) {
    const t = useT();
    useEffect(() => { if (busy) mapleGust(-1, 1.1); }, [busy]);
    return (
        <S.BrandPanel>
            <MapleWind variant="panel" />
            <S.Art>
                <MapleNotebook busy={busy} />
            </S.Art>

            <S.BrandContent>
                <S.ServiceName>CRONOS</S.ServiceName>
                <S.Tagline>{t.download.taglineMaple}</S.Tagline>
            </S.BrandContent>
        </S.BrandPanel>
    );
}

export default React.memo(MapleAuthPanel);
