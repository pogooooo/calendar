"use client";

import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RegisterSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import LocaleSelect from "@/components/LocaleSelect";

import SingleInput from "@/components/input/single/SingleInput";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import PasswordInput from "@/components/input/password/PasswordInput";
import GlobalError from "@/components/error/globalError/GlobalError";
import InlineError from "@/components/error/inlineError/InlineError";
import CelestialAuthPanel from "@/components/auth/CelestialAuthPanel";

type RegisterFormData = z.infer<typeof RegisterSchema>;

const SignUp = () => {
    const router = useRouter();
    const t = useT();
    const [registerError, setRegisterError] = useState<string>(" ");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { name: "", email: "", password: "" },
        mode: "onChange",
    });

    const handleRegister = async (formData: RegisterFormData) => {
        setRegisterError(" ");
        try {
            const res = await fetch(api("/api/auth/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.push("/signIn");
            } else {
                const errorData = await res.json();
                setRegisterError(errorData.message || t.auth.signUpError);
            }
        } catch {
            setRegisterError(t.auth.networkError);
        }
    };

    return (
        <PageWrapper>
            <CelestialAuthPanel busy={isSubmitting} />

            <FormPanel>
                <LangToggle>
                    <LocaleSelect size="sm" />
                </LangToggle>

                <FormInner>
                    <FormTitle>{t.auth.signUpTitle}</FormTitle>
                    <FormSubtitle>{t.auth.signUpSubtitle}</FormSubtitle>

                    <form onSubmit={handleSubmit(handleRegister)} style={{ width: "100%" }}>
                        <SingleInput type="text" $width={300} $height={40} label={t.auth.name} {...register("name")} />
                        <InlineError>{errors.name?.message}</InlineError>

                        <SingleInput type="text" $width={300} $height={40} label={t.auth.email} {...register("email")} />
                        <InlineError>{errors.email?.message}</InlineError>

                        <PasswordInput $width={300} $height={40} label={t.auth.password} {...register("password")} />
                        <InlineError>{errors.password?.message}</InlineError>

                        <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                            {t.auth.emailSignUp}
                        </SecondaryButton>
                    </form>

                    <GlobalError>{registerError}</GlobalError>

                    <SwitchLink>
                        {t.auth.haveAccount}{" "}
                        <TertiaryButton onClick={() => router.push("/signIn")}>{t.auth.signInLink}</TertiaryButton>
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

const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

export default SignUp;
