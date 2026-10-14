/**
 * 이름으로 씨를 정하는 고른 난수 — 위젯마다 다르지만 늘 같은 자리에 무늬를 놓는다(서버와 브라우저가 같은 그림을 그린다).
 * mulberry32 에 이름의 FNV 해시를 씨로 준다. 0 이상 1 미만.
 */
export function seededRandom(seed: string): () => number {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    return () => {
        h = (h + 0x6d2b79f5) | 0;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
