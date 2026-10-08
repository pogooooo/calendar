/**
 * 오브제 무대 — 화면 곳곳의 작은 3D 오브제가 WebGL 맥락(context) 하나를 나눠 쓴다.
 *
 * 브라우저는 맥락을 열여섯 개쯤만 허락하고, 하나하나가 메모리를 먹는다. 그래서 렌더러는 화면 밖 캔버스 하나뿐이고,
 * 칸(<Objet>)마다 제 2D 캔버스를 들고 있다가 차례가 오면: 그 칸의 장면을 렌더러 왼쪽 아래 귀퉁이에 그리고 →
 * 곧바로 그 귀퉁이를 제 2D 캔버스로 옮겨 담는다(drawImage). 그래서 칸은 보통 DOM 처럼 겹치고 잘리고 스크롤된다.
 *
 * - 화면에 보이는 칸만 그린다(IntersectionObserver). 보이는 칸 가운데 움직이는 것이 없으면 루프가 멈춘다.
 * - 초당 30장, 손이 닿아 있는 동안만 60장. 창이 숨으면 멈춘다.
 * - 1배 화면에서도 2배로 그려 줄여 담는다 — 가는 금빛 선이 계단 없이 또렷하다.
 * - 움직임 '끄기'·위젯 창: 한 장만 그린다(루프 없음). '잔잔하게': 느리게, 올리기 반응 없음(끌기는 된다).
 * - 화면의 모든 칸이 멈춘 한 장뿐이면(위젯 창·움직임 끔) 다 그린 뒤 맥락을 곧바로 돌려준다 — 그림은 2D 캔버스에 남는다.
 *   색·크기가 바뀌어 다시 그릴 일이 생기면 그때 다시 연다.
 * - 마지막 칸이 사라지고 30초 조용하면 렌더러·반사광을 돌려준다. WebGL 이 없으면 칸에 알려 원래 그림으로 물러난다.
 */
import type * as THREE_NS from "three";
import { loadObjet } from "./registry";
import type { ObjetDef, ObjetInput, ObjetInstance, ObjetTone, Three } from "./types";

export type ObjetMotion = "full" | "gentle" | "off";
export type ObjetInteraction = "drag" | "hover" | "none";

/** 그릴 때 배율(한 변). 1배 화면에서도 2배로 그려 줄여 담는다 */
const SUPERSAMPLE = 2;
/** 한 칸을 그리는 최대 픽셀(한 변) — 아주 큰 칸도 이 이상은 안 키운다 */
const MAX_RENDER = 1400;
const IDLE_DISPOSE_MS = 30_000;
/** 멈춘 한 장만 남았을 때 맥락을 돌려주기까지 */
const STILL_RELEASE_MS = 2_500;
const FRAME_MS = 1000 / 30;
const FRAME_MS_ACTIVE = 1000 / 60;
const GENTLE = 0.4;

export interface SlotInit {
    name: string;
    tone: ObjetTone;
    motion: ObjetMotion;
    options: Record<string, unknown>;
    interaction?: ObjetInteraction;
    /** WebGL 이 없거나 이름이 틀렸다 — 부른 쪽은 원래 그림으로 물러난다 */
    onFail(): void;
}

class Slot {
    readonly ctx: CanvasRenderingContext2D | null;
    def: ObjetDef | null = null;
    inst: ObjetInstance | null = null;
    w = 0;
    h = 0;
    visible = false;
    dirty = true;
    moving = false;
    lastDraw = -1e9;
    lastT = 0;
    active = false;
    hovered = false;
    interaction: ObjetInteraction = "none";
    readonly input: ObjetInput = { hover: false, x: 0, y: 0, dragging: false, dragX: 0, dragY: 0 };
    private detachPointer: () => void = () => {};
    disposed = false;
    /** 처음 보인 뒤에야 렌더러를 열고 오브제를 받는다 — 숨은 칸(폰의 사이드바 같은)은 맥락을 만들지 않는다 */
    started = false;

    constructor(readonly stage: Stage, readonly canvas: HTMLCanvasElement, public init: SlotInit) {
        this.ctx = canvas.getContext("2d", { alpha: true });
        if (this.ctx) this.ctx.imageSmoothingQuality = "high";
    }

    get motion() { return this.init.motion; }

