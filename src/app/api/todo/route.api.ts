import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/apiAuth';
import { readTodos, createTodo, updateTodo, deleteTodo } from '@/lib/todoHandlers';

type Handler = (request: Request, userId: string) => Promise<NextResponse>;
const authenticated = (handler: Handler) => async (request: Request) => {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    return handler(request, userId);
};
export const GET = authenticated(readTodos);
export const POST = authenticated(createTodo);
export const PATCH = authenticated(updateTodo);
export const DELETE = authenticated(deleteTodo);
