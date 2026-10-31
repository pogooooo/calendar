import { NextResponse } from 'next/server';
import prisma from './prisma';
import { verifyWidgetToken } from './jwt';
import { checkRateLimit } from './rateLimiter';

/** A widget key is never accepted by the account APIs. Revocation applies to every widget operation. */
export async function authorizeWidget(request: Request): Promise<string | NextResponse> {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const claim = token ? await verifyWidgetToken(token) : null;
    const denied = () => NextResponse.json({ message: '앱을 열어 다시 로그인해 주세요.' }, { status: 401 });
    if (!claim) return denied();
    const owner = await prisma.user.findUnique({ where: { id: claim.userId }, select: { tokenVersion: true } });
    if (!owner || owner.tokenVersion !== claim.version) return denied();
    if (!await prisma.refreshToken.count({ where: { userId: claim.userId, expires: { gt: new Date() } } })) return denied();
    const limit = await checkRateLimit(`widget-${request.method === 'GET' ? 'read' : 'write'}:${claim.userId}`, {
        maxAttempts: request.method === 'GET' ? 120 : 30, windowMs: 60_000, blockMs: 60_000,
    });
    return limit.allowed ? claim.userId : NextResponse.json({ message: '잠시 뒤에 다시 시도해 주세요.' }, { status: 429 });
}
