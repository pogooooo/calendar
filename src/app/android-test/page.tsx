"use client";
import Link from 'next/link';
import AndroidTestSignup from '@/components/download/AndroidTestSignup';
import * as S from '@/components/download/AndroidTestSignup.styles';

export default function AndroidTestPage() {
    return <S.Page><Link href="/download">← CRONOS 다운로드</Link><AndroidTestSignup /></S.Page>;
}
