/**
 * 이 기기에서 WebGL2 를 쓸 수 있는가 — 바다의 물·Maple 의 잎(three.js)이 서는지. 한 번 재고 기억한다.
 * 그래픽 가속이 꺼졌거나 원격 접속·오래된 그래픽 드라이버면 없다. 그때 장면은 가벼운 그림(CSS 물빛·납작한 잎)으로 물러나고,
 * 설정의 움직임 아래에 그 사실을 알린다 — 예전엔 "다른 컴퓨터에서는 물결이 안 움직인다" 의 까닭이 드러나지 않았다.
 */
let cached: boolean | null = null;

export function webglAvailable(): boolean {
    if (cached !== null) return cached;
    if (typeof document === "undefined") return true;
    try {
        const gl = document.createElement("canvas").getContext("webgl2");
        cached = !!gl;
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
        cached = false;
    }
    return cached;
}
