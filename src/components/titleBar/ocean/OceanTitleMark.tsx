"use client";
/**
 * 데스크톱 창 제목 줄의 작은 물방울 — Cronos 앞에 바다를 품은 유리 물방울 하나(3D 오브제).
 * 늘 천천히 돌며 겉이 물처럼 일렁이고 살짝 떠올랐다 가라앉는다 — 바탕의 물은 흐르는데 이것만 멈춰 있어 따로 놀았다
 * (사용자: "데스크톱 앱의 물방울에도 애니메이션이 들어갔으면, 조금 이질적이야"). 커서를 올리면 빨리 일렁인다.
 * 움직임 '끄기'면 한 장만 그린다(Objet).
 * 칸 자체가 창을 끄는 자리라 누르면 창이 옮겨진다. WebGL 이 없으면 아무것도 두지 않는다.
 *
 * 칸은 글자 흐름 밖에 떠 있다(OceanTitleMark.styles) — 제목의 첫 글자만 대문자로 세우는 꾸밈(::first-letter)이
 * 글자 앞의 칸 때문에 듣지 않아 cronos 로 보였다.
 */
import { useState } from "react";
import Objet from "@/components/objet/Objet";
import * as S from "./OceanTitleMark.styles";

const DROP = { still: false };

export default function OceanTitleMark() {
    const [hover, setHover] = useState(false);
    return (
        <S.Mark data-tauri-drag-region onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Objet name="ocean/drop" size="100%" options={DROP} interaction="none" active={hover} />
        </S.Mark>
    );
}
