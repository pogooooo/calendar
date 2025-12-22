"use client"

import styled from "styled-components";
import SingleInput from "@/components/input/single/singleInput";
import SecondaryButton from "@/components/button/secondary/secondaryButton"
import {EyeIcon, EyeSlashIcon} from "@/components/svg/EyeIcon";
import {useState} from "react";
import {useRouter} from "next/navigation";

const SignUp = () => {
    const router = useRouter();

    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

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

    return(
        <AuthDiv>
            <InputCard>
                <h2>회원가입</h2>
                <SingleInput
                    type="text"
                    $width={300}
                    $height={40}
                    label="이름"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                />
                <SingleInput
                    type="text"
                    $width={300}
                    $height={40}
                    label="이메일"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                />
                <PasswordInputWrapper>
                    <SingleInput
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
                <SecondaryButton
                    onClick={handleRegister}
                    $width={300}
                    $height={40}
                >회원가입</SecondaryButton>
                {registerError && <ErrorMessage>{registerError}</ErrorMessage>}
                <SwitchAuthModeLink>
                    이미 계정이 있으신가요? <span onClick={() => {router.push("/signIn")}}>로그인</span>
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

export default SignUp
