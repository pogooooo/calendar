/**
 * 글 자리 지도 — 하늘이 비켜야 할 곳(글·단추·입력·테두리나 바탕이 있는 판)의 사각형을 모은다.
 *
 * 사용자의 요구: 하늘이 글 읽기를 방해하면 안 된다. 화면 가운데를 옅게 하는 것만으로는 달력처럼 화면이 꽉 찬 곳에서
 * 별자리 선이 글 뒤를 지나갔다. 그래서 실제로 화면에 놓인 것의 자리를 읽어, 그 둘레에서는 하늘을 아예 지운다.
 *   글: 제 글자를 가진 요소 · 손 댈 거리: 단추·링크·입력·작은 아이콘 SVG·캔버스(오브제)
 *   판: 바탕색·바탕 그림·테두리·그림자가 보이는 상자 (카드, 달력 칸 묶음, 모달 뒤 막 …) — 통째로
 * 큰 장식 SVG(홈의 달 아치 같은)는 하늘로 친다. 요소마다 분류는 기억해 두고(바뀌면 비운다), 자리만 다시 읽는다.
 */
export type Rect = { x: number; y: number; w: number; h: number; pad: number };

const CONTROL = new Set(["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT", "LABEL", "SUMMARY", "OPTION", "IMG", "VIDEO", "CANVAS", "IFRAME", "PROGRESS", "METER"]);
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "BR"]);
const ROLES = new Set(["button", "link", "checkbox", "switch", "tab", "menuitem", "option", "slider", "textbox", "combobox", "listbox", "radio", "gridcell", "progressbar"]);

/** 0 없음, 1 글·손 댈 거리(넉넉히 비킨다), 2 판(조금 비킨다) */
type Kind = 0 | 1 | 2;
let cache = new WeakMap<Element, Kind>();

/** 모든 분류를 잊는다 — class 로 바탕·테두리가 바뀐 것까지 다시 보려고 가끔 */
export function forgetKinds() {
    cache = new WeakMap();
}

/** 이 요소의 분류만 잊는다 — 제 글자가 생기거나 없어졌을 때 */
export function forgetKind(el: Element | null | undefined) {
    if (el) cache.delete(el);
}

const alphaOf = (c: string) => {
    if (!c || c === "transparent") return 0;
    const m = c.match(/\(([^)]+)\)/);
    if (!m) return 1;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 4) return 1;
    const a = parts[3];
    return a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a);
};

function boxIsVisible(cs: CSSStyleDeclaration) {
    if (alphaOf(cs.backgroundColor) > 0.04 || cs.backgroundImage !== "none") return true;
    if (cs.boxShadow !== "none" && cs.boxShadow !== "") return true;
    const sides = ["Top", "Right", "Bottom", "Left"] as const;
    return sides.some((s) => {
        const w = parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`));
        return w >= 0.5 && cs.getPropertyValue(`border-${s.toLowerCase()}-style`) !== "none" && alphaOf(cs.getPropertyValue(`border-${s.toLowerCase()}-color`)) > 0.1;
    });
}

function ownText(el: Element) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent && n.textContent.trim()) return true;
    return false;
}

function classify(el: Element): Kind {
    const known = cache.get(el);
    if (known !== undefined) return known;
    let k: Kind = 0;
    const tag = el.tagName;
    if (SKIP.has(tag)) k = 0;
    else if (el instanceof SVGElement) {
        if (tag === "svg") {
            // 작은 SVG 는 아이콘(글과 같은 무게), 큰 것은 장식 — 하늘로 친다
            const r = el.getBoundingClientRect();
            k = r.width > 0 && r.width <= 56 && r.height <= 56 ? 1 : 0;
        } else k = tag === "text" || tag === "tspan" ? 1 : 0;
    } else if (CONTROL.has(tag) || ROLES.has(el.getAttribute("role") ?? "") || el.hasAttribute("contenteditable")) k = 1;
    else if (ownText(el)) k = 1;
    else if (boxIsVisible(getComputedStyle(el))) k = 2;
    cache.set(el, k);
    return k;
}

/**
 * 지금 화면에서 하늘이 비켜야 할 사각형들(CSS px). skip 안의 것(하늘 자신·효과 무대)은 뺀다.
 * 화면 밖·크기 0 인 것은 버린다.
 */
export function collectRects(skip: Element[], W: number, H: number): Rect[] {
    const out: Rect[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) => (skip.includes(n as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n as Element;
        const k = classify(el);
        if (k === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || r.right < 0 || r.bottom < 0 || r.left > W || r.top > H) continue;
        // 글 둘레는 넉넉히 — 목록 사이 틈(50px 남짓)까지 덮여 줄 사이로 선이 지나가지 않는다
        out.push({ x: r.left, y: r.top, w: r.width, h: r.height, pad: k === 1 ? 26 : 10 });
    }
    return out;
}
