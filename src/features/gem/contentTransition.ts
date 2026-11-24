import type { MotionLevel } from "@/styles/motion";

export interface ContentSnapshot {
    node: HTMLElement;
    width: number;
    height: number;
    scroll: Array<{ source: HTMLElement; copy: HTMLElement; top: number; left: number }>;
}

/** Save the last rendered information, without remounting the live controls. */
export function captureContent(el: Element): ContentSnapshot | undefined {
    if (!(el instanceof HTMLElement)) return;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const node = el.cloneNode(true) as HTMLElement;
    node.querySelectorAll('[data-motion-snapshot]').forEach(copy => copy.remove());
    const copies = [node, ...node.querySelectorAll<HTMLElement>('*')];
    const sources = [el, ...el.querySelectorAll<HTMLElement>('*')].filter(child => !child.closest('[data-motion-snapshot]'));
    const scroll = sources.map((source, index) => ({ source, copy: copies[index], top: source.scrollTop, left: source.scrollLeft }));
    return { node, width: box.width, height: box.height, scroll };
}

let sequence = 0;
function makeInert(node: HTMLElement) {
    node.inert = true;
    node.setAttribute("aria-hidden", "true");
    node.setAttribute("data-motion-snapshot", "");
    const prefix = `motion-copy-${++sequence}-`;
    const ids = new Map<string, string>();
    for (const el of [node, ...node.querySelectorAll<HTMLElement>("[id]")]) {
        if (el.id) { ids.set(el.id, prefix + el.id); el.id = prefix + el.id; }
    }
    for (const el of [node, ...node.querySelectorAll("*")]) {
        for (const attr of Array.from(el.attributes)) {
            let value = attr.value;
            for (const [id, replacement] of ids) {
                value = value.replaceAll(`url(#${id})`, `url(#${replacement})`);
                if ((attr.name === "href" || attr.name === "xlink:href") && value === `#${id}`) value = `#${replacement}`;
            }
            if (value !== attr.value) el.setAttribute(attr.name, value);
        }
        // Snapshot controls never take part in form submission or keyboard navigation.
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement || el instanceof HTMLButtonElement) {
            el.setAttribute("form", `${prefix}detached`);
            el.removeAttribute("required");
        }
        el.removeAttribute("name");
    }
}

/** Replace content in sequence so outgoing and incoming labels never overlap. */
export function exchangeContent(el: Element, previous: ContentSnapshot | undefined, level: MotionLevel): () => void {
    if (!(el instanceof HTMLElement)) return () => {};
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return () => {};
    const animations: Animation[] = [];
    let ghost: HTMLElement | undefined;
    const exitDuration = level === "gentle" ? 40 : 65;
    if (previous && el.parentElement) {
        ghost = previous.node;
        makeInert(ghost);
        Object.assign(ghost.style, {
            position: "absolute", inset: "auto", margin: "0", boxSizing: "border-box",
            width: `${Math.min(previous.width, box.width)}px`, height: `${Math.min(previous.height, box.height)}px`, minHeight: "0", maxHeight: "none",
            pointerEvents: "none", zIndex: "4", overflow: "hidden", transition: "none", animation: "none",
        });
        el.parentElement.appendChild(ghost);
        previous.scroll.forEach(({ source, copy, top, left }) => {
            if (!copy) return;
            copy.scrollTop = source.isConnected ? source.scrollTop : top;
            copy.scrollLeft = source.isConnected ? source.scrollLeft : left;
        });
        const parent = ghost.offsetParent as HTMLElement | null;
        const origin = parent?.getBoundingClientRect();
        ghost.style.left = `${box.left - (origin?.left ?? 0) + (parent?.scrollLeft ?? window.scrollX) - (parent?.clientLeft ?? 0)}px`;
        ghost.style.top = `${box.top - (origin?.top ?? 0) + (parent?.scrollTop ?? window.scrollY) - (parent?.clientTop ?? 0)}px`;
        const outgoing = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: exitDuration, fill: "both", easing: "ease-out" });
        outgoing.onfinish = () => ghost?.remove();
        animations.push(outgoing);
    }
    const rest = Number(getComputedStyle(el).opacity);
    const entrance = el.animate([{ opacity: ghost ? 0 : rest * .68 }, { opacity: rest }], {
        duration: level === "gentle" ? 105 : 165, delay: ghost ? exitDuration : 0,
        fill: "backwards", easing: "cubic-bezier(.22,1,.36,1)",
    });
    animations.push(entrance);
    let finished = false;
    const cancel = () => {
        if (finished) return;
        finished = true;
        animations.forEach(animation => animation.cancel());
        ghost?.remove();
    };
    animations[animations.length - 1].onfinish = cancel;
    return cancel;
}
