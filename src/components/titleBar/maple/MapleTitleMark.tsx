"use client";
/**
 * 데스크톱 창 제목 줄의 작은 단풍잎 — CRONOS 앞에 오늘의 잎 한 장(3D 오브제, 표본과 같이 날마다 바뀐다).
 * 늘 꼭지를 축으로 천천히 돌며 앞뒤를 보인다 — 바탕의 잎은 지는데 이것만 멈춰 있어 따로 놀았다(바다의 물방울과 같은 까닭).
 * 커서를 올리면 조금 더 빨리. 움직임 '끄기'면 한 장만 그린다(Objet).
 * 칸 자체가 창을 끄는 자리라 누르면 창이 옮겨진다. WebGL 이 없으면 아무것도 두지 않는다.
 */
import { useState } from "react";
import Objet from "@/components/objet/Objet";
import * as S from "./MapleTitleMark.styles";

const LEAF = { sprite: "today", still: false };

export default function MapleTitleMark() {
    const [hover, setHover] = useState(false);
    return (
        <S.Mark data-tauri-drag-region onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Objet name="maple/leaf" size="100%" options={LEAF} interaction="none" active={hover} />
        </S.Mark>
    );
}
