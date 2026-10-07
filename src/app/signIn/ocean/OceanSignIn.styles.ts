/**
 * 바다의 로그인 화면 — 물빛 바탕 가운데에 상표 "Cronos"(OceanAuthPanel)와 떠 있는 판 하나.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (가입·비밀번호 화면도 같은 조각을 쓴다 — OceanAuthShore.styles)
 *
 * 왼쪽 그림판·금빛 실선·마름모 체크(Celestial), 도감·먹선·잎 체크(Maple) 대신:
 * 44px 입력칸, 청록으로 꽉 찬 넓은 단추, 머리카락 선의 "또는", 동그라미 체크.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSignIn.styles";
import * as A from "./OceanAuthShore.styles";

export * from "../celestial/CelestialSignIn.styles";

export const PageWrapper = styled(C.PageWrapper)`${A.shorePage}`;
export const FormPanel = styled(C.FormPanel)`${A.shoreCard}`;
export const LangToggle = styled(C.LangToggle)`${A.shoreToggle}`;
export const FormInner = styled(C.FormInner)`${A.shoreInner}`;
export const FormTitle = styled(C.FormTitle)`${A.shoreTitle}`;
export const FormSubtitle = styled(C.FormSubtitle)`${A.shoreSubtitle}`;
export const Separator = styled(C.Separator)`${A.shoreSeparator}`;
export const RememberRow = styled(C.RememberRow)`${A.shoreRemember}`;
export const SwitchLink = styled(C.SwitchLink)`${A.shoreSwitch}`;