    /** 렌더러가 준비되면 오브제를 만든다 */
    async build() {
        const def = await loadObjet(this.init.name).catch(() => null);
        if (this.disposed) return;
        if (!def) {
            if (process.env.NODE_ENV !== "production") console.warn(`[objet] 없는 이름: ${this.init.name}`);
            this.stage.detach(this);
            this.init.onFail();
            return;
        }
        this.def = def;
        this.interaction = this.init.interaction ?? def.interaction ?? "none";
        this.bindPointer();
        this.create();
    }

    /** stale: 맥락을 잃었다 돌아왔다 — 옛 장면의 GPU 자원은 이미 없으니 돌려주지 않고 놓기만 한다(돌려주면 경고만 쏟아진다) */
    create(stale = false) {
        const s = this.stage;
        if (!this.def || !s.THREE || !s.env) return;
        if (!stale) this.inst?.dispose();
        this.inst = this.def.create({ THREE: s.THREE, tone: this.init.tone, env: s.env, options: this.init.options, lite: s.lite });
        this.lastT = 0;
        if (this.w > 0) this.applySize();
        this.dirty = true;
        s.wake();
    }

    measure() {
        const r = this.canvas.getBoundingClientRect();
        const w = Math.round(r.width), h = Math.round(r.height);
        if (w === this.w && h === this.h) return;
        this.w = w;
        this.h = h;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        this.canvas.width = Math.max(1, Math.round(w * dpr));
        this.canvas.height = Math.max(1, Math.round(h * dpr));
        if (this.ctx) this.ctx.imageSmoothingQuality = "high";
        this.applySize();
        this.dirty = true;
        this.stage.wake();
    }

    private applySize() {
        const inst = this.inst;
        if (!inst || this.w < 1 || this.h < 1) return;
        if (inst.resize) inst.resize(this.w, this.h);
        else if ("isPerspectiveCamera" in inst.camera && inst.camera.isPerspectiveCamera) {
            inst.camera.aspect = this.w / this.h;
            inst.camera.updateProjectionMatrix();
        }
    }

    /** 그릴 크기(px) — 2배, 너무 크면 줄인다 */
    renderSize(): [number, number] {
        const k = Math.min(SUPERSAMPLE, MAX_RENDER / Math.max(this.w, this.h, 1));
        return [Math.max(1, Math.round(this.w * k)), Math.max(1, Math.round(this.h * k))];
    }

    setTone(tone: ObjetTone) {
        this.init = { ...this.init, tone };
        // 아직 없거나(받는 중) 맥락을 돌려준 뒤면 다음에 만들 때 새 색으로 — 다시 그려야 한다는 것만 남긴다
        if (!this.inst) { this.dirty = true; this.stage.wake(); return; }
        if (this.inst.setTone) { this.inst.setTone(tone); this.dirty = true; this.stage.wake(); }
        else this.create();
    }

    setMotion(motion: ObjetMotion) {
        if (motion === this.init.motion) return;
        this.init = { ...this.init, motion };
        this.syncHover();
        this.dirty = true;
        this.lastT = 0;
        this.stage.wake();
    }

    setActive(on: boolean) {
        this.active = on;
        this.syncHover();
    }

    /** '잔잔하게'·끄기면 올리기 반응을 하지 않는다 */
    private syncHover() {
        const hover = this.motion === "full" && (this.active || (this.hovered && this.interaction !== "none"));
        if (hover !== this.input.hover) { this.input.hover = hover; this.stage.wake(); }
    }

