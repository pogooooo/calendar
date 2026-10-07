/**
 * Maple 의 오브제 목록 — 도감의 것들. <Objet name="maple/이름" /> 으로 쓴다.
 *
 *   leaf    잎 — 수채 단풍잎 한 장의 표본, 꼭지를 축으로 천천히 돈다 (테마 고르기). options: sprite·still
 *   samara  시과 — 날개 달린 단풍 씨앗이 떨어질 때처럼 빙글 돈다. options.still
 *
 * 잎 그림을 먼저 받아 둔 뒤에 목록을 넘긴다(art.ts) — 오브제는 create() 에서 그림이 바로 있어야 한다.
 * (목록을 받는 쪽(registry.ts)은 await 하므로, 내보내는 것이 약속이어도 그대로 받는다)
 */
import type { ObjetRegistry } from "../types";
import { preloadMapleArt } from "./art";
import { leaf } from "./leaf";
import { samara } from "./samara";

const registry = {
    leaf,
    samara,
} satisfies ObjetRegistry;

export type MapleObjetName = keyof typeof registry;
export default preloadMapleArt().then(() => registry as ObjetRegistry);
