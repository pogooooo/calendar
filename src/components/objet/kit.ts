/**
 * 오브제를 만들 때 쓰는 작은 도구 (갈래와 상관없는 것만).
 */

/** 만든 geometry·material·texture 를 모아 두었다가 dispose() 한 번에 돌려준다 */
export class Bag {
    private items: { dispose(): void }[] = [];
    add<T extends { dispose(): void }>(item: T): T {
        this.items.push(item);
        return item;
    }
    dispose() {
        this.items.forEach((i) => i.dispose());
        this.items.length = 0;
    }
}

/** v 를 dt 초 동안 target 쪽으로 (빠르기 rate — 클수록 빨리 붙는다). 프레임 수와 상관없이 같은 느낌 */
export const approach = (v: number, target: number, rate: number, dt: number) =>
    v + (target - v) * (1 - Math.exp(-rate * dt));

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** 끈 거리로 돌리기 — 놓으면 관성으로 조금 더 돌다 멈춘다 */
export class Spin {
    angle: number;
    private vel = 0;
    constructor(angle = 0, private perPx = 0.011, private friction = 2.4) {
        this.angle = angle;
    }
    step(dt: number, dragging: boolean, dragPx: number) {
        if (dragging) {
            const d = dragPx * this.perPx;
            this.angle += d;
            if (dt > 0) this.vel = clamp(d / Math.max(dt, 1 / 60), -7, 7);
        } else {
            this.angle += this.vel * dt;
            this.vel *= Math.exp(-this.friction * dt);
        }
        return Math.abs(this.vel) > 0.002 || dragging;
    }
}
