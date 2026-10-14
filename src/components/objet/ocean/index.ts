/**
 * Ocean 의 오브제 목록 — 바다를 품은 액체 유리(glass.ts)로 빚은 것들. <Objet name="ocean/이름" /> 으로 쓴다.
 *
 *   orb      구슬 — 유리 공 속에서 빛 그물이 흐른다 (테마 고르기). options.still: 올렸을 때만 흐른다
 *   drop     물방울 — 위가 뾰족한 눈물 모양, 천천히 돌며 일렁인다 (제목 줄 · 위젯 손잡이 줄)
 *
 * 빈 자리 그림이던 소라·방울·진주(와 빈 할 일의 물방울)는 걷었다 — 빈 자리는 한 빛깔 아이콘으로(OceanEmptyArt).
 */
import type { ObjetRegistry } from "../types";
import { drop } from "./drop";
import { orb } from "./orb";

const registry = {
    orb,
    drop,
} satisfies ObjetRegistry;

export type OceanObjetName = keyof typeof registry;
export default registry as ObjetRegistry;
