"use client";

import styled, { keyframes } from "styled-components";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RegisterSchema } from "@/lib/schema";

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
    const [registerError, setRegisterError] = useState<string>(" ");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { name: "", email: "", password: "" },
        mode: "onChange",
    });

    const handleRegister = async (formData: RegisterFormData) => {
        setRegisterError(" ");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.push("/signIn");
            } else {
                const errorData = await res.json();
                setRegisterError(errorData.message || "회원가입 중 오류가 발생했습니다.");
            }
        } catch {
            setRegisterError("네트워크 오류가 발생했습니다.");
        }
    };

    return (
        <PageWrapper>
            <CelestialAuthPanel />

            <FormPanel>
                <FormInner>
                    <FormTitle>회원가입</FormTitle>
                    <FormSubtitle>새 계정을 만듭니다</FormSubtitle>

                    <form onSubmit={handleSubmit(handleRegister)} style={{ width: "100%" }}>
                        <SingleInput type="text" $width={300} $height={40} label="이름" {...register("name")} />
                        <InlineError>{errors.name?.message}</InlineError>

                        <SingleInput type="text" $width={300} $height={40} label="이메일" {...register("email")} />
                        <InlineError>{errors.email?.message}</InlineError>

                        <PasswordInput $width={300} $height={40} label="비밀번호" {...register("password")} />
                        <InlineError>{errors.password?.message}</InlineError>

                        <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                            회원가입
                        </SecondaryButton>
                    </form>

                    <GlobalError>{registerError}</GlobalError>

                    <SwitchLink>
                        이미 계정이 있으신가요?{" "}
                        <TertiaryButton onClick={() => router.push("/signIn")}>로그인</TertiaryButton>
                    </SwitchLink>
                </FormInner>
            </FormPanel>
        </PageWrapper>
    );
};

/* ── Animations ──────────────────────────────────────────────────────────── */

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`;

/* ── Styled Components ───────────────────────────────────────────────────── */

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

const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

export default SignUp;
