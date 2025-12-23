"use client"

import styled from "styled-components";
import {useState} from "react";
import {useRouter} from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {RegisterSchema} from "@/lib/schema";

import SingleInput from "@/components/input/single/SingleInput";
import SecondaryButton from "@/components/button/secondary/SecondaryButton"
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import PasswordInput from "@/components/input/password/PasswordInput";
import GlobalError from "@/components/error/globalError/GlobalError";
import InlineError from "@/components/error/inlineError/InlineError";

type RegisterFormData = z.infer<typeof RegisterSchema>;

const SignUp = () => {
    const router = useRouter();

    const [registerError, setRegisterError] = useState<string>(" ");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { name: "", email: "", password: "" },
        mode: "onChange"
    });

    const handleRegister = async (formData: RegisterFormData) => {
        setRegisterError(" ");

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/signIn')
            } else {
                const errorData = await res.json();
                setRegisterError(errorData.message || '회원가입 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setRegisterError('네트워크 오류가 발생했습니다.');
            console.error('Registration failed:', err);
        }
    };

    return(
        <AuthDiv>
            <InputCard>
                <form onSubmit={handleSubmit(handleRegister)}>
                    <SingleInput type="text" $width={300} $height={40} label="이름" {...register("name")}/>
                    <InlineError>{errors.name?.message}</InlineError>

                    <SingleInput type="text" $width={300} $height={40} label="이메일" {...register("email")}/>
                    <InlineError>{errors.email?.message}</InlineError>

                    <PasswordInput $width={300} $height={40} {...register("password")} label="비밀번호"/>
                    <InlineError>{errors.password?.message}</InlineError>

                    <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                        회원가입
                    </SecondaryButton>
                </form>

                <GlobalError>{registerError}</GlobalError>

                <SwitchAuthModeLink>
                    이미 계정이 있으신가요? <TertiaryButton onClick={() => {
                    router.push("/signIn")
                }}>로그인</TertiaryButton>
                </SwitchAuthModeLink>
            </InputCard>
        </AuthDiv>
)
}

const AuthDiv = styled.div`
    background-color: ${
        (props) => props.theme.colors.surface
    };
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${(props) => props.theme.fonts.celestial_heading};
`;

const InputCard = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 300px;
`;

const SwitchAuthModeLink = styled.p`
    color: ${(props) => props.theme.colors.text};
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;
`;

export default SignUp
