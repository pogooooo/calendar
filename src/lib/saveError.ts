"use client";

/**
 * 저장이 실패해 화면을 되돌렸다는 사실을 사용자에게 알리는 통로.
 *
 * 스토어들은 먼저 화면을 바꾸고(낙관적 갱신), 서버가 거절하면 되돌린다.
 * 되돌리는 것까지는 맞는데 아무 말도 하지 않았다 — console.error 로만 남았다.
 * 사용자 눈에는 체크가 켜졌다가 저절로 꺼지는 걸로 보이고, 왜 그런지 알 길이 없어
 * 다시 누르게 된다. 네트워크가 끊긴 상황이면 그 반복이 계속된다.
 *
 * 스토어는 React 밖이라 대화상자를 띄울 수 없다. 그래서 신호만 흘리고,
 * 화면 쪽의 SaveFailureNotice 가 받아서 띄운다.
 * 되돌리는 자리 바로 옆에서 부르므로 새 기능을 넣어도 빠뜨릴 자리가 없다.
 */

/** 무엇을 저장하다 실패했는가. 사용자에게 보여줄 문구를 고르는 데 쓴다. */
export type SaveScope =
    | "todo"
    | "category"
    | "project"
    | "challenge"
    | "anniversary"
    | "daily"
    | "setting";

export interface SaveFailure {
    scope: SaveScope;
    /** 서버가 준 설명이 있으면 그대로. 없으면 비운다. */
    detail?: string;
    at: number;
}

type Handler = (f: SaveFailure) => void;

const handlers = new Set<Handler>();

/** 되돌린 직후에 부른다. */
export function reportSaveFailure(scope: SaveScope, detail?: string) {
    const failure: SaveFailure = { scope, detail, at: Date.now() };
    handlers.forEach((h) => {
        try { h(failure); } catch { /* 알리다 죽지는 않는다 */ }
    });
}

export function subscribeSaveFailure(handler: Handler): () => void {
    handlers.add(handler);
    return () => { handlers.delete(handler); };
}
