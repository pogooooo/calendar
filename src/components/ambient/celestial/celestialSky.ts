/**
 * Celestial 의 바탕 하늘 — 가만히 있어도 별이 숨 쉬듯 반짝이고, 손(커서·기울기)에 반응한다. 캔버스 2D 한 장.
 *   - 별: 깊이 세 겹(먼·가운데·가까운), 점 별과 네 갈래 별. 저마다 다른 빠르기로 반짝인다.
 *   - 손: 겹마다 다르게 비켜(가까운 겹일수록 많이) 깊이가 보이고, 커서를 비추는 자리에는 숨어 있던 옅은 별들이 드러나며
 *         둘레의 별이 밝아진다. 폰은 커서 대신 기기 기울기로 비켜만 간다. 오른쪽 위의 큰 궤도·아래 해와 달도 함께 비킨다
 *         (바탕 상자에 --sky-px·--sky-py 를 적어 준다).
 *   - 별이 곧게 떨어진다: 가끔 한 줄기 — 비스듬히 가르지 않고 곧게 아래로 (이 갈래는 사선을 쓰지 않는다).
 *   - 누르면: 그 자리에서 고리 하나가 번지고, 고리의 네 방위에 작은 네 갈래 별이 돋는다.
 * 무겁지 않게: 초당 30장(잔잔하게는 15장), 창이 숨으면 멈춘다. '잔잔하게'는 별을 적게·느리게(손 반응·떨어지는 별·고리 없음),
 * '끄기'는 한 장만 그려 둔다. 글 뒤에 깔리고 누르는 것은 받지 않는다 — 누름·움직임은 window 에서 듣는다.
 * 별은 작고 옅어 글을 가리지 않는다.
 */
import { parallax } from "@/lib/parallax";

type Motion = "full" | "gentle" | "off";

export interface SkyOptions {
    dark: boolean;
    motion: Motion;
    /** 낮(밝은 벌)의 별빛 — 갈래의 금빛 */
    gold: string;
    /** 큰 궤도·해와 달이 함께 비키도록 --sky-px·--sky-py 를 받을 상자 */
    host: HTMLElement;
}

