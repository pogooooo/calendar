/**
 * Maple 바람 장면(windScene)에 돌풍을 부르는 사건 — 화면을 넘길 때·효과가 터질 때 바탕의 잎도 같이 쓸리게.
 * 장면이 없으면(다른 테마·움직임 끄기·WebGL 없음) 아무 일도 없다. three 를 끌어오지 않으려고 따로 둔다.
 */
export const GUST_EVENT = "maple:gust";

export interface GustDetail {
    /** -1 왼쪽으로(나무 쪽에서) · 1 오른쪽으로 */
    dir: number;
    /** 1 이 보통 돌풍 */
    strength?: number;
}

export function mapleGust(dir: number, strength = 1) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent<GustDetail>(GUST_EVENT, { detail: { dir, strength } }));
}
