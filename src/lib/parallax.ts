/**
 * 바탕 장면·오브제가 기우는 값 하나 — 데스크톱은 커서 자리, 폰·태블릿 앱은 기기 기울기(자이로).
 *
 * 장면은 매 프레임 `parallax.read()` 로 -1~1 의 { x, y } 를 읽는다(부드럽게 따라간다).
 * 듣는 장면이 하나도 없으면 이벤트도 떼어 둔다: `const stop = parallax.start(); … stop();`
 *
 * 기기 기울기는 처음 잡은 자세를 0 으로 삼고, 그 기준을 천천히 지금 자세로 끌어온다 —
 * 폰을 들고 자세를 바꿔도 장면이 한쪽으로 쏠린 채 남지 않는다. (iOS 는 권한이 필요하지만 이 앱은 안드로이드뿐이다)
 */

type Vec = { x: number; y: number };

const TILT_RANGE_DEG = 18;   // 이만큼 기울이면 끝(±1)
const RECENTER_PER_SEC = 0.12; // 기준 자세가 지금 자세로 따라오는 빠르기
const FOLLOW_PER_SEC = 6;     // 읽는 값이 목표를 따라가는 빠르기

let users = 0;
let detach: (() => void) | null = null;
const target: Vec = { x: 0, y: 0 };
const current: Vec = { x: 0, y: 0 };
let lastRead = 0;
let source: "pointer" | "tilt" | "none" = "none";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function attach() {
    if (typeof window === "undefined") return () => {};
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (finePointer) {
        source = "pointer";
        const onMove = (e: PointerEvent) => {
            target.x = clamp((e.clientX / window.innerWidth) * 2 - 1);
            target.y = clamp((e.clientY / window.innerHeight) * 2 - 1);
        };
        const onLeave = () => { target.x = 0; target.y = 0; };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
        };
    }

    // 손가락 기기: 기울기. 처음 값이 기준(0), 기준은 천천히 지금 자세를 따라온다
    let base: { beta: number; gamma: number } | null = null;
    let lastT = 0;
    const onTilt = (e: DeviceOrientationEvent) => {
        if (e.beta == null || e.gamma == null) return;
        source = "tilt";
        const now = performance.now();
        if (!base) { base = { beta: e.beta, gamma: e.gamma }; lastT = now; }
        const dt = Math.min(0.25, (now - lastT) / 1000);
        lastT = now;
        const k = 1 - Math.exp(-RECENTER_PER_SEC * dt);
        base.beta += (e.beta - base.beta) * k;
        base.gamma += (e.gamma - base.gamma) * k;
        target.x = clamp((e.gamma - base.gamma) / TILT_RANGE_DEG);
        target.y = clamp((e.beta - base.beta) / TILT_RANGE_DEG);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
}

export const parallax = {
    /** 듣기 시작. 돌려받은 함수를 부르면 그만 듣는다(마지막 하나가 그만두면 이벤트를 뗀다) */
    start(): () => void {
        users += 1;
        if (users === 1) detach = attach();
        let stopped = false;
        return () => {
            if (stopped) return;
            stopped = true;
            users -= 1;
            if (users === 0) {
                detach?.();
                detach = null;
                source = "none";
                target.x = target.y = current.x = current.y = 0;
            }
        };
    },
    /** 지금 값(-1~1). 프레임마다 불러도 된다 — 부를 때마다 목표 쪽으로 부드럽게 다가간다 */
    read(): Vec {
        const now = typeof performance === "undefined" ? 0 : performance.now();
        const dt = lastRead ? Math.min(0.1, (now - lastRead) / 1000) : 0;
        lastRead = now;
        const k = 1 - Math.exp(-FOLLOW_PER_SEC * dt);
        current.x += (target.x - current.x) * k;
        current.y += (target.y - current.y) * k;
        return { x: current.x, y: current.y };
    },
    /** 무엇이 값을 주는지 — 커서(데스크톱)·기울기(폰)·없음 */
    get source() { return source; },
};
