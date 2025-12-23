"use client";

import styled from "styled-components";
import SecondaryButton from "@/components/button/secondary/secondaryButton"
import SingleInput from "@/components/input/single/singleInput";
import TertiaryButton from "@/components/button/tertiary/teritaryButton";
import {EyeIcon, EyeSlashIcon} from "@/components/svg/EyeIcon";
import {useGoogleLogin} from "@react-oauth/google";
import {useState} from "react";
import {useRouter} from "next/navigation";
import useSettingStore from "@/store/setting/useSettingStore";
import useAuthStore from "@/store/auth/useAuthStore"

const SignIn = () => {
    const router = useRouter();
    const setTheme = useSettingStore((state) => state.setTheme)

    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const setUser = useAuthStore((state) => state.setUser)

    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                    setError(data.message || '구글 로그인 실패');
                }

                localStorage.setItem('accessToken', data.accessToken);
                router.push('/');

            } catch (err: unknown) {
                console.error("Google Login Error:", err);
                setError("구글 로그인 중 오류가 발생했습니다.");
            }
        },
        onError: () => {
            setError("구글 로그인 창이 닫혔거나 오류가 발생했습니다.");
        },
    });

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
                return
            }

            setTheme(data.user.theme);
            setAccessToken(data.accessToken)
            setUser(data.user);

            router.push('/');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "로그인 중 오류 발생";
            setError(errorMessage);
            console.log(err);
        }
    };

    return(
        <AuthDiv>
            <InputCard>
                <SecondaryButton onClick={() => googleLogin()} $width={300} $height={40}>
                    구글로 계속하기
                </SecondaryButton>

                <Separator>또는</Separator>

                <SingleInput type="text" $width={300} $height={40} label="이메일" value={email} onChange={(e) => setEmail(e.target.value)}/>

                <PasswordInputWrapper>
                    <SingleInput type={showPassword ? "text" : "password"} $width={300} $height={40} label="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <PasswordToggleButton type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                    </PasswordToggleButton>
                </PasswordInputWrapper>

                <SecondaryButton onClick={handleEmailLogin} $width={300} $height={40}>
                    이메일로 로그인
                </SecondaryButton>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <SwitchAuthModeLink>
                    계정이 없으신가요? <TertiaryButton asChild><a href={'/signUp'}>회원가입</a></TertiaryButton>
                </SwitchAuthModeLink>
            </InputCard>
        </AuthDiv>
    )
}

const AuthDiv = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center
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

const ErrorMessage = styled.p`
    color: ${(props) => props.theme.colors.error};
    font-size: 0.875rem;
    text-align: center;
    min-height: 1.25rem;
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

const SwitchAuthModeLink = styled.p`
    color: ${(props) => props.theme.colors.text};
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;
`;

export default SignIn
