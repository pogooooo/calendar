"use client";

import styled, { keyframes } from "styled-components";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useSettingStore from "@/store/useSettingStore";
import useAuthStore from "@/store/useAuthStore";
import { LoginSchema } from "@/lib/schema";
import { useT } from "@/i18n/useT";
import LocaleSelect from "@/components/LocaleSelect";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import SingleInput from "@/components/input/single/SingleInput";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import PasswordInput from "@/components/input/password/PasswordInput";
import CelestialAuthPanel from "@/components/auth/CelestialAuthPanel";
import GoogleSignInButton from "@/components/button/googleSignIn/GoogleSignInButton";

type LoginFormData = z.infer<typeof LoginSchema>;

const SignIn = () => {
    const router = useRouter();
    const t = useT();
    const setTheme = useSettingStore((state) => state.setTheme);
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const setUser = useAuthStore((state) => state.setUser);

    const [globalError, setGlobalError] = useState<string>(" ");
    const [email, setEmail] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: "", password: "" },
    });

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: userInfo.email, name: userInfo.name, googleId: userInfo.sub, image: userInfo.picture }),
                });
                const data = await res.json();
                if (!res.ok) { setGlobalError(data.message || "구글 로그인 실패"); return; }
                setTheme(data.user.theme);
                setAccessToken(data.accessToken);
                setUser(data.user);
                router.push("/");
            } catch {
                setGlobalError("구글 로그인 중 오류가 발생했습니다.");
            }
        },
        onError: () => setGlobalError("구글 로그인 창이 닫혔거나 오류가 발생했습니다."),
    });

    const handleEmailLogin = async (formData: LoginFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setGlobalError(data.message || "로그인에 실패했습니다."); return; }
            setTheme(data.user.theme);
            setAccessToken(data.accessToken);
            setUser(data.user);
            router.push("/");
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : "로그인 중 오류 발생");
        }
    };

    return (
        <PageWrapper>
            <CelestialAuthPanel />

            <FormPanel>
                <LangToggle>
                    <LocaleSelect size="sm" />
                </LangToggle>

                <FormInner>
                    <FormTitle>{t.auth.signInTitle}</FormTitle>
                    <FormSubtitle>{t.auth.signInSubtitle}</FormSubtitle>

                    <GoogleSignInButton onClick={() => googleLogin()} />

                    <Separator>{t.auth.or}</Separator>

                    <form onSubmit={handleSubmit(handleEmailLogin)} style={{ width: "100%" }}>
                        <SingleInput type="text" $width={300} $height={40} label={t.auth.email} value={email}
                            {...register("email")} onChange={(e) => setEmail(e.target.value)} />
                        <InlineError>{errors.email?.message}</InlineError>

                        <PasswordInput $width={300} $height={40} label={t.auth.password} {...register("password")} />
                        <InlineError>{errors.password?.message}</InlineError>

                        <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                            {t.auth.emailSignIn}
                        </SecondaryButton>
                    </form>

                    <GlobalError>{globalError}</GlobalError>

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
    height: 100vh;
    background-color: ${p => p.theme.colors.surface};
    overflow: hidden;
`;

const FormPanel = styled.div`
    width: 460px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${p => p.theme.colors.surface};
    position: relative;
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
`;

const FormTitle = styled.h2`
    font-family: ${p => p.theme.fonts.celestial};
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

const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

export default SignIn;
