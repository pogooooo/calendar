/**
 * 물속의 것들 — 천천히 떠오르는 공기 방울과 몇 개의 유리 구슬. OceanCaustics 의 같은 캔버스·같은 렌더러에 얹힌다.
 *
 * 물(빛 그물)은 낮은 해상도의 렌더 타깃에 먼저 그려 두고, 방울은 화면 해상도로 그 위에 그리면서 그 물을 읽는다:
 *   - 굴절: 바깥의 물빛이 방울 안으로 작게 접혀 들어오고, 테에 가까울수록 많이 휜다. 빨강·초록·파랑을 조금씩 달리 휘어 테에 무지갯빛
 *   - 반사: 테의 위쪽은 수면의 밝은 빛을, 아래쪽은 깊은 물빛을 비춘다 — 둥근 입체가 여기서 나온다
 *   - 빛 그물: 물 셰이더가 알파 칸에 적어 둔 그 자리의 빛 세기로, 빛 그물이 지나갈 때 방울이 반짝한다
 *   - 유리 구슬은 테를 따라 흐르는 초승달 창빛과 아래쪽에 모인 빛이 더 있다. 가장 큰 구슬은 가까이 있어 초점 밖(가장자리가 흐리다)
 * 기울기·커서(parallax)로 가까운 것이 더 비켜 깊이가 보이고, 폰은 기운 쪽으로 '위'가 바뀌어 방울이 높은 쪽으로 올라간다.
 * 누르면 그 자리에서 작은 방울 몇 개가 올라온다.
 *
 * 좌표는 CSS px, y 는 위로 자란다(0 이 화면 아래). three 는 부르는 쪽이 넘겨준다 — 이 파일은 타입만 가져온다.
 */
import type * as THREE_NS from "three";

type T = typeof THREE_NS;
type Motion = "full" | "gentle" | "off";

