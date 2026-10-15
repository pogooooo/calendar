/**
 * Maple 의 비밀번호 재설정 화면(오른쪽 서식 판) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 서식의 말(표제·소개·링크·안내)은 로그인 화면과 같다 — MapleAuthForm.styles.
 * 여기의 Notice(옅은 붉음 안내 판)는 로그인·가입 화면도 가져다 쓴다(인증 메일을 보냈다는 말).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialResetPassword.styles";
import { authInner, authNotice, authPanel, authSubtitle, authSwitch, authTitle } from "@/app/signIn/maple/MapleAuthForm.styles";

export * from "../celestial/CelestialResetPassword.styles";

export const FormPanel = styled(C.FormPanel)`${authPanel}`;
export const FormInner = styled(C.FormInner)`${authInner}`;
export const FormTitle = styled(C.FormTitle)`${authTitle}`;
export const FormSubtitle = styled(C.FormSubtitle)`${authSubtitle}`;
export const SwitchLink = styled(C.SwitchLink)`${authSwitch}`;

export const Notice = styled(C.Notice)`${authNotice}`;
