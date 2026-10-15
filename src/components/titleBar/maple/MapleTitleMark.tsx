"use client";
/**
 * 데스크톱 창 제목 줄의 작은 단풍잎 — CRONOS 앞에 수채 단풍잎 한 장(사이드바 상표와 같은 잎).
 * 2026-10-15 다시 그리며 늘 돌던 3D 수채 잎(오브제)을 이것으로 바꿨다 — 제목 줄 하나에 WebGL 을 열 일도 아니었다.
 * 칸 자체가 창을 끄는 자리라 누르면 창이 옮겨진다.
 */
import * as S from "./MapleTitleMark.styles";

export default function MapleTitleMark() {
    return <S.Mark data-tauri-drag-region aria-hidden="true" />;
}
