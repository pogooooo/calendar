"use client";

import styled from "styled-components";
import {useGoogleLogin} from "@react-oauth/google";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {z} from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useSettingStore from "@/store/setting/useSettingStore";
import useAuthStore from "@/store/auth/useAuthStore"
import {LoginSchema} from "@/lib/schema";

import SecondaryButton from "@/components/button/secondary/SecondaryButton"
import SingleInput from "@/components/input/single/SingleInput";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import PasswordInput from "@/components/input/password/PasswordInput";

type LoginFormData = z.infer<typeof LoginSchema>;

const SignIn = () => {
    const router = useRouter();
    const setTheme = useSettingStore((state) => state.setTheme)
    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const setUser = useAuthStore((state) => state.setUser)

    const [globalError, setGlobalError] = useState<string>(" ");
    const [email, setEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: "", password: "" }
    });

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();

                const res = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: userInfo.email,
                        name: userInfo.name,
                        googleId: userInfo.sub,
                        image: userInfo.picture
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setGlobalError(data.message || '구글 로그인 실패');
                }

                setTheme(data.user.theme);
                setAccessToken(data.accessToken)
                setUser(data.user);
                router.push('/');

            } catch (err: unknown) {
                console.error("Google Login Error:", err);
                setGlobalError("구글 로그인 중 오류가 발생했습니다.");
            }
        },
        onError: () => {
            setGlobalError("구글 로그인 창이 닫혔거나 오류가 발생했습니다.");
        },
    });

    const handleEmailLogin = async (formData: LoginFormData) => {
        setGlobalError(" ");

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setGlobalError(data.message || '로그인에 실패했습니다.');
                return
            }

            setTheme(data.user.theme);
            setAccessToken(data.accessToken)
            setUser(data.user);

            router.push('/');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "로그인 중 오류 발생";
            setGlobalError(errorMessage);
        }
    };

    return(
        <AuthDiv>
            <InputCard>
                <SecondaryButton onClick={() => googleLogin()} $width={300} $height={40}>
                    구글로 계속하기
                </SecondaryButton>

                <Separator>또는</Separator>

                <form onSubmit={handleSubmit(handleEmailLogin)}>
                    <SingleInput type="text" $width={300} $height={40} label="이메일" value={email} {...register("email")}
                                 onChange={(e) => setEmail(e.target.value)}/>
                    <InlineError>{errors.email?.message}</InlineError>

                    <PasswordInput
                        $width={300}
                        $height={40}
                        label="비밀번호"
                        {...register("password")}
                    />
                    <InlineError>{errors.password?.message}</InlineError>

                    <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                        이메일로 로그인
                    </SecondaryButton>
                </form>

                <GlobalError>{globalError}</GlobalError>

                <SwitchAuthModeLink>
                    계정이 없으신가요? <TertiaryButton asChild><a href={'/signUp'}>회원가입</a></TertiaryButton>
                </SwitchAuthModeLink>
            </InputCard>
        </AuthDiv>
)
}

const AuthDiv = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const InputCard = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 300px;
`;

const Separator = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    text-align: center;
    color: ${(props) => props.theme.colors.text};
    font-size: 0.8rem;

    &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
    }

    &:not(:empty)::before {
        margin-right: .5em;
    }

    &:not(:empty)::after {
        margin-left: .5em;
    }
`;

const SwitchAuthModeLink = styled.p`
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;
`;

export default SignIn
