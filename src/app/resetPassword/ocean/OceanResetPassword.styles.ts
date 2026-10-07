/**
 * 바다의 새 비밀번호 화면 — 로그인과 같은 짜임: 물빛 바탕 가운데에 상표와 떠 있는 판 하나 (조각은 OceanAuthShore.styles).
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다. 안내는 옅은 청록 쪽지.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialResetPassword.styles";
import * as A from "@/app/signIn/ocean/OceanAuthShore.styles";

export * from "../celestial/CelestialResetPassword.styles";

export const PageWrapper = styled(C.PageWrapper)`${A.shorePage}`;
export const FormPanel = styled(C.FormPanel)`${A.shoreCard}`;
export const LangToggle = styled(C.LangToggle)`${A.shoreToggle}`;
export const FormInner = styled(C.FormInner)`${A.shoreInner}`;
export const FormTitle = styled(C.FormTitle)`${A.shoreTitle}`;
export const FormSubtitle = styled(C.FormSubtitle)`${A.shoreSubtitle}`;
export const Notice = styled(C.Notice)`${A.shoreNotice}`;
export const SwitchLink = styled(C.SwitchLink)`${A.shoreSwitch}`;
