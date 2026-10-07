"use client";

import { memo, useRef } from "react";
import { useT } from "@/i18n/useT";
import { useOceanHeroSpot } from "@/components/ambient/ocean/oceanHero";
import * as S from "./OceanAuthPanel.styles";

/**
 * 바다의 로그인 머리 — 기울인 세리프 상표 한 줄과 한 줄 소개, 그 뒤 물속에 큰 액체 유리 구슬 하나.
 * Celestial(별자리 고리)·Maple(표본 한 장)처럼 옆에 큰 그림판을 두지 않고, 서식 판 바로 위 가운데에 선다.
 *
 * 구슬은 여기서 그리지 않는다 — 상표 뒤의 빈 자리(S.Orb)를 바다의 물 렌더러에 맡기면(oceanHero) 물과 같은 캔버스에
 * 그려져 진짜 물빛을 굴절하고, 상표 글자는 그 위의 DOM 이라 또렷하다. 기다리는 동안(busy)에는 구슬 테가 빨리 일렁인다.
 * WebGL 이 없으면 구슬 없이 예전 그대로다.
 */
export default memo(function OceanAuthPanel({ busy = false }: { busy?: boolean }) {
    const t = useT();
    const orbRef = useRef<HTMLSpanElement>(null);
    useOceanHeroSpot(orbRef, busy);

    return (
        <S.Panel data-busy={busy}>
            <S.Wordmark>
                <S.Orb ref={orbRef} aria-hidden="true" />
                Cronos
            </S.Wordmark>
            <S.Tagline>{t.download.taglineOcean}</S.Tagline>
        </S.Panel>
    );
});
