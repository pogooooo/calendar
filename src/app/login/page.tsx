"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import theme from '@/styles/theme'
import Link from 'next/link';
import Input from '@/components/celestial/input/input'
import DefaultButton from "@/components/celestial/button/default_button";
import CrescentMoon from "@/components/crescentMoon";
import styled, { ThemeProvider } from 'styled-components';

// --- Icon Components ---
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
    </svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
);

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.79 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

// --- Styled Components ---
const AuthDiv = styled.div`
    background-color: ${(props) => props.theme.celestial.surface};
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
    color: ${(props) => props.theme.celestial.border};
    display: flex;
    align-items: center;

    &:hover {
        color: ${(props) => props.theme.celestial.primary};
    }
`;

const Separator = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    text-align: center;
    color: ${(props) => props.theme.celestial.text};
    font-size: 0.8rem;

    &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid ${(props) => props.theme.celestial.border};
    }

    &:not(:empty)::before {
        margin-right: .5em;
    }

    &:not(:empty)::after {
        margin-left: .5em;
    }
`;

const ErrorMessage = styled.p`
    color: #ef4444;
    font-size: 0.875rem;
    text-align: center;
    min-height: 1.25rem; // 에러 메시지 공간 확보
`;

const SwitchAuthModeLink = styled.p`
    color: ${(props) => props.theme.celestial.text};
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;

    span {
        color: ${(props) => props.theme.celestial.primary};
        cursor: pointer;
        font-weight: 500;
        &:hover {
            text-decoration: underline;
        }
    }
`;


// --- Auth Page Component ---
export default function AuthPage() {
    const [isRegistering, setIsRegistering] = useState(false);

    // Login States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Register States
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

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
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError('이메일 또는 비밀번호가 일치하지 않습니다.');
        } else if (result?.ok) {
            router.push('/');
        }
    };

    const handleRegister = async () => {
        setRegisterError(null);
        if (!registerName || !registerEmail || !registerPassword) {
            setRegisterError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/register', {
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
                {/*<CrescentMoon />*/}
                <InputCard>
                    {isRegistering ? (
                        // --- 회원가입 뷰 ---
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
                                <PasswordToggleButton type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                    {showRegisterPassword ? <EyeSlashIcon /> : <EyeIcon />}
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
                        // --- 로그인 뷰 ---
                        <>
                            <h2>로그인</h2>
                            <DefaultButton
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                                $width={300}
                                $height={40}
                                label="구글로 계속하기"
                            >
                                <GoogleIcon />
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
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
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