    private bindPointer() {
        const el = this.canvas;
        const mode = this.interaction;
        if (mode === "none") { el.style.pointerEvents = "none"; return; }
        el.style.pointerEvents = "auto";
        if (mode === "drag") { el.style.cursor = "grab"; el.style.touchAction = "pan-y"; }
        let px = 0, py = 0, pid = -1;
        const local = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            this.input.x = r.width ? ((e.clientX - r.left) / r.width) * 2 - 1 : 0;
            this.input.y = r.height ? ((e.clientY - r.top) / r.height) * 2 - 1 : 0;
        };
        const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") { this.hovered = true; this.syncHover(); } };
        const leave = () => { this.hovered = false; this.syncHover(); };
        const move = (e: PointerEvent) => {
            local(e);
            if (this.input.dragging && e.pointerId === pid) {
                this.input.dragX += e.clientX - px;
                this.input.dragY += e.clientY - py;
                px = e.clientX;
                py = e.clientY;
                this.stage.wake();
            }
        };
        // 끌기 — 끄기면 받지 않는다. 사이드바 손잡이처럼 부모가 누름을 듣고 있어도 오브제가 먼저 갖는다
        const down = (e: PointerEvent) => {
            if (mode !== "drag" || this.motion === "off" || e.button !== 0) return;
            e.stopPropagation();
            pid = e.pointerId;
            px = e.clientX;
            py = e.clientY;
            this.input.dragging = true;
            el.style.cursor = "grabbing";
            try { el.setPointerCapture(pid); } catch { /* 이미 놓았다 */ }
            this.stage.wake();
        };
        const up = (e: PointerEvent) => {
            if (e.pointerId !== pid) return;
            pid = -1;
            this.input.dragging = false;
            el.style.cursor = "grab";
            this.stage.wake();
        };
        const stopMouse = (e: MouseEvent) => { if (mode === "drag" && this.motion !== "off") e.stopPropagation(); };
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        el.addEventListener("mousedown", stopMouse);
        this.detachPointer = () => {
            el.removeEventListener("pointerenter", enter);
            el.removeEventListener("pointerleave", leave);
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerdown", down);
            el.removeEventListener("pointerup", up);
            el.removeEventListener("pointercancel", up);
            el.removeEventListener("mousedown", stopMouse);
        };
    }

    /** 맥락을 돌려줄 때 — 장면만 버린다(그림은 캔버스에 남고, 다시 열면 create 로 되살린다) */
    release() {
        this.inst?.dispose();
        this.inst = null;
    }

    dispose() {
        this.disposed = true;
        this.detachPointer();
        this.inst?.dispose();
        this.inst = null;
    }
}

class Stage {
    THREE: Three | null = null;
    renderer: THREE_NS.WebGLRenderer | null = null;
    env: THREE_NS.Texture | null = null;
    failed = false;
    lite = false;
    private booting: Promise<boolean> | null = null;
    private slots = new Set<Slot>();
    private io: IntersectionObserver | null = null;
    private ro: ResizeObserver | null = null;
    private byCanvas = new WeakMap<Element, Slot>();
    private raf = 0;
    private bufW = 0;
    private bufH = 0;
    private idleTimer: ReturnType<typeof setTimeout> | undefined;
    private stillTimer: ReturnType<typeof setTimeout> | undefined;
    /** 멈춘 한 장들을 다 그리고 맥락을 돌려준 상태 */
    private asleep = false;
    private reviving = false;
    /** 맥락을 잃었다(GPU 재시작·절전 등) — 돌아올 때까지 그리지 않는다 */
    private lost = false;
    private onVisibility = () => {
        if (document.hidden) { cancelAnimationFrame(this.raf); this.raf = 0; return; }
        this.slots.forEach((s) => { s.lastT = 0; });
        this.wake();
    };

