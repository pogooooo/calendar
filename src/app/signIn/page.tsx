"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useSettingStore from "@/store/useSettingStore";
import useAuthStore from "@/store/useAuthStore";
import { LoginSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { getRemember } from "@/lib/session";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSignIn.styles";
import * as MapleS from "./maple/MapleSignIn.styles";
import LocaleSelect from "@/components/LocaleSelect";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import SingleInput from "@/components/input/single/SingleInput";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import PasswordInput from "@/components/input/password/PasswordInput";
import AuthPanel from "@/components/auth/AuthPanel";
import GoogleSignInButton from "@/components/button/googleSignIn/GoogleSignInButton";

type LoginFormData = z.infer<typeof LoginSchema>;

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };



const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const GoogleAuthArea = (props: {
    label: string;
    onToken: (accessToken: string) => void;
    onError: () => void;
}) => {
    const S = usePickTheme(STYLES);
    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => props.onToken(tokenResponse.access_token),
        onError: props.onError,
    });

    return (
        <>
            <GoogleSignInButton onClick={() => googleLogin()} />
            <S.Separator>{props.label}</S.Separator>
        </>
    );
};


const SignIn = () => {
    const S = usePickTheme(STYLES);
    const router = useRouter();
    const t = useT();
    const setTheme = useSettingStore((state) => state.setTheme);
    const beginSession = useAuthStore((state) => state.beginSession);

    const [globalError, setGlobalError] = useState<string>(" ");
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
        // 유지 여부는 지난번 고른 대로. 처음이면 켜짐.
        defaultValues: { email: "", password: "", remember: getRemember() },
    });
    const remember = watch("remember") ?? true;

    const handleGoogleToken = async (accessToken: string) => {
        setIsGoogleLoading(true);
        try {
            const res = await fetch(api("/api/auth/google"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ accessToken, remember }),
            });
            const data = await res.json();
            if (!res.ok) { setGlobalError(data.message || t.auth.googleFailed); setIsGoogleLoading(false); return; }
            setTheme(data.user.theme);
            beginSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, remember });
            router.push("/");
        } catch {
            setGlobalError(t.auth.googleError);
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        setIsGoogleLoading(false);
        setGlobalError(t.auth.googleWindowClosed);
    };

    const handleEmailLogin = async (formData: LoginFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setGlobalError(data.message || t.auth.signInFailed); return; }
            setTheme(data.user.theme);
            beginSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, remember: formData.remember ?? true });
            router.push("/");
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : t.auth.signInError);
        }
    };

    return (
        <S.PageWrapper>
            <AuthPanel busy={isSubmitting || isGoogleLoading} />

            <S.FormPanel>
                <S.LangToggle>
                    <LocaleSelect size="sm" />
                </S.LangToggle>

                <S.FormInner>
                    <S.FormTitle>{t.auth.signInTitle}</S.FormTitle>
                    <S.FormSubtitle>{t.auth.signInSubtitle}</S.FormSubtitle>

                    {GOOGLE_CLIENT_ID && (
                        <GoogleAuthArea label={t.auth.or} onToken={handleGoogleToken} onError={handleGoogleError} />
                    )}

                    <form onSubmit={handleSubmit(handleEmailLogin)} style={{ width: "100%" }}>
                        {/* onChange 를 따로 주면 register 가 붙여둔 onChange 를 덮어써서
                            react-hook-form 이 입력을 못 본다. 값은 폼이 알아서 들고 있는다. */}
                        <SingleInput type="text" $width={300} $height={40} label={t.auth.email}
                            {...register("email")} />
                        <InlineError>{errors.email?.message}</InlineError>

                        <PasswordInput $width={300} $height={40} label={t.auth.password} {...register("password")} />
                        <InlineError>{errors.password?.message}</InlineError>

                        <S.RememberRow>
                            <label>
                                <input type="checkbox" {...register("remember")} />
                                <span className="box" aria-hidden />
                                {t.auth.keepSignedIn}
                            </label>
                            <small>{remember ? t.auth.keepSignedInOn : t.auth.keepSignedInOff}</small>
                        </S.RememberRow>

                        <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                            {t.auth.emailSignIn}
                        </SecondaryButton>
                    </form>

                    <GlobalError>{globalError}</GlobalError>

                    <S.SwitchLink>
                        <TertiaryButton asChild>
                            <a href="/forgotPassword">{t.auth.forgotPasswordLink}</a>
                        </TertiaryButton>
                    </S.SwitchLink>

                    <S.SwitchLink>
                        {t.auth.noAccount}{" "}
                        <TertiaryButton asChild><a href="/signUp">{t.auth.signUpLink}</a></TertiaryButton>
                    </S.SwitchLink>
                </S.FormInner>
            </S.FormPanel>
        </S.PageWrapper>
    );
};

export default SignIn;
