"use client";

import { memo } from "react";
import { useT } from "@/i18n/useT";
import * as S from "./OceanAuthPanel.styles";

/**
 * 바다의 로그인 머리 — 그림 없이 기울인 세리프 상표 한 줄과 한 줄 소개.
 * Celestial(별자리 고리)·Maple(도감 한 장)처럼 옆에 큰 그림판을 두지 않고, 서식 판 바로 위 가운데에 선다.
 * 바다는 바탕(물빛)이 맡는다.
 */
export default memo(function OceanAuthPanel({ busy = false }: { busy?: boolean }) {
    const t = useT();
    return (
        <S.Panel data-busy={busy}>
            <S.Wordmark>Cronos</S.Wordmark>
            <S.Tagline>{t.download.taglineOcean}</S.Tagline>
        </S.Panel>
    );
});
