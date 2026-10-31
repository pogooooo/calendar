import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeWidget } from '@/lib/widgetAuth';
import { categoryAccessWhere } from '@/lib/apiAuth';
import { readTodos, createTodo, updateTodo, deleteTodo } from '@/lib/todoHandlers';
import { widgetTodos } from '@/lib/widgetTodoProjection';
import { zonedTimeToDate, zonedDateKey, addDaysToKey, isValidTimeZone } from '@/lib/timezone';
import type { TodoType } from '@/types';

const jsonError = () => NextResponse.json({ message: '잘못된 요청입니다.' }, { status: 400 });
async function run(request: Request, operation: (userId: string) => Promise<NextResponse>) {
    try {
        const user = await authorizeWidget(request);
        return typeof user === 'string' ? await operation(user) : user;
    } catch (error) {
        console.error('[WIDGET_TODO_ERROR]', error);
        return NextResponse.json({ message: '서버 오류 발생' }, { status: 500 });
    }
}
export const GET = (request: Request) => run(request, async userId => {
    const params = new URL(request.url).searchParams;
    if (params.has('id')) return readTodos(request, userId);
    const timeZone = params.get('timeZone') ?? 'Asia/Seoul';
    if (!isValidTimeZone(timeZone)) return jsonError();
    const day = params.get('date') ?? zonedDateKey(new Date(), timeZone);
    const instant = new Date(day+'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(instant.getTime()) || instant.toISOString().slice(0,10) !== day) return jsonError();
    const categories = await prisma.category.findMany({ where: categoryAccessWhere(userId), select: { id: true, name: true, color: true } });
    // Fetch the same authorized sources as the app; no client-supplied category can widen access.
    const response = await readTodos(new Request(new URL('/api/todo', request.url)), userId);
    if (!response.ok) return response;
    const todos = await response.json() as TodoType[];
    const start = zonedTimeToDate(day, 0, 0, timeZone)!;
    const end = new Date(zonedTimeToDate(addDaysToKey(day,1),0,0,timeZone)!.getTime()-1);
    const today = zonedDateKey(new Date(), timeZone);
    const first = today.slice(0,7)+'-01';
    const forecastEnd = addDaysToKey(today,45);
    const forecastLimit = new Date(zonedTimeToDate(addDaysToKey(forecastEnd,1),0,0,timeZone)!.getTime()-1);
    return NextResponse.json({ date: day, timeZone, categories,
        items: widgetTodos(todos,categories,start,end,timeZone),
        snapshotTodos: widgetTodos(todos,categories,zonedTimeToDate(first,0,0,timeZone)!,forecastLimit,timeZone),
    }, { headers: { 'Cache-Control': 'no-store' } });
});
export const POST = (request: Request) => run(request, async userId => {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError();
    if (body.requestId !== undefined && (typeof body.requestId !== 'string' || !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(body.requestId))) return jsonError();
    if (body.startAt && body.endAt && Date.parse(body.endAt) < Date.parse(body.startAt)) return jsonError();
    if (!body.categoryId) body.categoryId = (await prisma.category.findFirst({ where: categoryAccessWhere(userId), select: { id: true } }))?.id;
    return createTodo(new Request(request.url, { method:'POST', body:JSON.stringify(body) }), userId, body.requestId);
});
export const PATCH = (request: Request) => run(request, async userId => {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError();
    if (body.targetDate !== undefined && typeof body.completed !== 'boolean') return jsonError();
    if (body.startAt && body.endAt && Date.parse(body.endAt) < Date.parse(body.startAt)) return jsonError();
    return updateTodo(new Request(request.url,{ method:'PATCH', body:JSON.stringify(body) }),userId);
});
export const DELETE = (request: Request) => run(request, userId => {
    const day = new URL(request.url).searchParams.get('targetDate');
    if (day !== null) {
        const instant = new Date(day+'T00:00:00Z');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(instant.getTime()) || instant.toISOString().slice(0,10) !== day) return Promise.resolve(jsonError());
    }
    return deleteTodo(request,userId);
});
