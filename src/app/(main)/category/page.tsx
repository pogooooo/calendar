"use client"

import useAuthStore from "@/store/auth/useAuthStore";
import {useEffect, useState} from "react";
import { useAuthFetch } from '@/hooks/AuthFetch';
import styled from "styled-components";

interface CategoryType {
    id: string;
    name: string;
    color: string;
    description: boolean;
}

const Category = () => {
    const accessToken = useAuthStore((state) => state.accessToken)
    const authFetch = useAuthFetch();

    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState<boolean>(false)
    const [newName, setNewName] = useState("");

    // 카테고리 불러오기
    const fetchCategories = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await authFetch('/api/category', {
                cache: 'no-store',
            });
            if (!res.ok) new Error("로드 실패");
            setCategories(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories().then();
    }, [accessToken]);

    //카테고리 추가
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            const res = await authFetch('/api/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            });

            if (res.ok) {
                setNewName("");
                fetchCategories();
            }
        } catch (err) {
            console.error("생성 실패", err);
            alert("카테고리 생성에 실패했습니다.");
        }
    };

    // 카테고리 삭제
    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await authFetch(`/api/category?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCategories((prev) => prev.filter(cat => cat.id !== id));
            } else {
                const err = await res.json();
                alert(err.message || "삭제 실패");
            }
        } catch (err) {
            console.error("삭제 에러", err);
        }
    };

    const handleChange = (id: string, data: Partial<CategoryType>) => {
        setCategories((prev) => prev.map(cat => cat.id === id ? { ...cat, ...data } : cat));
    };

    const handleSave = async (id: string, updates: Partial<CategoryType>) => {
        const currentCategory = categories.find(c => c.id === id);
        if (!currentCategory) return;

        const payload = {
            id,
            name: updates.name || currentCategory.name,
            color: updates.color || currentCategory.color,
        };

        try {
            const res = await authFetch('/api/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                fetchCategories();
            }
        } catch (err) {
            console.error("수정 실패", err);
            fetchCategories();
        }
    };

    return(
        <Container>
            <Header>
                <h2>CATEGORY LIST</h2>
                <RefreshButton onClick={fetchCategories} disabled={loading}>
                    {loading ? "로딩 중..." : "새로고침"}
                </RefreshButton>
            </Header>

            <CreateBar onSubmit={handleCreate}>
                <CreateInput
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="새 카테고리 이름 입력"
                />
                <CreateButton type="submit">추가</CreateButton>
            </CreateBar>

            <List>
                {categories.map((item: CategoryType) => (
                    <ListItem key={item.id}>
                        <ColorPicker type="color" value={item.color}
                                     onChange={(e) => handleChange(item.id, { color: e.target.value })}
                                     onBlur={(e) => handleSave(item.id, { color: e.target.value })} />
                        <NameInput value={item.name} placeholder="카테고리 이름"
                                   onChange={(e) => handleChange(item.id, { name: e.target.value })}
                                   onBlur={(e) => handleSave(item.id, { name: e.target.value })} />
                        <DeleteButton onClick={() => handleDelete(item.id)}>삭제</DeleteButton>
                    </ListItem>
                ))}

                {categories.length === 0 && !loading && (
                    <EmptyState>표시할 카테고리가 없습니다.</EmptyState>
                )}
            </List>
        </Container>
    )
}

const Container = styled.div`
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
    color: ${(props) => props.theme.colors.text};
`;

const Header = styled.div`
    display: flex;
    cursor: default;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};

    h2 {
        font-size: ${(props) => props.theme.fontSizes.h3};
        font-weight: 600;
        font-family: ${(props) => props.theme.fonts?.celestial_heading};
    }
`;

const RefreshButton = styled.button`
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 0.25rem 0.75rem;
    border-radius: 5px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 80px;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const ListItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 5px;
    transition: box-shadow 0.2s;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
`;

const ColorPicker = styled.input`
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    
    &::-webkit-color-swatch-wrapper { padding: 0; }
    &::-webkit-color-swatch { 
        border: 1px solid ${(props) => props.theme.colors.border}; 
        border-radius: 50%; 
    }
`;

const NameInput = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text};
    padding: 0.25rem;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-bottom-color: ${(props) => props.theme.colors.primary};
    }
`;

const DeleteButton = styled.button`
    background: none;
    border: none;
    color: ${(props) => props.theme.colors.error || '#ff4d4f'};
    font-size: 0.85rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
        text-decoration: underline;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.9rem;
`;

const CreateBar = styled.form`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
`;

const CreateInput = styled.input`
    flex: 1;
    padding: 12px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 5px;
    font-size: 1rem;
    background: transparent;
    color: ${(props) => props.theme.colors.text};
    transition: border 0.2s;
    
    &:focus {
        border-color: ${(props) => props.theme.colors.primary};
        outline: none;
    }
`;

const CreateButton = styled.button`
    padding: 0 20px;
    background-color: ${(props) => props.theme.colors.surface};
    color: ${(props) => props.theme.colors.text};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 5px;
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover { 
        border: 1px solid ${(props) => props.theme.colors.primary}
    }
`;

export default Category
