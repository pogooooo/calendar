/**
 * 같은 읽기 요청을 한 번만 보낸다.
 *
 * 홈·달력·일간 같은 화면이 저마다 "프로젝트·챌린지를 읽어 두자" 하고 effect 에서 부르는데,
 * 한 화면에 그런 컴포넌트가 여럿이라 켤 때 /api/project 가 열 번씩 나갔다 (네트워크 탭에서 봤다).
 * 폰에서는 그게 느리고, 한꺼번에 나간 요청 중 하나가 떨어지기도 한다.
 *
 * 규칙: 같은 키(URL)의 요청이 날아가는 중이면 그걸 같이 기다리고, 방금(ttl 안에) 끝났으면 건너뛴다.
 * 자료를 바꾼 뒤 곧바로 다시 읽어야 하는 곳(다른 창의 변경 알림)은 bustFetchCache() 로 기억을 지운다.
 */
const inflight = new Map<string, Promise<unknown>>();
const doneAt = new Map<string, number>();

export function coalesce<T>(key: string, ttlMs: number, run: () => Promise<T>): Promise<T | undefined> {
    const live = inflight.get(key);
    if (live) return live as Promise<T>;
    const last = doneAt.get(key);
    if (last !== undefined && Date.now() - last < ttlMs) return Promise.resolve(undefined);

    const p = run().finally(() => {
        inflight.delete(key);
        doneAt.set(key, Date.now());
    });
    inflight.set(key, p);
    return p;
}

/** 방금 읽었다는 기억을 지운다 — 다음 읽기는 무조건 나간다. prefix 를 주면 그 키들만 */
export function bustFetchCache(prefix?: string) {
    if (!prefix) { doneAt.clear(); return; }
    for (const k of Array.from(doneAt.keys())) if (k.startsWith(prefix)) doneAt.delete(k);
}

/** 켤 때 몰리는 중복 읽기를 걸러 내는 데 충분하고, 사람이 무언가를 바꾼 뒤 다시 읽는 데는 방해가 안 되는 길이 */
export const READ_TTL = 1500;
