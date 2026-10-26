"use client";

import * as GemS from "./gem/GemSignUp.styles";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { makeAuthSchemas, type RegisterInput } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { authFailure } from "@/lib/authFailure";
import { useRevalidateOnLocale } from "@/hooks/useRevalidateOnLocale";
import useSettingStore from "@/store/useSettingStore";
import { fx } from "@/lib/fx";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSignUp.styles";
import * as MapleS from "./maple/MapleSignUp.styles";
import LocaleSelect from "@/components/LocaleSelect";

import SingleInput from "@/components/input/single/SingleInput";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import PasswordInput from "@/components/input/password/PasswordInput";
import GlobalError from "@/components/error/globalError/GlobalError";
import InlineError from "@/components/error/inlineError/InlineError";
import AuthPanel from "@/components/auth/AuthPanel";
import PolicyLink from "@/components/auth/PolicyLink";
import * as OceanS from './ocean/OceanSignUp.styles';

type RegisterFormData = RegisterInput;

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };


/**
 * 가입 — 만 14세 확인을 받고(개인정보보호법 제22조의2), 가입하면 인증 메일을 보낸다.
 * 메일의 링크를 눌러야 로그인할 수 있으므로 가입 뒤에는 그 안내와 "다시 보내기" 를 보인다.
 */
const SignUp = () => {
    const S = usePickTheme(STYLES);
    const router = useRouter();
    const t = useT();
    const locale = useSettingStore((s) => s.locale);
    const [registerError, setRegisterError] = useState<string>(" ");
    /** 가입이 끝나 인증 메일을 보낸 주소 — 있으면 폼 대신 안내 */
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [resent, setResent] = useState(false);

    // 검사 문구가 화면 언어를 따르게 (규칙은 서버와 같은 src/lib/schema.ts)
    const schema = useMemo(() => makeAuthSchemas(t.auth.validation).register, [t]);
    const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", password: "" },
        mode: "onChange",
    });
    useRevalidateOnLocale(schema, errors, trigger);

    const handleRegister = async (formData: RegisterFormData) => {
        setRegisterError(" ");
        try {
            const res = await fetch(api("/api/auth/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                fx.emit("welcome");
                setSentTo(formData.email.trim());
            } else {
                setRegisterError(await authFailure(res, { locale, t, byStatus: { 409: t.auth.emailTaken }, fallback: t.auth.signUpError }));
            }
        } catch {
            setRegisterError(t.auth.networkError);
        }
    };

    const handleResend = async () => {
        if (!sentTo) return;
        setRegisterError(" ");
        try {
            const res = await fetch(api("/api/auth/verify/resend"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ email: sentTo }),
            });
            if (!res.ok) {
                setRegisterError(await authFailure(res, { locale, t, fallback: t.auth.requestFailed }));
                return;
            }
            setResent(true);
        } catch {
            setRegisterError(t.auth.networkError);
        }
    };

    return (
        <S.PageWrapper>
            <AuthPanel busy={isSubmitting} />

            <S.FormPanel>
                <S.LangToggle>
                    <LocaleSelect size="sm" />
                </S.LangToggle>

                <S.FormInner>
                    {sentTo ? (
                        <>
                            <S.FormTitle>{t.auth.verifySentTitle}</S.FormTitle>
                            <S.Notice>{resent ? t.auth.verifyResent : t.auth.verifySent(sentTo)}</S.Notice>
                            <SecondaryButton type="button" $width={300} $height={40} onClick={() => router.push("/signIn")}>
                                {t.auth.signInLink}
                            </SecondaryButton>
                            <GlobalError>{registerError}</GlobalError>
                            <S.SwitchLink>
                                <TertiaryButton onClick={handleResend}>{t.auth.verifyResend}</TertiaryButton>
                            </S.SwitchLink>
                        </>
                    ) : (
                        <>
                            <S.FormTitle>{t.auth.signUpTitle}</S.FormTitle>
                            <S.FormSubtitle>{t.auth.signUpSubtitle}</S.FormSubtitle>

                            <form onSubmit={handleSubmit(handleRegister)} style={{ width: "100%" }}>
                                <SingleInput type="text" $width={300} $height={40} label={t.auth.name} {...register("name")} />
                                <InlineError>{errors.name?.message}</InlineError>

                                <SingleInput type="text" $width={300} $height={40} label={t.auth.email} {...register("email")} />
                                <InlineError>{errors.email?.message}</InlineError>

                                <PasswordInput $width={300} $height={40} label={t.auth.password} {...register("password")} />
                                <InlineError>{errors.password?.message}</InlineError>

                                <S.ConsentRow>
                                    <label>
                                        <input type="checkbox" {...register("ageConfirmed")} />
                                        <span className="box" aria-hidden />
                                        {t.auth.ageConfirm}
                                    </label>
                                    <small>
                                        {t.auth.policyNotice}{" "}
                                        <PolicyLink>{t.auth.privacyPolicy}</PolicyLink>
                                    </small>
                                </S.ConsentRow>
                                <InlineError>{errors.ageConfirmed?.message}</InlineError>

                                <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                                    {t.auth.emailSignUp}
                                </SecondaryButton>
                            </form>

                            <GlobalError>{registerError}</GlobalError>

                            <S.SwitchLink>
                                {t.auth.haveAccount}{" "}
                                <TertiaryButton onClick={() => router.push("/signIn")}>{t.auth.signInLink}</TertiaryButton>
                            </S.SwitchLink>
                        </>
                    )}
                </S.FormInner>
            </S.FormPanel>
        </S.PageWrapper>
    );
};

export default SignUp;
