/**
 * 바다의 가입 화면 — 로그인과 같은 짜임: 물빛 바탕 가운데에 상표와 떠 있는 판 하나 (조각은 OceanAuthShore.styles).
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSignUp.styles";
import * as A from "@/app/signIn/ocean/OceanAuthShore.styles";

export * from "../celestial/CelestialSignUp.styles";

export const PageWrapper = styled(C.PageWrapper)`${A.shorePage}`;
export const FormPanel = styled(C.FormPanel)`${A.shoreCard}`;
export const LangToggle = styled(C.LangToggle)`${A.shoreToggle}`;
export const FormInner = styled(C.FormInner)`${A.shoreInner}`;
export const FormTitle = styled(C.FormTitle)`${A.shoreTitle}`;
export const FormSubtitle = styled(C.FormSubtitle)`${A.shoreSubtitle}`;
export const SwitchLink = styled(C.SwitchLink)`${A.shoreSwitch}`;
