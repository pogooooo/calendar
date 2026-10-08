"use client";
/**
 * 데스크톱 창 제목 줄의 작은 단풍잎 — CRONOS 앞에 오늘의 잎 한 장(3D 오브제, 표본과 같이 날마다 바뀐다).
 * 가만히 있다가 커서를 올리면 꼭지를 축으로 천천히 돌고, 떼면 제자리로 돌아와 멈춘다(멈추면 그리기도 쉰다).
 * 칸 자체가 창을 끄는 자리라 누르면 창이 옮겨진다. WebGL 이 없으면 아무것도 두지 않는다.
 */
import { useState } from "react";
import Objet from "@/components/objet/Objet";
import * as S from "./MapleTitleMark.styles";

const LEAF = { sprite: "today", still: true };

export default function MapleTitleMark() {
    const [hover, setHover] = useState(false);
    return (
        <S.Mark data-tauri-drag-region onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Objet name="maple/leaf" size="100%" options={LEAF} interaction="none" active={hover} />
        </S.Mark>
    );
}
