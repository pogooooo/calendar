"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

// 컴포넌트의 props에 대한 타입을 정의합니다.
type Props = {
    children: React.ReactNode;
};

export default function AuthSessionProvider({ children }: Props) {
    return <SessionProvider>{children}</SessionProvider>;
}