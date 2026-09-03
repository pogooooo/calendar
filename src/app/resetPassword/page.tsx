"use client";

import styled, { keyframes } from "styled-components";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { passwordSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import LocaleSelect from "@/components/LocaleSelect";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import PasswordInput from "@/components/input/password/PasswordInput";
import CelestialAuthPanel from "@/components/auth/CelestialAuthPanel";

// 서버로는 token + password 만 보내고, 확인란은 화면에서만 검증한다.
const ResetFormSchema = z.object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "비밀번호를 한 번 더 입력해주세요."),
}).refine((v) => v.password === v.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
});

type ResetFormData = z.infer<typeof ResetFormSchema>;

const ResetPasswordForm = () => {
    const t = useT();
    const router = useRouter();
    const token = useSearchParams().get("token") ?? "";

    const [globalError, setGlobalError] = useState<string>(" ");
    const [done, setDone] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetFormData>({
        resolver: zodResolver(ResetFormSchema),
        defaultValues: { password: "", passwordConfirm: "" },
    });

    const handleReset = async (formData: ResetFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/password/reset"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ token, password: formData.password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setGlobalError(data.message || "비밀번호 변경에 실패했습니다.");
                return;
            }
            setDone(true);
            // 비밀번호가 바뀌면 기존 세션이 모두 끊기므로 로그인 화면으로 보낸다.
            setTimeout(() => router.push("/signIn"), 1800);
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : "요청 중 오류 발생");
        }
    };

    return (
        <FormInner>
            <FormTitle>{t.auth.resetTitle}</FormTitle>
            <FormSubtitle>{t.auth.resetSubtitle}</FormSubtitle>

            {!token ? (
                <Notice>{t.auth.resetInvalidLink}</Notice>
            ) : done ? (
                <Notice>{t.auth.resetDone}</Notice>
            ) : (
                <form onSubmit={handleSubmit(handleReset)} style={{ width: "100%" }}>
                    <PasswordInput $width={300} $height={40} label={t.auth.newPassword}
                        {...register("password")} />
                    <InlineError>{errors.password?.message}</InlineError>

                    <PasswordInput $width={300} $height={40} label={t.auth.newPasswordConfirm}
                        {...register("passwordConfirm")} />
                    <InlineError>{errors.passwordConfirm?.message}</InlineError>

                    <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                        {t.auth.resetSubmit}
                    </SecondaryButton>
                </form>
            )}

            <GlobalError>{globalError}</GlobalError>

            <SwitchLink>
                <TertiaryButton asChild><a href="/signIn">{t.auth.backToSignIn}</a></TertiaryButton>
            </SwitchLink>
        </FormInner>
    );
};

const ResetPassword = () => (
    <PageWrapper>
        <CelestialAuthPanel busy={false} />
        <FormPanel>
            <LangToggle>
                <LocaleSelect size="sm" />
            </LangToggle>
            {/* useSearchParams 는 정적 빌드에서 Suspense 경계를 요구한다 (데스크톱 export). */}
            <Suspense fallback={<FormInner />}>
                <ResetPasswordForm />
            </Suspense>
        </FormPanel>
    </PageWrapper>
);

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

const Notice = styled.p`
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

export default ResetPassword;
