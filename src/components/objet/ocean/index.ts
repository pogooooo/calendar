/**
 * Ocean 의 오브제 목록 — 바다를 품은 액체 유리(glass.ts)로 빚은 것들. <Objet name="ocean/이름" /> 으로 쓴다.
 *
 *   orb      구슬 — 유리 공 속에서 빛 그물이 흐른다 (테마 고르기). options.still: 올렸을 때만 흐른다
 *   drop     물방울 — 위가 뾰족한 눈물 모양, 천천히 돌며 일렁인다 (빈 할 일 · 제목 줄과 위젯 손잡이 줄은 still)
 *   shell    소라 — 앵무조개 나선, 자라며 생긴 마디 띠 (빈 프로젝트)
 *   bubbles  방울 — 크기대로 떠오르는 방울 몇 개 (빈 챌린지)
 *   pearl    진주 — 가리비 반쪽에 놓인 진주 한 알 (빈 기념일)
 */
import type { ObjetRegistry } from "../types";
import { bubbles } from "./bubbles";
import { drop } from "./drop";
import { orb } from "./orb";
import { pearl } from "./pearl";
import { shell } from "./shell";

const registry = {
    orb,
    drop,
    shell,
    bubbles,
    pearl,
} satisfies ObjetRegistry;

export type OceanObjetName = keyof typeof registry;
export default registry as ObjetRegistry;
