"use client";
/**
 * 데스크톱 창 제목 줄의 작은 물방울 — Cronos 앞에 바다를 품은 유리 물방울 하나(3D 오브제).
 * 가만히 있다가 커서를 올리면 천천히 돌며 겉이 일렁이고, 떼면 멈춘다(멈추면 그리기도 쉰다).
 * 칸 자체가 창을 끄는 자리라 누르면 창이 옮겨진다. WebGL 이 없으면 아무것도 두지 않는다.
 *
 * 칸은 글자 흐름 밖에 떠 있다(OceanTitleMark.styles) — 제목의 첫 글자만 대문자로 세우는 꾸밈(::first-letter)이
 * 글자 앞의 칸 때문에 듣지 않아 cronos 로 보였다.
 */
import { useState } from "react";
import Objet from "@/components/objet/Objet";
import * as S from "./OceanTitleMark.styles";

const DROP = { still: true };

export default function OceanTitleMark() {
    const [hover, setHover] = useState(false);
    return (
        <S.Mark data-tauri-drag-region onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Objet name="ocean/drop" size="100%" options={DROP} interaction="none" active={hover} />
        </S.Mark>
    );
}
