"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/store/auth/useAuthStore";
import useSettingStore from "@/store/setting/useSettingStore";
import styled from "styled-components";
import WeekCalendar from "@/components/calendar/weekCalendar/WeekCalendar";
import useTodoStore from "@/store/todo/useTodoStore";
import useCategoryStore from "@/store/category/useCategoryStore"; // 분리된 카테고리 스토어 임포트

export default function Home() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const user = useAuthStore((state) => state.user);
    const theme = useSettingStore((state) => state.theme);
    const logout = useAuthStore((state) => state.logout);

    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();

    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/signIn");
    };

    return (
        <ContentWrapper>
            <WelcomeHeader>
                <h1>환영합니다, {user?.name || user?.email || "사용자"}님!</h1>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </WelcomeHeader>

            <Section>
                <WeekCalendar todos={todos} categories={categories} />
            </Section>

            <DataSection>
                <DataCard>
                    <h3>📂 Categories ({categories.length})</h3>
                    <DataList>
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <Tag key={cat.id} $color={cat.color}>
                                    {cat.name}
                                </Tag>
                            ))
                        ) : (
                            <EmptyText>저장된 카테고리가 없습니다.</EmptyText>
                        )}
                    </DataList>
                </DataCard>

                <DataCard>
                    <h3>✅ Todos ({todos.length})</h3>
                    <TodoContainer>
                        {todos.length > 0 ? (
                            todos.map((todo) => (
                                <TodoItem key={todo.id} $done={todo.check === "done"}>
                                    <StatusDot $done={todo.check === "done"} />
                                    <div className="text-content">
                                        <p className="title">{todo.title}</p>
                                        {/* 쉐이크 관련 영양 정보 출력 로직 제거됨 */}
                                    </div>
                                </TodoItem>
                            ))
                        ) : (
                            <EmptyText>할 일이 비어 있습니다.</EmptyText>
                        )}
                    </TodoContainer>
                </DataCard>
            </DataSection>

            <DebugSection>
                <h3>[Debug Info]</h3>
                <p><strong>Theme:</strong> {theme}</p>
                <p><strong>Access Token:</strong></p>
                <TokenText>{accessToken || "없음"}</TokenText>
                <p><strong>User Object:</strong></p>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </DebugSection>
        </ContentWrapper>
    );
}

// --- Styled Components ---

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: ${(props) => props.theme.colors.text};
`;

const WelcomeHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const Section = styled.section`
    margin-bottom: 3rem;
`;

const DataSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 3rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const DataCard = styled.div`
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 12px;
    padding: 1.5rem;

    h3 {
        margin-bottom: 1.2rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: ${(props) => props.theme.colors.primary};
    }
`;

const DataList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const Tag = styled.span<{ $color: string }>`
    background-color: ${(props) => props.$color}22;
    color: ${(props) => props.$color};
    border: 1px solid ${(props) => props.$color}44;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
`;

const TodoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const TodoItem = styled.div<{ $done: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.5rem;

    .text-content {
        .title {
            font-size: 0.95rem;
            text-decoration: ${(props) => props.$done ? 'line-through' : 'none'};
            color: ${(props) => props.$done ? props.theme.colors.textSecondary : props.theme.colors.text};
        }
    }
`;

const StatusDot = styled.div<{ $done: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => props.$done ? props.theme.colors.textSecondary : props.theme.colors.primary};
`;

const LogoutButton = styled.button`
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textSecondary};
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${(props) => props.theme.colors.error || '#ff4d4f'};
        color: ${(props) => props.theme.colors.error || '#ff4d4f'};
    }
`;

const DebugSection = styled.div`
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    font-size: 0.85rem;
    border: 1px solid #eee;

    h3 { margin-bottom: 1rem; color: #333; }
    pre { color: #2e7d32; white-space: pre-wrap; margin-top: 0.5rem; }
`;

const TokenText = styled.p`
    word-break: break-all;
    color: #1565c0;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.85rem;
    font-style: italic;
`;