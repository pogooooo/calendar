"use client";

/**
 * 창끼리 "자료가 바뀌었다"고 알리는 신호.
 *
 * 위젯은 창(웹뷰)마다 제 스토어를 따로 들고 있다. 그래서 오늘 할 일 위젯에서
 * 일정을 하나 넣어도 월간 달력 위젯은 그 창을 다시 열기 전까지 옛 화면 그대로였다.
 *
 * localStorage 의 storage 이벤트를 쓴다. 같은 출처의 **다른** 창에서만 울리므로
 * 글을 쓴 창이 제 신호에 다시 반응하는 일이 없다. 웹에서 탭을 여러 개 띄운
 * 경우에도 그대로 먹고, 안드로이드처럼 창이 하나뿐인 곳에서는 조용히 놀고 있는다.
 */

export type DataKind =
    | "todos"
    | "categories"
    | "projects"
    | "challenges"
    | "anniversaries"
    | "daily";

const KEY = "cronos-data-rev";

/** 어떤 API 를 건드렸는지로 무엇이 바뀌었는지 정한다. */
export function kindFromUrl(url: string): DataKind | null {
    // 쿼리스트링을 떼고 경로만 본다.
    const path = url.split("?")[0];
    if (path.includes("/api/todo")) return "todos";
    if (path.includes("/api/category")) return "categories";
    if (path.includes("/api/project")) return "projects";
    if (path.includes("/api/challenge")) return "challenges";
    if (path.includes("/api/anniversary")) return "anniversaries";
    if (path.includes("/api/daily")) return "daily";
    return null;
}

/** 자료를 바꿨다고 다른 창에 알린다. */
export function notifyDataChange(kind: DataKind) {
    try {
        // 값이 매번 달라야 storage 이벤트가 뜬다 (같은 값을 다시 쓰면 조용하다).
        localStorage.setItem(KEY, JSON.stringify({ kind, at: Date.now(), n: Math.random() }));
    } catch {
        // 사생활 보호 모드 등으로 막혀 있으면 창 사이 동기화만 포기한다.
    }
}

/** 다른 창이 자료를 바꾸면 부른다. 정리 함수를 돌려준다. */
export function subscribeDataChange(handler: (kind: DataKind) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const onStorage = (e: StorageEvent) => {
        if (e.key !== KEY || !e.newValue) return;
        try {
            const parsed = JSON.parse(e.newValue) as { kind?: DataKind };
            if (parsed?.kind) handler(parsed.kind);
        } catch {
            // 값이 깨져 있으면 그냥 넘긴다.
        }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
}
