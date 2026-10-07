"use client";
/**
 * 데스크톱 창 제목 줄의 작은 혼천의 — CRONOS 앞. 가만히 있다가 커서를 올리면 천구가 돌고, 떼면 천천히 멈춘다
 * (멈추면 그리기도 쉰다). 칸 자체가 창을 끄는 자리라 누르면 창이 옮겨진다. WebGL 이 없으면 아무것도 두지 않는다.
 */
import { useState } from "react";
import Objet from "@/components/objet/Objet";
import * as S from "./CelestialTitleMark.styles";

const MARK = { detail: "mark", still: true };

export default function CelestialTitleMark() {
    const [hover, setHover] = useState(false);
    return (
        <S.Mark data-tauri-drag-region onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Objet name="celestial/armillary" size="100%" options={MARK} interaction="none" active={hover} />
        </S.Mark>
    );
}
