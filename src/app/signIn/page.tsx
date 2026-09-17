"use client";

import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
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

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const GoogleAuthArea = (props: {
    label: string;
    onToken: (accessToken: string) => void;
    onError: () => void;
}) => {
    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => props.onToken(tokenResponse.access_token),
        onError: props.onError,
    });

    return (
        <>
            <GoogleSignInButton onClick={() => googleLogin()} />
            <Separator>{props.label}</Separator>
        </>
    );
};

const SignIn = () => {
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
        <PageWrapper>
            <AuthPanel busy={isSubmitting || isGoogleLoading} />

            <FormPanel>
                <LangToggle>
                    <LocaleSelect size="sm" />
                </LangToggle>

                <FormInner>
                    <FormTitle>{t.auth.signInTitle}</FormTitle>
                    <FormSubtitle>{t.auth.signInSubtitle}</FormSubtitle>

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

                        <RememberRow>
                            <label>
                                <input type="checkbox" {...register("remember")} />
                                <span className="box" aria-hidden />
                                {t.auth.keepSignedIn}
                            </label>
                            <small>{remember ? t.auth.keepSignedInOn : t.auth.keepSignedInOff}</small>
                        </RememberRow>

                        <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                            {t.auth.emailSignIn}
                        </SecondaryButton>
                    </form>

                    <GlobalError>{globalError}</GlobalError>

                    <SwitchLink>
                        <TertiaryButton asChild>
                            <a href="/forgotPassword">{t.auth.forgotPasswordLink}</a>
                        </TertiaryButton>
                    </SwitchLink>

                    <SwitchLink>
                        {t.auth.noAccount}{" "}
                        <TertiaryButton asChild><a href="/signUp">{t.auth.signUpLink}</a></TertiaryButton>
                    </SwitchLink>
                </FormInner>
            </FormPanel>
        </PageWrapper>
    );
};

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
    display: flex;
    width: 100vw;
    /* 데스크톱 타이틀바 높이만큼 줄인다 (웹에서는 0) */
    height: calc(100vh - var(--titlebar-h, 0px));
    background-color: ${p => p.theme.colors.surface};
    overflow: hidden;

    /* 폰에서는 화면 위쪽이 상태 표시줄 자리다. 비켜 주지 않으면 언어 고르개가 시계에 깔린다. */
    ${MOBILE} {
        height: 100dvh;
        padding-top: env(safe-area-inset-top, 0px);
    }
`;

const FormPanel = styled.div`
    width: 460px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${p => p.theme.colors.surface};
    position: relative;

    /* 폰에서는 배경 그림 패널이 숨으므로 폼이 화면 전체를 쓴다. */
    ${MOBILE} {
        width: 100%;
        padding: 0 20px;
    }
`;

const LangToggle = styled.div`
    position: absolute;
    top: 24px;
    right: 24px;
`;

const FormInner = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 300px;
    animation: ${fadeUp} 0.6s ease 0.15s both;

    /* 폰에서는 폭을 고정하지 않는다. 300px 로 못 박으면 좁은 화면에서 치우친다. */
    ${MOBILE} {
        width: 100%;
        max-width: 340px;

        /* 제출 단추만 넓힌다. form button 으로 잡으면 입력칸 안의 눈 아이콘까지 늘어난다. */
        form > button, & > button { width: 100%; }
    }
`;

const FormTitle = styled.h2`
    font-family: ${p => p.theme.fonts.display};
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.text};
    margin: 0 0 2px;
    align-self: flex-start;
`;

const FormSubtitle = styled.p`
    font-size: 0.78rem;
    color: ${p => p.theme.colors.textSecondary};
    margin: 0 0 8px;
    align-self: flex-start;
`;

const Separator = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    color: ${p => p.theme.colors.textSecondary};
    font-size: 0.75rem;
    letter-spacing: 1px;

    &::before, &::after {
        content: "";
        flex: 1;
        border-bottom: 1px solid ${p => p.theme.colors.primary};
        opacity: 0.3;
    }
    &::before { margin-right: 10px; }
    &::after  { margin-left:  10px; }
`;

/* 마름모 체크 — 앱 곳곳의 ◇/◆ 와 같은 말 */
const RememberRow = styled.div`
    width: 100%;
    margin: 2px 0 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: ${p => p.theme.colors.text};
        cursor: pointer;
        user-select: none;
    }

    input { position: absolute; opacity: 0; width: 0; height: 0; }

    .box {
        width: 10px; height: 10px;
        border: 1px solid ${p => p.theme.colors.primary};
        transform: rotate(45deg);
        transition: background 0.15s;
    }
    input:checked + .box { background: ${p => p.theme.colors.primary}; }
    input:focus-visible + .box { box-shadow: 0 0 0 3px ${p => p.theme.colors.primary}44; }

    small {
        font-size: 0.7rem;
        color: ${p => p.theme.colors.textSecondary};
        padding-left: 18px;
    }
`;

const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

export default SignIn;
