/**
 * Maple 의 드롭다운 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져온다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 드롭다운은 이제 고르기(Select)를 감싸 폭만 정한다(DropdownView 는 Sized 만 쓴다). 여는 칸·차림표의 모양은
 * MapleSelect.styles 가 맡는다 — 둥근 칸, 12px 카드 차림표, 올리면 옅게 물드는 줄, 고른 줄은 옅은 붉음과 체크.
 * 예전 드롭다운의 칸·목록(DropdownHeader·List·Item)은 뼈대의 것을 그대로 둔다(쓰는 화면이 없다).
 */
export * from "../celestial/CelestialDropdown.styles";