const VERT = /* glsl */ `
attribute vec3 aBubble;   // 가운데 x·y(px), 반지름(px)
attribute vec4 aLook;     // 흐림(초점 밖), 투명도, 유리(0 방울 · 1 구슬), 씨앗
uniform vec2 uView;
varying vec2 vLocal;
varying vec2 vCenter;
varying float vRadius;
varying vec4 vLook;
void main() {
    float R = aBubble.z + 2.0 + aLook.x * aBubble.z * 0.3;
    vLocal = position.xy * R / aBubble.z;
    vCenter = aBubble.xy;
    vRadius = aBubble.z;
    vLook = aLook;
    vec2 px = aBubble.xy + position.xy * R;
    gl_Position = vec4(px / uView * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uWater;
uniform vec2 uView;
uniform float uDark;
varying vec2 vLocal;
varying vec2 vCenter;
varying float vRadius;
varying vec4 vLook;

void main() {
    float r = length(vLocal);
    float soft = vLook.x;
    float aa = fwidth(r) * 1.2 + soft * 0.22;
    float mask = 1.0 - smoothstep(1.0 - aa, 1.0 + aa * 0.35, r);
    if (mask <= 0.002) discard;
    float rr = min(r, 0.998);
    float edge = 1.0 - sqrt(1.0 - rr * rr);   // 0 가운데 → 1 테
    vec2 dir = vLocal / max(r, 1e-4);
    float glass = vLook.z;
    vec2 uv = (vCenter + vLocal * vRadius) / uView;
    float px = 1.0 / vRadius;                       // 화면 1px 이 이 방울에서 얼마인지 — 작은 방울도 테·반짝이 뭉개지지 않게
    float small = 1.0 - smoothstep(4.0, 12.0, vRadius); // 작은 방울은 은빛 알처럼

    // 굴절 — 바깥 물빛이 안으로 작게 접혀 들어온다. 테에 가까울수록 많이, 빛깔마다 조금씩 달리
    vec2 bend = vLocal * vRadius / uView * (0.25 + 1.1 * edge) * mix(0.9, 1.25, glass);
    float disp = mix(0.06, 0.08, glass);
    vec3 col = vec3(
        texture2D(uWater, uv + bend).r,
        texture2D(uWater, uv + bend * (1.0 + disp)).g,
        texture2D(uWater, uv + bend * (1.0 + disp * 2.0)).b);
    float glint = texture2D(uWater, vCenter / uView).a; // 이 자리를 지나는 빛 그물 (물 셰이더가 알파에 적어 둔 것)
    col = col * mix(1.05, 1.03, uDark) + mix(0.025, 0.008, uDark);

    vec3 light = mix(vec3(1.0, 1.0, 0.97), vec3(0.66, 0.96, 0.92), uDark);
    vec3 deep = mix(vec3(0.05, 0.36, 0.38), vec3(0.01, 0.07, 0.08), uDark);
    // 테의 반사 — 위는 수면의 빛, 아래는 깊은 물빛. 구슬은 반사가 테에 몰려 가운데가 맑다
    vec3 refl = mix(deep, light * mix(0.92, 0.6, uDark), smoothstep(-0.75, 0.8, dir.y));
    col = mix(col, refl, min(1.0, pow(edge, mix(2.0, 3.2, glass)) * mix(0.62, 0.5, uDark) + small * 0.3));
    // 구슬 아래쪽 테 안의 어두운 띠 — 밝은 물에서도 둥근 테두리가 서도록 (낮에만)
    float band = smoothstep(0.86, 0.94, r) * (1.0 - smoothstep(0.95, 0.995, r)) * smoothstep(0.4, -0.6, dir.y);
    col = mix(col, deep, band * 0.3 * glass * (1.0 - uDark));
    float rimW = max(0.15, 1.5 * px);
    float ring = smoothstep(1.0 - rimW * 1.8, 1.0 - rimW * 0.6, r) * (1.0 - smoothstep(1.0 - rimW * 0.5, 1.0, r)) * smoothstep(-0.9, 0.4, dir.y);
    col += light * ring * (mix(0.3, 0.22, uDark) + small * 0.3) * (0.7 + 0.6 * glint);
    // 해(밤엔 달)가 비친 반짝 — 위 왼쪽, 빛 그물이 지나면 더
    vec2 hp = vLocal - vec2(-0.34, 0.42);
    float specR = max(mix(0.135, 0.11, glass), 1.3 * px);
    float spec = exp(-dot(hp, hp) / (specR * specR)) * (1.0 - soft * 0.5);
    // 구슬은 그 둘레로 넓고 옅은 창빛이 한 겹 더
    float sheen = exp(-dot(hp, hp) / 0.08) * glass * 0.16;
    col += light * (spec * mix(0.95, 0.6, uDark) + sheen * mix(1.0, 0.6, uDark)) * (0.75 + 0.6 * glint);
    // 유리 구슬 — 위쪽 테를 따라 흐르는 초승달 창빛, 아래쪽에 모인 빛
    float arc = smoothstep(0.7, 0.82, r) * (1.0 - smoothstep(0.87, 0.92, r)) * smoothstep(0.35, 0.9, dot(dir, vec2(-0.45, 0.89)));
    col += light * arc * glass * mix(0.34, 0.24, uDark);
    float low = smoothstep(0.45, 0.88, r) * (1.0 - smoothstep(0.9, 1.0, r)) * smoothstep(0.3, 0.95, dot(dir, vec2(0.3, -0.95)));
    col += light * low * mix(0.1, 0.3, glass) * (0.5 + glint) * mix(1.0, 0.75, uDark);

    gl_FragColor = vec4(col, mask * vLook.y);
}
`;

