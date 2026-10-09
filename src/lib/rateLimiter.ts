/**
 * 시도 횟수 제한 — 같은 IP(또는 사람)가 짧은 사이에 너무 많이 시도하면 막는다 (로그인·가입·비밀번호 찾기·확인).
 *
 * 횟수는 D1(RateLimit 표)에 센다. 예전엔 서버 메모리에 셌는데, Cloudflare 는 요청을 여러 워커 인스턴스로 흩어서
 * 인스턴스마다 따로 세는 바람에 막아야 할 만큼 쌓이지 않았고, 인스턴스가 바뀌면 걸어 둔 차단도 사라졌다.
 * D1 에 닿지 못하면(표가 아직 없는 배포 사이 등) 예전처럼 메모리로 센다 — 로그인을 막아 버리지는 않는다.
 */
import prisma from "@/lib/prisma";

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

/* ── D1 ─────────────────────────────────────────────────────────────── */

/** 가끔 끝난 줄을 치운다 — 매번 치우면 시도마다 쓰기가 하나 더 는다 */
const CLEAN_EVERY = 50;
let sinceClean = 0;

async function checkInDb(key: string, { maxAttempts, windowMs, blockMs }: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now();
    if (++sinceClean >= CLEAN_EVERY) {
        sinceClean = 0;
        await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
    }

    const entry = await prisma.rateLimit.findUnique({ where: { key } });
    const blockedUntil = entry?.blockedUntil?.getTime();

    // 차단 중
    if (blockedUntil && now < blockedUntil) {
        return { allowed: false, retryAfter: Math.ceil((blockedUntil - now) / 1000), remaining: 0 };
    }

    // 윈도우 초과(또는 차단이 끝남) → 새로 센다
    if (!entry || now - entry.firstAt.getTime() > windowMs || blockedUntil) {
        const fresh = { count: 1, firstAt: new Date(now), blockedUntil: null, expiresAt: new Date(now + windowMs) };
        await prisma.rateLimit.upsert({ where: { key }, create: { key, ...fresh }, update: fresh });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    // 하나 더 — 겹친 요청끼리 같은 수를 읽지 않게 저장소가 더한다
    const next = await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    if (next.count > maxAttempts) {
        const until = now + blockMs;
        await prisma.rateLimit.update({
            where: { key },
            data: { blockedUntil: new Date(until), expiresAt: new Date(Math.max(entry.expiresAt.getTime(), until)) },
        });
        return { allowed: false, retryAfter: Math.ceil(blockMs / 1000), remaining: 0 };
    }
    return { allowed: true, remaining: maxAttempts - next.count };
}

/* ── 메모리 (D1 에 닿지 못할 때) ───────────────────────────────────── */

interface Attempt {
    count: number;
    firstAt: number;
    blockedUntil?: number;
    /** 창과 차단이 모두 끝나는 때 — 이때까지는 지우면 안 된다 */
    expiresAt: number;
}

const store = new Map<string, Attempt>();

/** 끝난 항목만 지운다 (한 시간짜리 창·차단이 중간에 풀리지 않게) */
let lastSweep = 0;
function sweep(now: number) {
    lastSweep = now;
    store.forEach((v, k) => {
        if (now >= v.expiresAt) store.delete(k);
    });
}
const SWEEP_AT = 5000;
const SWEEP_GAP_MS = 10_000;

function checkInMemory(key: string, { maxAttempts, windowMs, blockMs }: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    if (store.size > SWEEP_AT && now - lastSweep > SWEEP_GAP_MS) sweep(now);
    const entry = store.get(key);

    if (entry?.blockedUntil && now < entry.blockedUntil) {
        return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000), remaining: 0 };
    }
    if (!entry || now - entry.firstAt > windowMs || entry.blockedUntil) {
        store.set(key, { count: 1, firstAt: now, expiresAt: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }
    const next = entry.count + 1;
    if (next > maxAttempts) {
        const blockedUntil = now + blockMs;
        store.set(key, { ...entry, count: next, blockedUntil, expiresAt: Math.max(entry.expiresAt, blockedUntil) });
        return { allowed: false, retryAfter: Math.ceil(blockMs / 1000), remaining: 0 };
    }
    store.set(key, { ...entry, count: next });
    return { allowed: true, remaining: maxAttempts - next };
}

/* ── 바깥에서 쓰는 것 ──────────────────────────────────────────────── */

export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    try {
        return await checkInDb(key, options);
    } catch (error) {
        console.error("[RATE_LIMIT_DB_ERROR]", error);
        return checkInMemory(key, options);
    }
}

/** 성공 시 해당 키의 실패 카운트 초기화 */
export async function resetRateLimit(key: string): Promise<void> {
    store.delete(key);
    try {
        await prisma.rateLimit.deleteMany({ where: { key } });
    } catch (error) {
        console.error("[RATE_LIMIT_DB_ERROR]", error);
    }
}
