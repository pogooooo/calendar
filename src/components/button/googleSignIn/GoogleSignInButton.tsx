"use client";

import styled from "styled-components";

/* Google 공식 브랜드 가이드라인 기반 버튼
   https://developers.google.com/identity/branding-guidelines */

interface Props {
    onClick?: () => void;
    disabled?: boolean;
    label?: string;
}

export default function GoogleSignInButton({ onClick, disabled, label = "Google로 계속하기" }: Props) {
    return (
        <Btn onClick={onClick} disabled={disabled} type="button">
            <GoogleLogo aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </GoogleLogo>
            <Label>{label}</Label>
        </Btn>
    );
}

const Btn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 300px;
    height: 40px;
    padding: 0 12px;
    background: #ffffff;
    border: 1px solid #dadce0;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(60, 64, 67, 0.12);
    transition: background 0.15s, box-shadow 0.15s;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        background: #f8f9fa;
        box-shadow: 0 2px 6px rgba(60, 64, 67, 0.20);
    }

    &:active:not(:disabled) {
        background: #f1f3f4;
        box-shadow: none;
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
`;

const GoogleLogo = styled.svg`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
`;

const Label = styled.span`
    font-family: 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #3c4043;
    letter-spacing: 0.25px;
    white-space: nowrap;
`;
