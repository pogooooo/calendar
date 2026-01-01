"use client"

import useAuthStore from "@/store/auth/useAuthStore";
import {useState} from "react";
import { useAuthFetch } from '@/hooks/AuthFetch';

interface CategoryType {
    id: string;
    name: string;
    color: string;
    description: boolean;
}

const Category = () => {
    const accessToken = useAuthStore((state) => state.accessToken)

    const authFetch = useAuthFetch();

    // const [categories, setCategories] = useState<CategoryType[]>([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState<boolean>(false)

    // 카테고리 불러오기
    const fetchCategories = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await authFetch('/api/category', {
                cache: 'no-store',
            });
            if (!res.ok) throw new Error("로드 실패");
            setCategories(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    // 카테고리 수정
    // 카테고리 삭제

    return(
        <div>
            <button onClick={fetchCategories}>불러오기</button>
        </div>
    )
}

export default Category
