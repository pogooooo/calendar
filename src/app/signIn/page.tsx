"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useSettingStore from "@/store/useSettingStore";
import useAuthStore from "@/store/useAuthStore";
import { makeAuthSchemas, type LoginInput } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { getRemember } from "@/lib/session";
import { authFailure } from "@/lib/authFailure";
import { useRevalidateOnLocale } from "@/hooks/useRevalidateOnLocale";
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
import PolicyLink from "@/components/auth/PolicyLink";
import GoogleSignInButton from "@/components/button/googleSignIn/GoogleSignInButton";
import * as OceanS from './ocean/OceanSignIn.styles';

type LoginFormData = LoginInput;

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };



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
    const locale = useSettingStore((state) => state.locale);
    const setTheme = useSettingStore((state) => state.setTheme);
    const beginSession = useAuthStore((state) => state.beginSession);

    const [globalError, setGlobalError] = useState<string>(" ");
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    /** 비밀번호는 맞았는데 아직 메일 인증을 안 한 주소 — 있으면 "인증 메일 다시 보내기" 를 보인다 */
    const [unverified, setUnverified] = useState<string | null>(null);
    const [notice, setNotice] = useState<string>("");
    /** 처음 들어오는 구글 계정 — 만 14세 확인을 받고 같은 열쇠로 다시 부른다 (개인정보보호법 제22조의2) */
    const [pendingGoogle, setPendingGoogle] = useState<string | null>(null);
    const [googleAge, setGoogleAge] = useState(false);

    // 검사 문구가 화면 언어를 따르게 (규칙은 서버와 같은 src/lib/schema.ts)
    const schema = useMemo(() => makeAuthSchemas(t.auth.validation).login, [t]);
    const { register, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(schema),
        // 유지 여부는 지난번 고른 대로. 처음이면 켜짐.
        defaultValues: { email: "", password: "", remember: getRemember() },
    });
    useRevalidateOnLocale(schema, errors, trigger);
    const remember = watch("remember") ?? true;

    const handleGoogleToken = async (accessToken: string, ageConfirmed = false) => {
        setIsGoogleLoading(true);
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/google"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ accessToken, remember, ...(ageConfirmed ? { ageConfirmed: true } : {}) }),
            });
            if (res.status === 409) {
                const data = await res.clone().json().catch(() => null) as { code?: string } | null;
                if (data?.code === "AGE_CONFIRM_REQUIRED") {
                    setPendingGoogle(accessToken);
                    setGoogleAge(false);
                    setIsGoogleLoading(false);
                    return;
                }
            }
            if (!res.ok) {
                setGlobalError(await authFailure(res, { locale, t, fallback: t.auth.googleFailed }));
                setIsGoogleLoading(false);
                return;
            }
            const data = await res.json();
            setPendingGoogle(null);
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
        setNotice("");
        setUnverified(null);
        try {
            const res = await fetch(api("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            if (res.status === 403) {
                const data = await res.clone().json().catch(() => null) as { code?: string } | null;
                if (data?.code === "EMAIL_NOT_VERIFIED") {
                    setUnverified(formData.email.trim());
                    setGlobalError(t.auth.emailNotVerified);
                    return;
                }
            }
            if (!res.ok) {
                setGlobalError(await authFailure(res, { locale, t, byStatus: { 401: t.auth.invalidCredentials }, fallback: t.auth.signInFailed }));
                return;
            }
            const data = await res.json();
            setTheme(data.user.theme);
            beginSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, remember: formData.remember ?? true });
            router.push("/");
        } catch {
            // 서버에 닿지 못했다 — 'Failed to fetch' 같은 날것 대신
            setGlobalError(t.auth.networkError);
        }
    };

    const handleResendVerify = async () => {
        if (!unverified) return;
        try {
            const res = await fetch(api("/api/auth/verify/resend"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ email: unverified }),
            });
            if (!res.ok) {
                setGlobalError(await authFailure(res, { locale, t, fallback: t.auth.requestFailed }));
                return;
            }
            setGlobalError(" ");
            setNotice(t.auth.verifyResent);
        } catch {
            setGlobalError(t.auth.networkError);
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
                        <GoogleAuthArea label={t.auth.or} onToken={(token) => handleGoogleToken(token)} onError={handleGoogleError} />
                    )}

                    {pendingGoogle && (
                        <S.RememberRow>
                            <small style={{ paddingLeft: 0 }}>{t.auth.googleAgeTitle}</small>
                            <label>
                                <input type="checkbox" checked={googleAge} onChange={(e) => setGoogleAge(e.target.checked)} />
                                <span className="box" aria-hidden />
                                {t.auth.ageConfirm}
                            </label>
                            <small>
                                {t.auth.policyNotice}{" "}
                                <PolicyLink>{t.auth.privacyPolicy}</PolicyLink>
                            </small>
                            <SecondaryButton type="button" $width={300} $height={40} disabled={!googleAge || isGoogleLoading}
                                onClick={() => handleGoogleToken(pendingGoogle, true)}>
                                {t.auth.googleAgeContinue}
                            </SecondaryButton>
                        </S.RememberRow>
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
                    {notice && <S.Notice>{notice}</S.Notice>}
                    {unverified && !notice && (
                        <S.SwitchLink>
                            <TertiaryButton onClick={handleResendVerify}>{t.auth.verifyResend}</TertiaryButton>
                        </S.SwitchLink>
                    )}

                    <S.SwitchLink>
                        <TertiaryButton asChild>
                            <a href="/forgotPassword">{t.auth.forgotPasswordLink}</a>
                        </TertiaryButton>
                    </S.SwitchLink>

                    <S.SwitchLink>
                        {t.auth.noAccount}{" "}
                        <TertiaryButton asChild><a href="/signUp">{t.auth.signUpLink}</a></TertiaryButton>
                    </S.SwitchLink>

                    <S.SwitchLink>
                        <TertiaryButton asChild><PolicyLink>{t.auth.privacyPolicy}</PolicyLink></TertiaryButton>
                    </S.SwitchLink>
                </S.FormInner>
            </S.FormPanel>
        </S.PageWrapper>
    );
};

export default SignIn;
