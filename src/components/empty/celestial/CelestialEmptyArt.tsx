"use client";

import * as S from "./CelestialEmptyArt.styles";
import { Armillary, MoonDisc, Star4, Star8, SunMoon, f } from "@/components/ornament/celestial/CelestialOrnaments";
import type { EmptyArtKind } from "../EmptyArt";

/** XVII 별 카드의 일곱 잔별 자리 */
const SEVEN = Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + Math.PI / 7 + (i * Math.PI * 2) / 7;
    return { x: f(60 + Math.cos(a) * 26), y: f(40 + Math.sin(a) * 26), r: i % 2 ? 2.6 : 3.4 };
});

/**
 * Celestial 의 빈 화면 그림 — 금 선화 하나와 양옆으로 뻗은 괘선(끝에 점). 3D 기구가 아니라 사이드바 기둥과 같은 평면 문양이다.
 *   할 일: 해와 달(점선 테·빛살·초승달) · 프로젝트: 혼천의 · 챌린지: 여덟 갈래 별과 일곱 잔별(XVII) · 기념일: 달의 위상 줄
 * 글 위에만 놓이고 글과 겹치지 않는다. 할 일 자리는 목록 칸이 좁아 작게, 왼쪽에 붙인다.
 */
export default function CelestialEmptyArt({ kind }: { kind: EmptyArtKind }) {
    if (kind === "anniversaries") {
        return (
            <S.Art $kind={kind} viewBox="0 0 160 24" aria-hidden="true">
                <line className="hair" x1="6" y1="12" x2="38" y2="12" />
                <line className="hair" x1="122" y1="12" x2="154" y2="12" />
                <circle className="fill" cx="6" cy="12" r="1.5" />
                <circle className="fill" cx="154" cy="12" r="1.5" />
                {[0.125, 0.25, 0.5, 0.75, 0.875].map((ph, i) => <MoonDisc key={ph} cx={52 + i * 14} cy={12} r={5} phase={ph} />)}
            </S.Art>
        );
    }
    return (
        <S.Art $kind={kind} viewBox="0 0 120 80" aria-hidden="true">
            <line className="hair" x1="4" y1="40" x2={kind === "todos" ? 26 : 22} y2="40" />
            <line className="hair" x1={kind === "todos" ? 94 : 98} y1="40" x2="116" y2="40" />
            <circle className="fill" cx="4" cy="40" r="1.5" />
            <circle className="fill" cx="116" cy="40" r="1.5" />
            {kind === "todos" && <SunMoon cx={60} cy={40} r={30} rays={28} />}
            {kind === "projects" && <>
                <circle className="hair dash" cx="60" cy="40" r="36" />
                <Armillary cx={60} cy={40} r={22} axis={1.5} />
            </>}
            {kind === "challenges" && <>
                <circle className="hair dash" cx="60" cy="40" r="36" />
                <Star8 cx={60} cy={40} r={15} />
                {SEVEN.map((s, i) => <Star4 key={i} cx={s.x} cy={s.y} r={s.r} />)}
            </>}
        </S.Art>
    );
}
