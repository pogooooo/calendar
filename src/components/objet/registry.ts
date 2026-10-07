/**
 * 오브제 이름표 — '갈래/이름' (예: 'celestial/armillary').
 *
 * 갈래마다 제 목록(celestial/index.ts·maple/index.ts·ocean/index.ts)을 갖고, 처음 쓸 때 받는다(동적 import) —
 * three 와 오브제 코드가 첫 화면을 무겁게 하지 않는다. 새 오브제는 그 갈래의 index.ts 에 한 줄 더하면
 * 이름(ObjetName)이 타입으로 바로 잡힌다.
 */
import type { ObjetDef, ObjetRegistry } from "./types";
import type { CelestialObjetName } from "./celestial";
import type { MapleObjetName } from "./maple";
import type { OceanObjetName } from "./ocean";

export type ObjetName =
    | `celestial/${CelestialObjetName}`
    | `maple/${MapleObjetName}`
    | `ocean/${OceanObjetName}`;

const FAMILIES: Record<string, () => Promise<ObjetRegistry>> = {
    celestial: () => import("./celestial").then((m) => m.default),
    maple: () => import("./maple").then((m) => m.default),
    ocean: () => import("./ocean").then((m) => m.default),
};

/** 이름으로 오브제를 찾는다. 없으면 null */
export async function loadObjet(name: string): Promise<ObjetDef | null> {
    const cut = name.indexOf("/");
    const load = FAMILIES[name.slice(0, cut)];
    if (cut < 1 || !load) return null;
    const registry = await load();
    return registry[name.slice(cut + 1)] ?? null;
}
