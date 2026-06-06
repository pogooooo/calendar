/**
 * 서버 메모리 기반 Rate Limiter
 * - 같은 IP에서 짧은 시간 내 과도한 요청 차단
 * - 운영 환경에서는 Redis(Upstash 등)로 교체 권장
 */

interface Attempt {
    count: number;
    firstAt: number;
    blockedUntil?: number;
}

const store = new Map<string, Attempt>();

// 5분마다 오래된 항목 정리
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        store.forEach((v, k) => {
            if (now - v.firstAt > 15 * 60 * 1000) store.delete(k);
        });
    }, 5 * 60 * 1000);
}

interface RateLimitOptions {
    /** 허용 최대 시도 횟수 */
    maxAttempts: number;
    /** 카운트 초기화 윈도우 (ms) */
    windowMs: number;
    /** 초과 시 차단 시간 (ms) */
    blockMs: number;
}

interface RateLimitResult {
    allowed: boolean;
    /** 차단 해제까지 남은 초 */
    retryAfter?: number;
    remaining: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
    const { maxAttempts, windowMs, blockMs } = options;
    const now = Date.now();
    const entry = store.get(key);

    // 차단 중
    if (entry?.blockedUntil && now < entry.blockedUntil) {
        return {
            allowed: false,
            retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
            remaining: 0,
        };
    }

    // 윈도우 초과 → 리셋
    if (!entry || now - entry.firstAt > windowMs) {
        store.set(key, { count: 1, firstAt: now });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    const next = entry.count + 1;

    if (next > maxAttempts) {
        const blockedUntil = now + blockMs;
        store.set(key, { ...entry, count: next, blockedUntil });
        return {
            allowed: false,
            retryAfter: Math.ceil(blockMs / 1000),
            remaining: 0,
        };
    }

    store.set(key, { ...entry, count: next });
    return { allowed: true, remaining: maxAttempts - next };
}

/** 성공 시 해당 키의 실패 카운트 초기화 */
export function resetRateLimit(key: string) {
    store.delete(key);
}
