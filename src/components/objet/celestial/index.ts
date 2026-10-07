/**
 * Celestial 의 오브제 목록 — 금으로 만든 천문 기구들. <Objet name="celestial/이름" /> 으로 쓴다.
 *
 *   armillary  혼천의 — 사이드바 상징, 로그인·가입 그림의 주인공 (options: detail 'emblem'|'hero', tilt)
 *   astrolabe  아스트롤라베 — 성좌판이 천천히 돈다 (빈 프로젝트)
 *   telescope  망원경 — 별 하나를 겨누고 하늘을 훑는다 (빈 챌린지)
 *   hourglass  모래시계 — 금모래가 떨어진다 (빈 할 일)
 *   moon       달 — 위상이 돈다 (빈 기념일). options.phase 'today' 면 오늘의 실제 위상에 멈춘 달
 */
import type { ObjetRegistry } from "../types";
import { armillary } from "./armillary";
import { astrolabe } from "./astrolabe";
import { hourglass } from "./hourglass";
import { moon } from "./moon";
import { telescope } from "./telescope";

const registry = {
    armillary,
    astrolabe,
    telescope,
    hourglass,
    moon,
} satisfies ObjetRegistry;

export type CelestialObjetName = keyof typeof registry;
export default registry as ObjetRegistry;
