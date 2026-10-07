/**
 * 화면 효과(three.js — components/fx/FxStage)를 부르는 신호.
 *
 * 달력을 넘기거나 할 일을 끝내는 곳은 `fx.emit("complete")` 처럼 무슨 일이 있었는지만 알리고,
 * 무엇을 어떻게 그릴지는 갈래의 효과 모듈(celestial·maple·ocean)이 정한다.
 * 듣는 이가 없으면(위젯 창, 움직임 끔, 숨은 창) 아무 일도 없다 — 부르는 쪽은 신경 쓰지 않아도 된다.
 */
export type FxKind =
    | "month-flip"   // 월간 달력을 넘김 (direction: 1 다음 달, -1 지난달)
    | "page"         // 화면을 옮김
    | "complete"     // 할 일·챌린지를 끝냄
    | "add"          // 할 일을 새로 넣음
    | "widget-open"  // 위젯을 띄움
    | "theme";       // 테마를 바꿈 — 새 갈래가 제 인사를 한다

export interface FxRect { x: number; y: number; w: number; h: number }

export interface FxDetail {
    direction?: 1 | -1;
    /** 효과의 중심(화면 px). 없으면 방금 누른 자리, 그것도 없으면 화면 가운데 */
    x?: number;
    y?: number;
    /** 효과가 머물 영역(달력 칸 묶음 같은). 없으면 화면 전체 */
    rect?: FxRect;
}

export interface FxEvent extends FxDetail { kind: FxKind }

type Listener = (e: FxEvent) => void;
const listeners = new Set<Listener>();

export const fx = {
    emit(kind: FxKind, detail: FxDetail = {}) {
        if (typeof window === "undefined") return;
        listeners.forEach((l) => l({ kind, ...detail }));
    },
    on(l: Listener) {
        listeners.add(l);
        return () => { listeners.delete(l); };
    },
};

/** 요소의 화면 위 자리. 없거나 안 보이면 undefined */
export function rectOf(el: Element | null | undefined): FxRect | undefined {
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return undefined;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
}
