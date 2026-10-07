/**
 * Maple 의 오브제 목록 — 아직 비어 있다. 여기에 `이름: ObjetDef` 를 더하면
 * <Objet name="maple/이름" /> 으로 어디서든 쓸 수 있다 (만드는 법은 ../types.ts, 본보기는 ../celestial/).
 */
import type { ObjetRegistry } from "../types";

const registry = {} satisfies ObjetRegistry;

export type MapleObjetName = keyof typeof registry;
export default registry as ObjetRegistry;
