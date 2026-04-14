"use client";

import useAuthStore from "@/store/useAuthStore";
import useSettingStore from "@/store/useSettingStore";
import styled from "styled-components";
import dynamic from "next/dynamic";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";

const WeekCalendar = dynamic(() => import("@/components/calendar/weekCalendar/WeekCalendar"), {
    ssr: false,
    loading: () => <CalendarSkeleton>캘린더를 불러오는 중입니다...</CalendarSkeleton>
});

export default function Home() {

    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();

    return (
        <ContentWrapper>

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
                                    </div>
                                </TodoItem>
                            ))
                        ) : (
                            <EmptyText>할 일이 비어 있습니다.</EmptyText>
                        )}
                    </TodoContainer>
                </DataCard>
            </DataSection>

        </ContentWrapper>
    );
}

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: ${(props) => props.theme.colors.text};
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

const EmptyText = styled.p`
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.85rem;
    font-style: italic;
`;

const CalendarSkeleton = styled.div`
    height: 300px;
    width: 100%;
    background-color: ${(props) => props.theme.colors.surface};
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${(props) => props.theme.colors.textSecondary};
    border: 1px dashed ${(props) => props.theme.colors.border};
`;