    /** three·렌더러·반사광을 한 번만 준비한다. 안 되면 false */
    private boot(): Promise<boolean> {
        if (this.renderer) return Promise.resolve(true);
        if (this.failed) return Promise.resolve(false);
        if (!this.booting) {
            this.booting = (async () => {
                try {
                    const [THREE, { RoomEnvironment }] = await Promise.all([
                        import("three"),
                        import("three/addons/environments/RoomEnvironment.js"),
                    ]);
                    const canvas = document.createElement("canvas");
                    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
                    renderer.setPixelRatio(1);
                    renderer.outputColorSpace = THREE.SRGBColorSpace;
                    renderer.toneMapping = THREE.NeutralToneMapping;
                    renderer.toneMappingExposure = 1;
                    const bake = () => {
                        const pmrem = new THREE.PMREMGenerator(renderer);
                        const room = new RoomEnvironment();
                        const env = pmrem.fromScene(room, 0.04).texture;
                        room.dispose();
                        pmrem.dispose();
                        return env;
                    };
                    this.env = bake();
                    renderer.setClearColor(0x000000, 0);
                    renderer.setScissorTest(true);
                    // 맥락을 잃은 동안에는 그리지 않는다 — 빈 버퍼를 칸에 옮겨 담으면 오브제가 지워진다.
                    // 스스로 돌려준(releaseGpu) 맥락의 소식은 늦게 온다 — 그때는 이미 다른 렌더러다
                    canvas.addEventListener("webglcontextlost", (e) => {
                        e.preventDefault();
                        if (this.renderer !== renderer) return;
                        this.lost = true;
                        cancelAnimationFrame(this.raf);
                        this.raf = 0;
                    });
                    canvas.addEventListener("webglcontextrestored", () => {
                        if (this.renderer !== renderer) return;
                        // three 는 버퍼·그림은 다시 올리지만 구워 둔 반사광(렌더 타깃)은 빈 채로 둔다 — 금빛이 검게 죽어 남았다.
                        // 다시 굽고, 옛 반사광을 쥔 오브제는 새로 만든다(옛 것은 옛 맥락과 함께 이미 사라졌다 — 놓기만 한다)
                        this.lost = false;
                        this.env = bake();
                        renderer.setScissorTest(true);
                        this.slots.forEach((s) => { if (s.inst) s.create(true); else s.dirty = true; });
                        this.wake();
                    });
                    this.THREE = THREE;
                    this.renderer = renderer;
                    this.lite = window.matchMedia("(hover: none)").matches;
                    this.bufW = this.bufH = 0;
                    document.addEventListener("visibilitychange", this.onVisibility);
                    return true;
                } catch {
                    this.failed = true;
                    return false;
                } finally {
                    this.booting = null;
                }
            })();
        }
        return this.booting;
    }

    attach(canvas: HTMLCanvasElement, init: SlotInit): Slot {
        clearTimeout(this.idleTimer);
        const slot = new Slot(this, canvas, init);
        this.slots.add(slot);
        this.byCanvas.set(canvas, slot);
        if (!this.io) {
            this.io = new IntersectionObserver((entries) => {
                for (const e of entries) {
                    const s = this.byCanvas.get(e.target);
                    if (!s) continue;
                    s.visible = e.isIntersecting;
                    if (!s.visible) continue;
                    s.lastT = 0;
                    if (!s.started) this.start(s);
                    else this.wake();
                }
            }, { rootMargin: "48px" });
            this.ro = new ResizeObserver((entries) => {
                for (const e of entries) this.byCanvas.get(e.target)?.measure();
            });
        }
        this.io.observe(canvas);
        this.ro?.observe(canvas);
        return slot;
    }

    /** 칸이 처음 보였다 — 렌더러를 열고(이미 있으면 그대로) 오브제를 받는다 */
    private start(slot: Slot) {
        slot.started = true;
        void this.boot().then((ok) => {
            if (slot.disposed) return;
            if (!ok || !slot.ctx) { this.detach(slot); slot.init.onFail(); return; }
            if (this.asleep) {
                // 맥락을 돌려준 뒤에 새 칸이 보였다 — 장면을 버렸던 칸들도 되살린다
                this.asleep = false;
                this.slots.forEach((s) => { if (s !== slot && s.def && !s.inst) s.create(); });
            }
            slot.measure();
            void slot.build();
        });
    }