interface Star {
    x: number;
    y: number;
    /** 깊이 0.3(먼)~1(가까운) — 비키는 양·크기·밝기 */
    z: number;
    r: number;
    spark: boolean;
    a: number;
    tw: number;
    ph: number;
}
interface Fall { x: number; y: number; len: number; v: number; age: number; life: number }
interface Pulse { x: number; y: number; age: number }

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function rgbOf(hex: string): [number, number, number] {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return [212, 175, 55];
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** 네 갈래 별 한 장(둘레에 옅은 번짐) — 크기를 바꿔 찍는다 */
function sparkSprite([r, g, b]: [number, number, number]) {
    const S = 64, c = S / 2;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const x = cv.getContext("2d");
    if (!x) return cv;
    const glow = x.createRadialGradient(c, c, 0, c, c, c);
    glow.addColorStop(0, `rgba(${r},${g},${b},0.45)`);
    glow.addColorStop(0.3, `rgba(${r},${g},${b},0.12)`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = glow;
    x.fillRect(0, 0, S, S);
    x.fillStyle = `rgb(${r},${g},${b})`;
    x.beginPath();
    x.moveTo(c, 5);
    x.quadraticCurveTo(c + 3, c - 3, S - 5, c);
    x.quadraticCurveTo(c + 3, c + 3, c, S - 5);
    x.quadraticCurveTo(c - 3, c + 3, 5, c);
    x.quadraticCurveTo(c - 3, c - 3, c, 5);
    x.fill();
    return cv;
}

export function createSky(canvas: HTMLCanvasElement, o: SkyOptions) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { dispose() {} };

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const full = o.motion === "full";
    const gentle = o.motion === "gentle";
    const hand = full;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const color: [number, number, number] = o.dark ? [246, 230, 184] : rgbOf(o.gold);
    const fill = `rgb(${color[0]},${color[1]},${color[2]})`;
    const sprite = sparkSprite(color);
    /** 별의 밝기 범위 — 밤은 또렷하게, 낮(아이보리 종이)은 옅게 */
    const [aMin, aMax] = o.dark ? [0.18, 0.72] : [0.14, 0.5];

    let W = 1, H = 1;
    const stars: Star[] = [];
    /** 커서를 비춰야 드러나는 옅은 별 — 데스크톱 '풍성하게'에서만 */
    const hidden: Star[] = [];

    const seed = () => {
        stars.length = 0;
        hidden.length = 0;
        const area = W * H;
        let n = Math.round(area / (mobile ? 13000 : 12500));
        n = Math.max(mobile ? 26 : 50, Math.min(mobile ? 48 : 130, n));
        if (gentle) n = Math.round(n * 0.7);
        for (let i = 0; i < n; i++) {
            const z = i % 7 === 0 ? rand(0.8, 1) : i % 3 === 0 ? rand(0.55, 0.8) : rand(0.3, 0.55);
            const spark = z > 0.62 && Math.random() < 0.34;
            stars.push({
                x: Math.random(), y: Math.random(), z,
                r: spark ? rand(3.2, 6.2) * z : rand(0.45, 1.15) + z * 0.55,
                spark, a: rand(aMin, aMax) * (0.55 + z * 0.45), tw: rand(0.18, 0.62), ph: rand(0, Math.PI * 2),
            });
        }
        // 숨은 별 — 폰이 아닌 화면에서 '풍성하게'면 마련한다. 마우스가 움직일 때만 드러난다(터치스크린 노트북도 마우스면)
        if (hand && !mobile) {
            const m = Math.max(80, Math.min(240, Math.round(area / 6000)));
            for (let i = 0; i < m; i++) {
                const z = rand(0.3, 0.9);
                const spark = Math.random() < 0.12;
                hidden.push({ x: Math.random(), y: Math.random(), z, r: spark ? rand(3, 5) : rand(0.7, 1.5), spark, a: rand(0.55, 1), tw: rand(0.3, 0.9), ph: rand(0, Math.PI * 2) });
            }
        }
    };

    const resize = () => {
        W = Math.max(1, window.innerWidth);
        H = Math.max(1, window.innerHeight);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    seed();

    /* ── 손 ─────────────────────────────────────────────────────────── */
    const cursor = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: 0, aim: 0 };
    let lastMove = -1e9;
    const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        cursor.tx = e.clientX;
        cursor.ty = e.clientY;
        if (cursor.x < -9000) { cursor.x = e.clientX; cursor.y = e.clientY; }
        lastMove = performance.now();
    };
    const onLeave = () => { lastMove = -1e9; };
    const pulses: Pulse[] = [];
    const onDown = (e: PointerEvent) => {
        if (pulses.length > 3) pulses.shift();
        pulses.push({ x: e.clientX, y: e.clientY, age: 0 });
    };
    const stopParallax = hand ? parallax.start() : () => {};
    if (hand) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        window.addEventListener("pointerdown", onDown, { passive: true });
    }

    /* ── 떨어지는 별 ─────────────────────────────────────────────────── */
    const falls: Fall[] = [];
    let nextFall = rand(4, 9);
    const spawnFall = () => {
        falls.push({ x: rand(0.06, 0.94) * W, y: rand(-0.04, 0.22) * H, len: rand(70, 120), v: rand(360, 520), age: 0, life: rand(0.85, 1.25) });
    };

    /* ── 그리기 ─────────────────────────────────────────────────────── */
    let t = rand(0, 100);
    const par = { x: 0, y: 0 };
    const drawStar = (s: Star, alpha: number, scale: number) => {
        if (alpha < 0.012) return;
        const px = s.x * W - par.x * 18 * s.z;
        const py = s.y * H - par.y * 13 * s.z;
        ctx.globalAlpha = Math.min(1, alpha);
        if (s.spark) {
            const d = s.r * 2.6 * scale;
            ctx.drawImage(sprite, px - d / 2, py - d / 2, d, d);
        } else {
            ctx.beginPath();
            ctx.arc(px, py, s.r * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    };
    /** 커서를 비춘 정도 (0~1) — 별의 화면 자리에서 */
    const lens = (s: Star, sigma: number) => {
        if (cursor.on < 0.01) return 0;
        const dx = s.x * W - par.x * 18 * s.z - cursor.x;
        const dy = s.y * H - par.y * 13 * s.z - cursor.y;
        return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) * cursor.on;
    };

    /** 커서 둘레의 옅은 별빛 웅덩이 — 손전등처럼 비추는 자리 */
    const glowR = 190;
    const pool = (() => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = glowR * 2;
        const x = cv.getContext("2d");
        if (x) {
            const g = x.createRadialGradient(glowR, glowR, 0, glowR, glowR, glowR);
            g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${o.dark ? 0.075 : 0.06})`);
            g.addColorStop(0.45, `rgba(${color[0]},${color[1]},${color[2]},${o.dark ? 0.03 : 0.024})`);
            g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
            x.fillStyle = g;
            x.fillRect(0, 0, glowR * 2, glowR * 2);
        }
        return cv;
    })();

    const draw = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = fill;
        const tws = gentle ? 0.5 : 1;
        // 숨은 별 — 커서가 비추는 자리에서만 드러난다 (둘레엔 옅은 별빛 웅덩이)
        if (hidden.length && cursor.on > 0.01) {
            ctx.globalAlpha = cursor.on;
            ctx.drawImage(pool, cursor.x - glowR, cursor.y - glowR);
            for (const s of hidden) {
                const b = lens(s, 130);
                if (b < 0.02) continue;
                const tw = 0.65 + 0.35 * Math.sin(t * s.tw * 2 + s.ph);
                drawStar(s, s.a * Math.pow(b, 0.8) * tw, 0.8 + b * 0.8);
            }
        }
        for (const s of stars) {
            const k = 0.5 + 0.5 * Math.sin(t * s.tw * tws + s.ph);
            const b = hand ? lens(s, 150) : 0;
            drawStar(s, s.a * (0.35 + 0.65 * k * k) + b * 0.7, (s.spark ? 0.8 + 0.25 * k : 1) * (1 + b * 0.9));
        }
        // 곧게 떨어지는 별 — 머리는 네 갈래 별, 꼬리는 위로 옅어지는 곧은 금선
        for (const f of falls) {
            const k = f.age / f.life;
            const fade = Math.min(1, k * 8) * (1 - Math.max(0, (k - 0.6) / 0.4));
            const hy = f.y + f.v * f.age;
            const tail = Math.min(f.len, f.v * f.age);
            const g = ctx.createLinearGradient(f.x, hy - tail, f.x, hy);
            g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0)`);
            g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},${(o.dark ? 0.7 : 0.5) * fade})`);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(f.x, hy - tail);
            ctx.lineTo(f.x, hy);
            ctx.stroke();
            ctx.globalAlpha = (o.dark ? 0.95 : 0.75) * fade;
            ctx.drawImage(sprite, f.x - 7, hy - 7, 14, 14);
        }
        // 누른 자리 — 번지는 고리와 네 방위의 작은 별
        for (const p of pulses) {
            const k = Math.min(1, p.age / 1.1);
            const e = 1 - (1 - k) ** 3;
            const R = 8 + 64 * e;
            const a = (o.dark ? 0.5 : 0.42) * (1 - k) ** 1.2;
            ctx.globalAlpha = a;
            ctx.strokeStyle = fill;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = Math.min(1, a * 1.6);
            const d = 7 + 4 * (1 - k);
            for (const [dx, dy] of [[0, -R], [R, 0], [0, R], [-R, 0]] as const) {
                ctx.drawImage(sprite, p.x + dx - d / 2, p.y + dy - d / 2, d, d);
            }
        }
        ctx.globalAlpha = 1;
    };

    let lastPx = 9, lastPy = 9;
    const step = (dt: number) => {
        t += dt;
        if (hand) {
            const p = parallax.read();
            par.x = p.x;
            par.y = p.y;
            if (Math.abs(p.x - lastPx) > 0.002 || Math.abs(p.y - lastPy) > 0.002) {
                lastPx = p.x;
                lastPy = p.y;
                o.host.style.setProperty("--sky-px", p.x.toFixed(3));
                o.host.style.setProperty("--sky-py", p.y.toFixed(3));
            }
            // 커서는 부드럽게 따라가고, 2초 가만히 있으면 비춤이 걷힌다
            cursor.x += (cursor.tx - cursor.x) * Math.min(1, dt * 10);
            cursor.y += (cursor.ty - cursor.y) * Math.min(1, dt * 10);
            const aim = performance.now() - lastMove < 2000 ? 1 : 0;
            cursor.on += (aim - cursor.on) * Math.min(1, dt * (aim ? 4 : 1.5));
            nextFall -= dt;
            if (nextFall <= 0) { spawnFall(); nextFall = rand(8, 15); }
        }
        for (let i = falls.length - 1; i >= 0; i--) {
            falls[i].age += dt;
            if (falls[i].age > falls[i].life) falls.splice(i, 1);
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
            pulses[i].age += dt;
            if (pulses[i].age > 1.1) pulses.splice(i, 1);
        }
    };

    /* ── 돌리기 ─────────────────────────────────────────────────────── */
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = 1 / (gentle ? 15 : 30);
    const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (document.hidden || canvas.clientWidth === 0) return;
        acc += dt;
        if (acc < frame) return;
        const s = Math.min(acc, 0.1);
        acc = 0;
        step(s);
        draw();
    };

    const onResize = () => {
        const before = W * H;
        resize();
        // 크게 바뀌면(창 늘이기·화면 돌리기) 별 수를 새로 — 작게 바뀌면 자리만 늘였다 줄인다
        if (Math.abs(W * H - before) / Math.max(1, before) > 0.35) seed();
        draw();
    };
    window.addEventListener("resize", onResize);

    draw();
    if (o.motion !== "off") raf = requestAnimationFrame(tick);

    return {
        dispose() {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            stopParallax();
            o.host.style.removeProperty("--sky-px");
            o.host.style.removeProperty("--sky-py");
        },
    };
}