interface Bubble {
    x: number; y: number; r: number;
    vx: number; vy: number;
    /** 떠오르는 끝 빠르기(px/s) */
    rise: number;
    /** 지그재그 */
    wob: number; wobF: number; wobP: number;
    /** 0 먼 것 ~ 1 가까운 것 — 기울기에 비키는 정도 */
    depth: number;
    soft: number; glass: number; alpha: number;
    age: number; life: number;
    /** 다시 나기까지 기다림(초) — 0 이하면 살아 있다 */
    wait: number;
    kind: "orb" | "bubble" | "burst";
    /** 구슬이 흔들리는 가운데 자리 */
    baseX: number;
    seed: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export interface BubbleOptions {
    mobile: boolean;
    motion: Motion;
    dark: boolean;
    water: THREE_NS.Texture;
}

export function createBubbles(THREE: T, opts: BubbleOptions) {
    const { mobile, motion } = opts;
    const gentle = motion === "gentle";
    const speedK = gentle ? 0.55 : 1;
    const orbSizes = mobile ? [34, 22] : gentle ? [52, 32] : [54, 36, 26];
    const nBubbles = mobile ? (gentle ? 4 : 7) : gentle ? 7 : 14;
    const nBurst = motion === "full" ? (mobile ? 8 : 12) : 0;
    const MAX = orbSizes.length + nBubbles + nBurst;

    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const aBubble = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    const aLook = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 4), 4);
    aBubble.setUsage(THREE.DynamicDrawUsage);
    aLook.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aBubble", aBubble);
    geo.setAttribute("aLook", aLook);
    geo.instanceCount = 0;

    const uniforms = {
        uWater: { value: opts.water },
        uView: { value: new THREE.Vector2(1, 1) },
        uDark: { value: opts.dark ? 1 : 0 },
    };
    const material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;

    let W = 1, H = 1;
    /** 장면 시각 — 창이 숨어 있던 동안은 흐르지 않는다(돌아왔을 때 흔들림이 튀지 않게) */
    let clock = Math.random() * 100;
    const blank = (kind: Bubble["kind"]): Bubble => ({
        x: 0, y: 0, r: 4, vx: 0, vy: 0, rise: 20, wob: 0, wobF: 1, wobP: 0, depth: 0.3, soft: 0, glass: 0, alpha: 1,
        age: 0, life: 10, wait: 0, kind, baseX: 0, seed: Math.random() * 10,
    });

    /* 구슬 — 늘 떠 있다. 위로 나가면 아래에서 다시 */
    const orbs = orbSizes.map((size, i) => {
        const o = blank("orb");
        o.r = size;
        o.glass = 1;
        o.depth = i === 0 ? 1 : rand(0.55, 0.75);
        o.soft = i === 0 ? 0.14 : 0.02;
        o.alpha = i === 0 ? 0.8 : 0.92;
        o.rise = rand(5, 9);
        o.wob = rand(14, 26);
        o.wobF = rand(0.1, 0.17);
        o.wobP = rand(0, 6.28);
        return o;
    });
    const bubbles = Array.from({ length: nBubbles }, () => blank("bubble"));
    const bursts = Array.from({ length: nBurst }, () => { const b = blank("burst"); b.wait = Infinity; return b; });

    /** 구슬은 가운데 자리를 두고 천천히 좌우로 흔들린다. ux 는 기울기로 바뀐 '위'의 가로 성분 — 높은 쪽으로 조금 쏠린다 */
    const swayOrb = (o: Bubble, t: number, ux: number) => {
        o.x = o.baseX + Math.sin(t * o.wobF * speedK + o.wobP) * o.wob + ux * 40 * o.depth;
    };
    const placeOrbs = () => {
        // 화면을 고르게 나눠 앉힌다 — 큰 것은 오른쪽 아래 물에, 나머지는 흩어서
        const spots = mobile ? [[0.78, 0.2], [0.18, 0.62]] : [[0.86, 0.24], [0.12, 0.56], [0.55, 0.12]];
        orbs.forEach((o, i) => {
            const [fx, fy] = spots[i % spots.length];
            o.baseX = fx * W;
            o.y = fy * H;
            swayOrb(o, clock, 0);
        });
    };
    const spawnBubble = (b: Bubble, anywhere: boolean) => {
        const u = Math.random();
        b.r = mobile ? 2.6 + u * u * 5.4 : 3 + u * u * 7.5; // 작은 것이 많고 큰 것은 드물게
        b.x = rand(0.03, 0.97) * W;
        b.y = anywhere ? rand(0, 0.9) * H : rand(-0.02, 0.4) * H;
        b.rise = (14 + b.r * 3.2) * speedK;
        b.vx = 0;
        b.vy = b.rise;
        b.wob = rand(2, 7);
        b.wobF = rand(2, 3.6);
        b.wobP = rand(0, 6.28);
        b.depth = rand(0.1, 0.6);
        b.soft = 0;
        b.glass = 0;
        b.alpha = rand(0.75, 1);
        b.age = anywhere ? rand(0, 4) : 0;
        b.life = rand(8, 16) / Math.sqrt(speedK);
        b.wait = 0;
    };

    const resize = (w: number, h: number) => {
        const first = W === 1 && H === 1;
        // 창 크기가 바뀌면(폰을 돌리면) 자리를 같은 비율로 옮긴다 — 구슬이 화면 밖에 남지 않게
        const kx = w / W, ky = h / H;
        W = w; H = h;
        uniforms.uView.value.set(w, h);
        if (first) {
            placeOrbs();
            bubbles.forEach((b) => spawnBubble(b, true));
            return;
        }
        for (const b of [...orbs, ...bubbles, ...bursts]) { b.x *= kx; b.baseX *= kx; b.y *= ky; }
    };

    /** 누른 자리에서 작은 방울이 올라온다 (화면 px, y 는 아래로) */
    const release = (cx: number, cy: number) => {
        const free = bursts.filter((b) => b.wait > 0 || b.age >= b.life);
        const n = Math.min(free.length, mobile ? 5 : 7);
        for (let i = 0; i < n; i++) {
            const b = free[i];
            b.r = rand(2.4, 6);
            b.x = cx + rand(-10, 10);
            b.y = H - cy + rand(-8, 8);
            b.rise = 14 + b.r * 3.2;
            b.vx = rand(-55, 55);
            b.vy = rand(70, 150);
            b.wob = rand(2, 5);
            b.wobF = rand(3, 5);
            b.wobP = rand(0, 6.28);
            b.depth = rand(0.3, 0.7);
            b.soft = 0;
            b.glass = 0;
            b.alpha = 1;
            b.age = 0;
            b.life = rand(2.6, 4.2);
            b.wait = 0;
        }
    };

    /** 한 걸음. tilt 는 parallax 값(-1~1), lift 는 기울기로 바뀐 '위' 쪽(라디안, 폰만) */
    const step = (dt: number, tilt: { x: number; y: number }, lift: number) => {
        clock += dt;
        const t = clock;
        const ux = -Math.sin(lift), uy = Math.cos(lift);
        for (const o of orbs) {
            o.y += o.rise * speedK * dt;
            swayOrb(o, t, ux);
            if (o.y - o.r * 1.4 > H) { o.y = -o.r * 1.4 - rand(0, 160); o.baseX = rand(0.08, 0.92) * W; }
        }
        const live = (b: Bubble) => {
            if (b.wait > 0) { b.wait -= dt; if (b.wait <= 0 && b.kind === "bubble") spawnBubble(b, false); return; }
            b.age += dt;
            // 끝 빠르기로 다가간다 — 누른 방울은 처음에 빨리 솟았다 잦아든다
            const k = 1 - Math.exp(-dt * 1.6);
            b.vx += (ux * b.rise - b.vx) * k;
            b.vy += (uy * b.rise - b.vy) * k;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (b.age >= b.life || b.y - b.r > H || b.x < -20 || b.x > W + 20) {
                b.wait = b.kind === "bubble" ? rand(0.4, 3.5) / speedK : Infinity;
                b.age = b.life;
            }
        };
        bubbles.forEach(live);
        bursts.forEach(live);
        write(t, tilt);
    };

    /** 보이는 것만 차례로 (방울 → 구슬: 구슬이 가까우니 위에) */
    const write = (t: number, tilt: { x: number; y: number }) => {
        let n = 0;
        const put = (b: Bubble, x: number, y: number, alpha: number) => {
            aBubble.setXYZ(n, x - tilt.x * b.depth * 18, y + tilt.y * b.depth * 14, b.r);
            aLook.setXYZW(n, b.soft, alpha, b.glass, b.seed);
            n++;
        };
        // 누른 방울은 바로 보이고, 저절로 난 방울은 초점 밖에서 들어오듯 천천히
        const fade = (b: Bubble) => Math.min(1, b.age / (b.kind === "burst" ? 0.12 : 0.8), (b.life - b.age) / 1.4);
        for (const b of [...bubbles, ...bursts]) {
            if (b.wait > 0 || b.age >= b.life) continue;
            const wobble = Math.sin(t * b.wobF + b.wobP) * b.wob;
            put(b, b.x + wobble, b.y, b.alpha * Math.max(0, fade(b)));
        }
        for (const o of orbs) put(o, o.x, o.y, o.alpha);
        geo.instanceCount = n;
        aBubble.needsUpdate = true;
        aLook.needsUpdate = true;
    };

    return {
        mesh,
        resize,
        release,
        step,
        /** 움직임 '끄기' — 한 장만 그릴 자리 */
        still() { write(clock, { x: 0, y: 0 }); },
        dispose() {
            geo.dispose();
            material.dispose();
        },
    };
}
