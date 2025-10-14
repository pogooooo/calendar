"use client";

import { useState, useEffect } from 'react'; // useEffect 임포트
import { useRouter } from 'next/navigation';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

// --- Styled Components Definition ---

// 1. 전역 스타일: 모던한 폰트 및 다크 모드 배경색 설정
const GlobalStyle = createGlobalStyle`
    /* Gowun Dodum 대신 깔끔하고 모던한 Noto Sans KR 폰트 사용 */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&display=swap');

    body {
        font-family: 'Noto Sans KR', sans-serif;
        background-color: #0D1117; // 깊은 네이비/블랙 배경
    }
`;

// 2. CSS만으로 별이 반짝이는 효과 구현 (3개의 레이어로 깊이감 부여)
const sparkle = keyframes`
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
`;

const generateStars = (count: number, size: string) => {
    let boxShadow = '';
    for (let i = 0; i < count; i++) {
        // 별 색상을 노란색 계열로 변경
        boxShadow += `${Math.random() * 2000}px ${Math.random() * 2000}px ${size} rgba(255, 223, 100, 0.8), `;
    }
    return boxShadow.slice(0, -2);
};

const Stars = styled.div`
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    box-shadow: ${generateStars(70, '1px')};
    animation: ${sparkle} 5s linear infinite;
`;

const Stars2 = styled(Stars)`
    box-shadow: ${generateStars(30, '2px')};
    animation-duration: 7s;
`;

const Stars3 = styled(Stars)`
    box-shadow: ${generateStars(15, '3px')};
    animation-duration: 10s;
`;

// 3. 전체 페이지를 감싸는 배경 컴포넌트
const CelestialBackground = styled.div.attrs({
    className: "relative w-full min-h-screen overflow-hidden flex items-center justify-center p-4"
})``;

// 4. 모던한 폼 디자인
const FormWrapper = styled.div.attrs({
    className: `
        w-full max-w-md p-8 sm:p-10 space-y-6 bg-slate-900/80 backdrop-blur-md 
        shadow-2xl rounded-lg border border-slate-700 z-10
    `
})``;

const Title = styled.h2.attrs({
    className: "text-center text-3xl font-bold text-slate-200 tracking-wider"
})``;

const InputWrapper = styled.div.attrs({
    className: "relative"
})``;

const StyledInput = styled.input.attrs({
    className: `
        peer w-full border-0 border-b-2 border-slate-600 bg-transparent py-2 px-1
        text-slate-200 placeholder-transparent focus:outline-none 
        focus:border-amber-400 transition-colors duration-300
    `
})`
    // 브라우저 자동 완성 시 배경색 및 텍스트 색상 변경 방지
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #0f172a inset !important; // slate-900
        -webkit-text-fill-color: #e2e8f0 !important; // slate-200
        caret-color: #e2e8f0 !important;
    }
`;

const StyledLabel = styled.label.attrs({
    className: `
        absolute left-1 -top-3.5 text-slate-400 text-sm transition-all 
        peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 
        peer-placeholder-shown:top-2 peer-focus:-top-3.5 
        peer-focus:text-amber-500 peer-focus:text-sm cursor-text
    `
})``;

const SubmitButton = styled.button.attrs({
    className: `
        w-full py-3 px-4 border border-slate-600 rounded-lg shadow-md text-sm font-bold
        text-slate-200 bg-slate-800/50
        hover:bg-transparent hover:border-amber-400 hover:text-amber-400 focus:outline-none 
        focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 
        transition-all duration-300 transform hover:scale-105
    `
})``;

const ErrorMessage = styled.p.attrs({
    className: "text-center text-sm text-red-500 font-medium"
})``;

// --- React Component ---

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false); // 클라이언트 렌더링 확인용 상태
    const router = useRouter();

    // 클라이언트에서만 실행되도록 useEffect 사용
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);

        if (!name || !email || !password) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
                router.push('/login');
            } else {
                const errorData = await res.json();
                setError(errorData.message || '회원가입 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error('Registration failed:', err);
        }
    };

    return (
        <>
            <GlobalStyle />
            <CelestialBackground>
                {/* isClient가 true일 때만 별 렌더링하여 Hydration 오류 방지 */}
                {isClient && (
                    <>
                        <Stars />
                        <Stars2 />
                        <Stars3 />
                    </>
                )}
                <FormWrapper>
                    <Title>계정 생성</Title>
                    {/* form에서 onSubmit 제거 */}
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md flex flex-col gap-8">
                            <InputWrapper>
                                <StyledInput id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" />
                                <StyledLabel htmlFor="name">이름</StyledLabel>
                            </InputWrapper>
                            <InputWrapper>
                                <StyledInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" />
                                <StyledLabel htmlFor="email">이메일 주소</StyledLabel>
                            </InputWrapper>
                            <InputWrapper>
                                <StyledInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
                                <StyledLabel htmlFor="password">비밀번호</StyledLabel>
                            </InputWrapper>
                        </div>

                        {error && <ErrorMessage>{error}</ErrorMessage>}

                        <div className="pt-4">
                            {/* 버튼에 onClick 이벤트 핸들러 추가 및 type="button" 설정 */}
                            <SubmitButton type="button" onClick={handleSubmit}>
                                가입하기
                            </SubmitButton>
                        </div>
                    </div>
                </FormWrapper>
            </CelestialBackground>
        </>
    );
}

