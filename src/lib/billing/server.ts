import 'server-only';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { isTestConfiguration, parsePrices, type TossReceipt } from './catalog';

export function billingConfig() {
    const clientKey = process.env.TOSS_TEST_CLIENT_KEY;
    const secretKey = process.env.TOSS_TEST_SECRET_KEY;
    return {
        enabled:isTestConfiguration(process.env.BILLING_TEST_ENABLED,clientKey,secretKey),
        clientKey, secretKey, prices:parsePrices(process.env.THEME_TEST_PRICES_KRW),
    };
}

export async function billingUser(request:NextRequest):Promise<string|null> {
    try {
        const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
        if (!token) return null;
        const userId = (await verifyToken(token))?.userId;
        return typeof userId === 'string' ? userId : null;
    } catch { return null; }
}

export function nativeAndroid(request:NextRequest) {
    return request.headers.get('x-cronos-platform') === 'android';
}

/** Fixed provider host; secret is server-only and never logged or returned. */
export async function tossRequest(path:string, secret:string, init?:RequestInit):Promise<TossReceipt|null> {
    const response = await fetch(`https://api.tosspayments.com/v1/payments/${path}`, {
        ...init,
        headers:{Authorization:`Basic ${btoa(secret+':')}`, 'Content-Type':'application/json', ...init?.headers},
        signal:AbortSignal.timeout(15000), cache:'no-store',
    });
    if (!response.ok) return null;
    return await response.json() as TossReceipt;
}
