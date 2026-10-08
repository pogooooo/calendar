/**
 * 서버 메모리 기반 Rate Limiter
 * - 같은 IP에서 짧은 시간 내 과도한 요청 차단
 * - 운영 환경에서는 Redis(Upstash 등)로 교체 권장
 */

interface Attempt {
    count: number;
    firstAt: number;
    blockedUntil?: number;
    /** 창과 차단이 모두 끝나는 때 — 이때까지는 지우면 안 된다 */
    expiresAt: number;
}

const store = new Map<string, Attempt>();

/**
 * 끝난 항목만 지운다.
 * 예전에는 첫 시도 뒤 15분이 지나면 무조건 지워서, 한 시간짜리 창(가입·비밀번호 찾기)이 15~20분으로 줄고
 * 걸어 둔 차단(15분·1시간)도 그때 같이 풀렸다.
 */
let lastSweep = 0;
function sweep(now: number) {
    lastSweep = now;
    store.forEach((v, k) => {
        if (now >= v.expiresAt) store.delete(k);
    });
}

// 5분마다 정리. 워커처럼 요청 사이에 타이머가 안 도는 곳도 있어 쌓이면 요청 때도 치운다(checkRateLimit)
if (typeof setInterval !== "undefined") {
    setInterval(() => sweep(Date.now()), 5 * 60 * 1000);
}
const SWEEP_AT = 5000;
const SWEEP_GAP_MS = 10_000;

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
    if (store.size > SWEEP_AT && now - lastSweep > SWEEP_GAP_MS) sweep(now);
    const entry = store.get(key);

    // 차단 중
    if (entry?.blockedUntil && now < entry.blockedUntil) {
        return {
            allowed: false,
            retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
            remaining: 0,
        };
    }

    // 윈도우 초과(또는 차단이 끝남) → 리셋
    if (!entry || now - entry.firstAt > windowMs || entry.blockedUntil) {
        store.set(key, { count: 1, firstAt: now, expiresAt: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    const next = entry.count + 1;

    if (next > maxAttempts) {
        const blockedUntil = now + blockMs;
        store.set(key, { ...entry, count: next, blockedUntil, expiresAt: Math.max(entry.expiresAt, blockedUntil) });
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
