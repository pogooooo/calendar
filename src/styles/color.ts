/**
 * 색을 다루는 작은 도구.
 *
 * 팔레트 색은 `#rrggbb` 로 적혀 있는데, 빛무리(box-shadow, drop-shadow)에는
 * 투명도가 필요하다. 곳마다 `rgba(212, 175, 55, .8)` 처럼 손으로 적어 두면
 * 테마를 바꿔도 그 색만 그대로 남는다. 그래서 여기서 한 번에 만든다.
 */

/** `#rrggbb` 또는 `#rgb` 에 투명도를 입혀 `rgba(...)` 로 돌려준다 */
export function withAlpha(color: string, alpha: number): string {
    const a = Math.min(1, Math.max(0, alpha));
    const hex = color.trim();

    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
    if (!m) return color;   // 이미 rgba() 거나 이름 색이면 그대로 둔다

    const full = m[1].length === 3 ? m[1].split("").map(c => c + c).join("") : m[1];
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
