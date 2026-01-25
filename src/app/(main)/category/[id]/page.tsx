"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuthFetch } from "@/hooks/AuthFetch";
import useAuthStore from "@/store/auth/useAuthStore";

// 타입 정의
interface ParticipantType {
    id: string;
    name: string;
    email: string;
    image?: string;
}

interface CategoryType {
    id: string;
    name: string;
    color: string;
    isDefault: boolean;
    participants?: ParticipantType[];
}

interface TodoType {
    id: string;
    title: string;
    check: string; // "done" | "none"
    isAllDay: boolean;
}

export default function CategoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const authFetch = useAuthFetch();
    const accessToken = useAuthStore((state) => state.accessToken);

    const categoryId = params.id as string;

    // 상태 관리
    const [category, setCategory] = useState<CategoryType | null>(null);
    const [todos, setTodos] = useState<TodoType[]>([]);
    const [loading, setLoading] = useState(true);

    // 투두 생성 입력값
    const [newTodoTitle, setNewTodoTitle] = useState("");

    // 카테고리 수정 모드 상태
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    // 데이터 불러오기
    useEffect(() => {
        if (!categoryId || !accessToken) {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            try {
                // 1. 카테고리 상세 조회
                const catRes = await authFetch(`/api/category?id=${categoryId}`);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    // API가 배열을 반환할 경우 대비
                    const targetCat = Array.isArray(catData)
                        ? catData.find((c: CategoryType) => c.id === categoryId)
                        : catData;

                    setCategory(targetCat);
                    setEditName(targetCat.name);
                    setEditColor(targetCat.color);
                }

                // 2. 해당 카테고리의 투두 목록 조회
                const todoRes = await authFetch(`/api/todo?categoryId=${categoryId}`);
                if (todoRes.ok) {
                    const todoData = await todoRes.json();
                    setTodos(todoData);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [categoryId, accessToken]);

    // --- 카테고리 기능 ---

    // 카테고리 수정 저장
    const handleUpdateCategory = async () => {
        if (!category) return;
        try {
            const res = await authFetch(`/api/category`, {
                method: 'POST', // 기존 로직상 POST가 Update 역할 겸임
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: category.id,
                    name: editName,
                    color: editColor
                })
            });

            if (res.ok) {
                setCategory({ ...category, name: editName, color: editColor });
                setIsEditing(false);
            } else {
                alert("카테고리 수정 실패");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // 카테고리 삭제
    const handleDeleteCategory = async () => {
        if (!confirm("카테고리를 삭제하면 포함된 모든 할 일도 삭제될 수 있습니다. 진행하시겠습니까?")) return;
        try {
            const res = await authFetch(`/api/category?id=${categoryId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                router.replace('/category'); // 목록 페이지로 이동
            } else {
                alert("삭제 권한이 없거나 실패했습니다.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // --- 투두 기능 ---

    // 투두 생성
    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        try {
            const res = await authFetch('/api/todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTodoTitle,
                    categoryId: categoryId
                })
            });

            if (res.ok) {
                const newTodo = await res.json();
                setTodos([...todos, newTodo]);
                setNewTodoTitle("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // 투두 체크 토글 (완료 처리)
    const handleToggleTodo = async (todo: TodoType) => {
        const newCheckStatus = todo.check === "done" ? "none" : "done";

        // 낙관적 업데이트 (UI 먼저 반영)
        const updatedTodos = todos.map(t =>
            t.id === todo.id ? { ...t, check: newCheckStatus } : t
        );
        setTodos(updatedTodos);

        try {
            await authFetch('/api/todo', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: todo.id,
                    check: newCheckStatus
                })
            });
        } catch (e) {
            console.error(e);
            // 에러 시 롤백 로직 필요하나 여기선 생략
        }
    };

    // 투두 삭제
    const handleDeleteTodo = async (todoId: string) => {
        if (!confirm("삭제하시겠습니까?")) return;
        try {
            const res = await authFetch(`/api/todo?id=${todoId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setTodos(todos.filter(t => t.id !== todoId));
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <Container>Loading...</Container>;
    if (!category) return <Container>Category Not Found</Container>;

    return (
        <Container>
            <Header>
                <TopRow>
                    <BackButton onClick={() => router.back()}>← 목록으로</BackButton>
                    <HeaderActions>
                        {!isEditing ? (
                            <>
                                <ActionButton onClick={() => setIsEditing(true)}>수정</ActionButton>
                                <DeleteButton onClick={handleDeleteCategory}>삭제</DeleteButton>
                            </>
                        ) : (
                            <>
                                <ActionButton onClick={handleUpdateCategory}>저장</ActionButton>
                                <DeleteButton onClick={() => setIsEditing(false)}>취소</DeleteButton>
                            </>
                        )}
                    </HeaderActions>
                </TopRow>

                {!isEditing ? (
                    <TitleArea>
                        <Title>
                            <ColorDot $color={category.color} />
                            {category.name}
                        </Title>
                        {/* 참여자 목록 표시 */}
                        {category.participants && category.participants.length > 0 && (
                            <ParticipantList>
                                {category.participants.map(p => (
                                    <ParticipantBadge key={p.id} title={p.name}>
                                        {p.name.slice(0, 1)}
                                    </ParticipantBadge>
                                ))}
                            </ParticipantList>
                        )}
                    </TitleArea>
                ) : (
                    <EditForm>
                        <ColorInput
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                        />
                        <NameInput
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </EditForm>
                )}
            </Header>

            <Content>
                <TodoInputForm onSubmit={handleAddTodo}>
                    <TodoInput
                        placeholder="+ 할 일을 입력하세요"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                    />
                    <AddButton type="submit">추가</AddButton>
                </TodoInputForm>

                <TodoList>
                    {todos.length === 0 ? (
                        <EmptyMessage>등록된 할 일이 없습니다.</EmptyMessage>
                    ) : (
                        todos.map(todo => (
                            <TodoItem key={todo.id}>
                                <Checkbox
                                    type="checkbox"
                                    checked={todo.check === "done"}
                                    onChange={() => handleToggleTodo(todo)}
                                />
                                <TodoText $isDone={todo.check === "done"}>
                                    {todo.title}
                                </TodoText>
                                <TodoDeleteBtn onClick={() => handleDeleteTodo(todo.id)}>
                                    ×
                                </TodoDeleteBtn>
                            </TodoItem>
                        ))
                    )}
                </TodoList>
            </Content>
        </Container>
    );
}

// --- Styled Components ---

const Container = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    color: ${(props) => props.theme.colors.text};
`;

const Header = styled.div`
    margin-bottom: 2rem;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding-bottom: 1rem;
`;

const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    padding: 0;
    font-size: 0.9rem;
    &:hover { text-decoration: underline; }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

const ActionButton = styled.button`
    padding: 4px 12px;
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 4px;
    cursor: pointer;
    &:hover { background: ${(props) => props.theme.colors.border}; }
`;

const DeleteButton = styled(ActionButton)`
    color: #ff4d4f;
    border-color: #ff4d4f;
    &:hover { background: #fff1f0; }
`;

const TitleArea = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
`;

const EditForm = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const NameInput = styled.input`
    font-size: 1.5rem;
    padding: 5px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 4px;
    background: transparent;
    color: ${(props) => props.theme.colors.text};
`;

const ColorInput = styled.input`
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
`;

const ColorDot = styled.div<{ $color: string }>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${(props) => props.$color};
    border: 1px solid rgba(0,0,0,0.1);
`;

const ParticipantList = styled.div`
    display: flex;
    gap: -8px; /* 겹치게 */
`;

const ParticipantBadge = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    border: 2px solid ${(props) => props.theme.colors.background};
    font-weight: bold;
    color: #333;
`;

const Content = styled.div`
    background: ${(props) => props.theme.colors.surface};
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.colors.border};
`;

const TodoInputForm = styled.form`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
`;

const TodoInput = styled.input`
    flex: 1;
    padding: 12px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 6px;
    background: transparent;
    color: ${(props) => props.theme.colors.text};
    &:focus { outline: 1px solid ${(props) => props.theme.colors.primary}; }
`;

const AddButton = styled.button`
    padding: 0 20px;
    background: ${(props) => props.theme.colors.primary};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:hover { opacity: 0.9; }
`;

const TodoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TodoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    &:last-child { border-bottom: none; }
`;

const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    cursor: pointer;
`;

const TodoText = styled.span<{ $isDone: boolean }>`
    flex: 1;
    font-size: 1rem;
    text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};
    color: ${(props) => props.$isDone ? props.theme.colors.textSecondary : props.theme.colors.text};
    transition: all 0.2s;
`;

const TodoDeleteBtn = styled.button`
    background: none;
    border: none;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 5px;
    &:hover { color: #ff4d4f; }
`;

const EmptyMessage = styled.div`
    text-align: center;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 20px;
`;