    detach(slot: Slot) {
        if (!this.slots.has(slot)) return;
        slot.dispose();
        this.slots.delete(slot);
        this.io?.unobserve(slot.canvas);
        this.ro?.unobserve(slot.canvas);
        this.byCanvas.delete(slot.canvas);
        if (this.slots.size === 0) {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => { if (this.slots.size === 0) this.teardown(); }, IDLE_DISPOSE_MS);
        }
    }

    private teardown() {
        this.io?.disconnect();
        this.ro?.disconnect();
        this.io = null;
        this.ro = null;
        this.releaseGpu();
        this.asleep = false;
    }

    private releaseGpu() {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        clearTimeout(this.stillTimer);
        this.env?.dispose();
        this.env = null;
        this.renderer?.dispose();
        this.renderer?.forceContextLoss();
        this.renderer = null;
        this.lost = false;
        document.removeEventListener("visibilitychange", this.onVisibility);
    }

    /** 모든 칸이 멈춘 한 장이고 다 그려졌으면 잠시 뒤 맥락을 돌려준다 */
    private maybeRest() {
        clearTimeout(this.stillTimer);
        const resting = () => [...this.slots].every((s) => s.motion === "off" && !(s.visible && s.dirty));
        if (!this.slots.size || !resting()) return;
        this.stillTimer = setTimeout(() => {
            if (!this.renderer || this.raf || !resting()) return;
            this.slots.forEach((s) => s.release());
            this.releaseGpu();
            this.asleep = true;
        }, STILL_RELEASE_MS);
    }

    /** 돌려준 맥락을 다시 연다 — 다시 그릴 칸이 있을 때만 */
    private revive() {
        if (this.reviving) return;
        this.reviving = true;
        void this.boot().then((ok) => {
            this.reviving = false;
            if (!ok) return;
            this.asleep = false;
            this.slots.forEach((s) => { if (s.def && !s.inst) s.create(); });
            this.wake();
        });
    }

    wake() {
        if (typeof document === "undefined") return;
        clearTimeout(this.stillTimer);
        if (this.asleep) {
            if ([...this.slots].some((s) => s.visible && s.dirty)) this.revive();
            return;
        }
        if (this.raf || !this.renderer || this.lost || document.hidden) return;
        this.raf = requestAnimationFrame(this.tick);
    }

    private tick = (now: number) => {
        this.raf = 0;
        const r = this.renderer;
        if (!r || this.lost || document.hidden) return;
        let again = false;
        for (const s of this.slots) {
            if (!s.inst || !s.visible || s.w < 2 || s.h < 2) continue;
            const live = s.motion !== "off";
            const busy = s.input.dragging || s.input.hover;
            const wants = live && (s.moving || busy);
            const due = s.dirty || (wants && now - s.lastDraw >= (busy ? FRAME_MS_ACTIVE : FRAME_MS) - 2);
            if (!due) {
                if (wants) again = true;
                continue;
            }
            const raw = s.lastT ? Math.min(0.1, (now - s.lastT) / 1000) : 0;
            s.lastT = now;
            const dt = live ? raw * (s.motion === "gentle" ? GENTLE : 1) : 0;
            const more = s.inst.update(dt, s.input);
            s.input.dragX = 0;
            s.input.dragY = 0;
            this.draw(r, s);
            s.dirty = false;
            s.lastDraw = now;
            s.moving = live && (more || busy);
            if (s.moving) again = true;
        }
        if (again) this.raf = requestAnimationFrame(this.tick);
        else this.maybeRest();
    };

    private draw(r: THREE_NS.WebGLRenderer, s: Slot) {
        const inst = s.inst!;
        const [rw, rh] = s.renderSize();
        if (rw > this.bufW || rh > this.bufH) {
            // 자랄 때만 128 단위로 늘린다 — 칸마다 크기를 바꾸면 버퍼를 매번 새로 잡는다
            this.bufW = Math.max(this.bufW, Math.ceil(rw / 128) * 128);
            this.bufH = Math.max(this.bufH, Math.ceil(rh / 128) * 128);
            r.setSize(this.bufW, this.bufH, false);
        }
        r.setViewport(0, 0, rw, rh);
        r.setScissor(0, 0, rw, rh);
        r.render(inst.scene, inst.camera);
        const ctx = s.ctx!;
        ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
        // WebGL 은 왼쪽 아래가 원점 — 2D 좌표로는 버퍼 맨 아래 rh 줄이다
        ctx.drawImage(r.domElement, 0, this.bufH - rh, rw, rh, 0, 0, s.canvas.width, s.canvas.height);
    }
}

let stage: Stage | null = null;

/** 칸 하나를 무대에 올린다. 돌려받은 것으로 색·움직임·active 를 바꾸고, 다 쓰면 detach */
export function attachObjet(canvas: HTMLCanvasElement, init: SlotInit) {
    if (!stage) {
        stage = new Stage();
        // 개발 중에만: 콘솔에서 무대를 들여다본다 (window.__objet.renderer 가 null 이면 맥락을 돌려준 상태)
        if (process.env.NODE_ENV !== "production") (window as unknown as { __objet?: Stage }).__objet = stage;
    }
    const s = stage;
    const slot = s.attach(canvas, init);
    return {
        setTone: (tone: ObjetTone) => slot.setTone(tone),
        setMotion: (motion: ObjetMotion) => slot.setMotion(motion),
        setActive: (on: boolean) => slot.setActive(on),
        detach: () => s.detach(slot),
    };
}

export type ObjetHandle = ReturnType<typeof attachObjet>;
