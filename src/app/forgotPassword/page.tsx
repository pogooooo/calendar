"use client";

import styled, { keyframes } from "styled-components";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ForgotPasswordSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import LocaleSelect from "@/components/LocaleSelect";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import SingleInput from "@/components/input/single/SingleInput";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import CelestialAuthPanel from "@/components/auth/CelestialAuthPanel";

type ForgotFormData = z.infer<typeof ForgotPasswordSchema>;

const ForgotPassword = () => {
    const t = useT();

    const [globalError, setGlobalError] = useState<string>(" ");
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotFormData>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const handleForgot = async (formData: ForgotFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/password/forgot"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setGlobalError(data.message || "요청에 실패했습니다.");
                return;
            }
            // 계정 존재 여부와 무관하게 같은 화면을 보여준다.
            setSent(true);
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : "요청 중 오류 발생");
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
                    <FormTitle>{t.auth.forgotTitle}</FormTitle>
                    <FormSubtitle>{t.auth.forgotSubtitle}</FormSubtitle>

                    {sent ? (
                        <SentNotice>{t.auth.forgotSent}</SentNotice>
                    ) : (
                        <form onSubmit={handleSubmit(handleForgot)} style={{ width: "100%" }}>
                            <SingleInput type="text" $width={300} $height={40} label={t.auth.email} value={email}
                                {...register("email")} onChange={(e) => setEmail(e.target.value)} />
                            <InlineError>{errors.email?.message}</InlineError>

                            <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                                {t.auth.forgotSubmit}
                            </SecondaryButton>
                        </form>
                    )}

                    <GlobalError>{globalError}</GlobalError>

                    <SwitchLink>
                        <TertiaryButton asChild><a href="/signIn">{t.auth.backToSignIn}</a></TertiaryButton>
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

const SentNotice = styled.p`
    width: 100%;
    font-size: 0.82rem;
    line-height: 1.6;
    color: ${p => p.theme.colors.textSecondary};
    margin: 0;
`;

const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

export default ForgotPassword;
