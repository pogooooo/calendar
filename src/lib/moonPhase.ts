/**
 * 달의 위상 — 0 은 삭(새 달), 0.25 상현, 0.5 보름, 0.75 하현.
 * 2000-01-06 18:14 UTC 의 삭을 기준으로 삭망월(29.530588853일)로 센다. 장식에 쓰는 셈이라 반나절 안팎은 어긋날 수 있다.
 */
const SYNODIC = 29.530588853;
const EPOCH = Date.UTC(2000, 0, 6, 18, 14);
const DAY = 86_400_000;

export function moonPhase(at: Date | number): number {
    const t = typeof at === "number" ? at : at.getTime();
    const p = ((t - EPOCH) / DAY / SYNODIC) % 1;
    return p < 0 ? p + 1 : p;
}

/** 날 키(YYYY-MM-DD)의 정오(UTC) 위상 — 시간대와 상관없이 그 날의 달 */
export const moonPhaseOfKey = (key: string): number => moonPhase(Date.parse(`${key}T12:00:00Z`));

export type PrincipalPhase = 0 | 0.25 | 0.5 | 0.75;

/** 그달(날 키들)에서 삭·상현·보름·하현을 지나는 날 — [날 순번(0부터), 위상] */
export function principalPhases(keys: string[]): { index: number; phase: PrincipalPhase }[] {
    const out: { index: number; phase: PrincipalPhase }[] = [];
    const marks: PrincipalPhase[] = [0, 0.25, 0.5, 0.75];
    for (let i = 0; i < keys.length; i++) {
        const before = moonPhaseOfKey(keys[i]) - 0.5 / SYNODIC; // 그날 0시 무렵
        const after = before + 1 / SYNODIC;                       // 다음 날 0시 무렵
        for (const m of marks) {
            // 위상은 1 에서 0 으로 돌아간다 — 삭(0)은 1 을 넘는 것으로 본다
            const target = m === 0 ? 1 : m;
            const a = before < 0 ? before + 1 : before;
            const b = a + (after - before);
            if ((a <= target && target < b) || (m === 0 && a <= 0 && 0 < b)) out.push({ index: i, phase: m });
        }
    }
    return out;
}
