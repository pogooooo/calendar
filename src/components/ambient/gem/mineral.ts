/** Deterministic translucent agate bands. Static 2D canvas: no permanent redraw loop. */
export function createMineral(canvas: HTMLCanvasElement, { color, gold, dark }: { color: string; gold: string; dark: boolean }) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    let resizeFrame = 0;
    const draw = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, w, h);
        let seed = 2947;
        const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

        for (const side of [0, 1]) {
            const span = Math.min(w * .31, 375);
            const cx = side ? w + span * .46 : -span * .56;
            const cy = side ? h * .26 : h * .87;
            const angle = side ? -.28 : -.52;
            const ca = Math.cos(angle), sa = Math.sin(angle);
            const scales = [1, .81, .66, .46, .32, .19];
            // Each stratum has its own offset and folds. Broad overlapping slices replace parallel lines.
            const point = (a: number, layer: number): [number, number] => {
                const scale = scales[layer];
                const phase = side * 1.8 + layer * .38;
                const fold = 1 + Math.sin(a * 3 + phase) * .105 + Math.sin(a * 5 - phase * .7) * .045 + Math.cos(a * 8 + 1.2) * .018;
                const x = Math.cos(a) * span * scale * fold;
                const y = Math.sin(a) * h * .83 * (scale * .62 + .38) * fold;
                return [cx + x * ca - y * sa + Math.sin(layer * 1.4) * span * .045, cy + x * sa + y * ca + layer * h * .018];
            };
            const path = (layer: number) => {
                ctx.beginPath();
                for (let i = 0; i <= 220; i++) {
                    const [x, y] = point(i / 220 * Math.PI * 2, layer);
                    if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.closePath();
            };
            for (let layer = 0; layer < scales.length; layer++) {
                path(layer);
                const wash = ctx.createLinearGradient(side ? w : 0, 0, side ? w - span * .85 : span * .85, h * .2);
                wash.addColorStop(0, layer % 3 === 1 ? (dark ? '#d9cde8' : '#ffffff') : color);
                wash.addColorStop(.45, layer % 3 === 1 ? (dark ? '#d9cde8' : '#ffffff') : color);
                wash.addColorStop(1, 'transparent');
                ctx.fillStyle = wash;
                ctx.globalAlpha = layer % 3 === 1 ? (dark ? .025 : .16) : (dark ? .075 : .06);
                ctx.fill();
                // A few broad color boundaries carry mineral depth; the remaining strata have no outline.
                if (layer === 0 || layer === 3) {
                    ctx.strokeStyle = color; ctx.lineWidth = layer === 0 ? 1.35 : 2.5;
                    ctx.globalAlpha = dark ? .15 : .085; ctx.stroke();
                }
            }
            // A single broken gold inclusion meanders along one exposed edge, with irregular thickness.
            const veinLayer = 1;
            const start = side ? Math.PI * .62 : -Math.PI * .4;
            for (let segment = 0; segment < 12; segment++) {
                if (segment === 3 || segment === 8) continue;
                const from = start + segment * .12, to = from + .105;
                ctx.beginPath();
                for (let i = 0; i <= 12; i++) {
                    const [x, y] = point(from + (to - from) * i / 12, veinLayer);
                    if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = gold; ctx.lineWidth = .55 + random() * 1.2;
                ctx.globalAlpha = dark ? .32 : .24; ctx.stroke();
            }
            ctx.fillStyle = gold;
            for (let i = 0; i < 24; i++) {
                const [vx, vy] = point(start + random() * 1.45, veinLayer);
                const x = vx + (random() - .5) * 18, y = vy + (random() - .5) * 12;
                const size = .8 + random() * 1.5;
                ctx.globalAlpha = .1 + random() * .18;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + size * .8, y - size * .4);
                ctx.lineTo(x + size * 1.6, y + size * .5); ctx.lineTo(x + size * .3, y + size * 1.3); ctx.closePath(); ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    };
    const resize = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(draw); };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); draw();
    return () => { observer.disconnect(); cancelAnimationFrame(resizeFrame); };
}
