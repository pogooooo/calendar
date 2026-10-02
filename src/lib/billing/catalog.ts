export const BILLING_THEMES = ['celestial', 'maple', 'ocean'] as const;
export type BillingTheme = typeof BILLING_THEMES[number];
export const THEME_NAMES: Record<BillingTheme, string> = {celestial:'Celestial',maple:'Maple',ocean:'Ocean'};

export function isBillingTheme(value: unknown): value is BillingTheme {
    return typeof value === 'string' && BILLING_THEMES.includes(value as BillingTheme);
}

/** Prices are supplied by the owner, never trusted from a browser or inferred. */
export function parsePrices(raw?: string): Partial<Record<BillingTheme, number>> {
    try {
        const data: unknown = JSON.parse(raw ?? '{}');
        if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
        const result: Partial<Record<BillingTheme, number>> = {};
        for (const id of BILLING_THEMES) {
            const amount = (data as Record<string, unknown>)[id];
            if (typeof amount === 'number' && Number.isSafeInteger(amount) && amount > 0) result[id] = amount;
        }
        return result;
    } catch { return {}; }
}

export function isTestConfiguration(enabled?: string, clientKey?: string, secretKey?: string): boolean {
    return enabled === 'true' && !!clientKey?.startsWith('test_') && !!secretKey?.startsWith('test_');
}

export interface TossReceipt { orderId?:string; paymentKey?:string; status?:string; totalAmount?:number; currency?:string; }
export function matchesReceipt(receipt:TossReceipt, order:{id:string;amount:number}, paymentKey:string):boolean {
    return receipt.status === 'DONE' && receipt.orderId === order.id && receipt.paymentKey === paymentKey &&
        receipt.totalAmount === order.amount && receipt.currency === 'KRW';
}
