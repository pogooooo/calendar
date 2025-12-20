"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {themes} from '@/styles/theme'
import Input from '@/components/celestial/input/input'
import DefaultButton from "@/components/celestial/button/default_button";
import styled, { ThemeProvider } from 'styled-components';
import {EyeIcon, EyeSlashIcon} from "../../components/svg/EyeIcon"
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.79 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

export default function AuthPage() {
    const [isRegistering, setIsRegistering] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

    const [theme, setTheme] = useState(themes.celestial);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError('이메일 또는 비밀번호가 일치하지 않습니다.');
        }
    }, [searchParams]);

    const handleEmailLogin = async () => {
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || '로그인에 실패했습니다.');
            }

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            console.log('로그인 성공:', data.user);

            router.push('/');

        } catch (err: any) {
            setError(err.message);
        }
    };

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
                    throw new Error(data.message || '구글 로그인 실패');
                }

                localStorage.setItem('accessToken', data.accessToken);
                router.push('/');

            } catch (err: any) {
                console.error("Google Login Error:", err);
                setError("구글 로그인 중 오류가 발생했습니다.");
            }
        },
        onError: () => {
            setError("구글 로그인 창이 닫혔거나 오류가 발생했습니다.");
        },
    });

    const handleRegister = async () => {
        setRegisterError(null);
        if (!registerName || !registerEmail || !registerPassword) {
            setRegisterError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
            });

            if (res.ok) {
                alert('회원가입에 성공했습니다! 로그인 화면으로 돌아갑니다.');
                setIsRegistering(false);
                setRegisterName('');
                setRegisterEmail('');
                setRegisterPassword('');
            } else {
                const errorData = await res.json();
                setRegisterError(errorData.message || '회원가입 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setRegisterError('네트워크 오류가 발생했습니다.');
            console.error('Registration failed:', err);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <AuthDiv>
                <InputCard>
                    {isRegistering ? (
                        <>
                            <h2>회원가입</h2>
                            <Input
                                type="text"
                                $width={300}
                                $height={40}
                                label="이름"
                                value={registerName}
                                onChange={(e) => setRegisterName(e.target.value)}
                            />
                            <Input
                                type="text"
                                $width={300}
                                $height={40}
                                label="이메일"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                            />
                            <PasswordInputWrapper>
                                <Input
                                    type={showRegisterPassword ? "text" : "password"}
                                    $width={300}
                                    $height={40}
                                    label="비밀번호"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                />
                                <PasswordToggleButton type="button"
                                                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                    {showRegisterPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                                </PasswordToggleButton>
                            </PasswordInputWrapper>
                            <DefaultButton
                                onClick={handleRegister}
                                $width={300}
                                $height={40}
                                label="회원가입"
                            />
                            {registerError && <ErrorMessage>{registerError}</ErrorMessage>}
                            <SwitchAuthModeLink>
                                이미 계정이 있으신가요? <span onClick={() => setIsRegistering(false)}>로그인</span>
                            </SwitchAuthModeLink>
                        </>
                    ) : (
                        <>
                            <h2>로그인</h2>
                            <DefaultButton
                                onClick={() => googleLogin()}
                                $width={300}
                                $height={40}
                                label="구글로 계속하기"
                            >
                                <GoogleIcon/>
                            </DefaultButton>

                            <Separator>또는</Separator>

                            <Input
                                type="text"
                                $width={300}
                                $height={40}
                                label="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <PasswordInputWrapper>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    $width={300}
                                    $height={40}
                                    label="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <PasswordToggleButton type="button" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                                </PasswordToggleButton>
                            </PasswordInputWrapper>

                            <DefaultButton
                                onClick={handleEmailLogin}
                                $width={300}
                                $height={40}
                                label="이메일로 로그인"
                            />

                            {error && <ErrorMessage>{error}</ErrorMessage>}

                            <SwitchAuthModeLink>
                                계정이 없으신가요? <span onClick={() => setIsRegistering(true)}>회원가입</span>
                            </SwitchAuthModeLink>
                        </>
                    )}
                </InputCard>
            </AuthDiv>
        </ThemeProvider>
    );
}

const AuthDiv = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
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

const PasswordInputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const PasswordToggleButton = styled.button`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${(props) => props.theme.colors.border};
    display: flex;
    align-items: center;

    &:hover {
        color: ${(props) => props.theme.colors.primary};
    }
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

const ErrorMessage = styled.p`
    color: ${(props) => props.theme.colors.error};
    font-size: 0.875rem;
    text-align: center;
    min-height: 1.25rem;
`;

const SwitchAuthModeLink = styled.p`
    color: ${(props) => props.theme.colors.text};
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;

    span {
        color: ${(props) => props.theme.colors.primary};
        cursor: pointer;
        font-weight: 500;
        &:hover {
            text-decoration: underline;
        }
    }
`;
