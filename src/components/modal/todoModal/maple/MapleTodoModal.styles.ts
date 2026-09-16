/**
 * Maple 의 모양. 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고,
 * 달라지는 것만 아래에서 styled(C.이름) 으로 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
export * from "../celestial/CelestialTodoModal.styles";
