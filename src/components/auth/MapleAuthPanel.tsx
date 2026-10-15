"use client";

import React from "react";
import { useT } from "@/i18n/useT";
import MapleNotebook from "@/components/ambient/maple/MapleNotebook";
import * as S from "./MapleAuthPanel.styles";

/**
 * 로그인 옆의 그림판 — 가을 노트 두 장(MapleNotebook)이 종이 위에 놓여 있고, 왼쪽 아래에 붉은 잎과 상표·한 줄 소개.
 * 기다리는 동안(busy)에는 잎이 빨리 진다.
 * 2026-10-15 다시 그리며 3D 표본 카드(테이프·도장·"ACER PALMATUM" 이름표)와 먹 장식선을 걷었다.
 */
function MapleAuthPanel({ busy = false }: { busy?: boolean }) {
    const t = useT();
    return (
        <S.BrandPanel>
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
