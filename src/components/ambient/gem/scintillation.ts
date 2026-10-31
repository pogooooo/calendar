type Options = { color: string; gold: string; dark: boolean; motion: 'full' | 'gentle' | 'off' };

/** Sparse edge glints. No random values enter React's server/client markup. */
export function createScintillation(canvas: HTMLCanvasElement, options: Options) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    let frame = 0, last = 0, width = 0, height = 0, disposed = false;
    let time = 0;
    const points = Array.from({ length: 30 }, (_, i) => ({
        side: i % 2, edge: ((i * 37 + 13) % 97) / 97,
        y: ((i * 29 + 7) % 101) / 101,
        size: 3 + (i * 7 % 8), phase: i * 2.39996,
    }));
    const draw = () => {
        ctx.clearRect(0, 0, width, height);
        const mobile = width <= 768;
        ctx.globalCompositeOperation = options.dark ? 'screen' : 'source-over';
        for (const [i, point] of points.entries()) {
            if (mobile && i > 17) break;
            const edge = point.edge * (mobile ? .105 : .18);
            const x = (point.side ? 1 - edge : edge) * width;
            const y = (point.y * .88 + .04) * height;
            const peak = options.motion === 'full'
                ? Math.pow(Math.max(0, Math.sin(time * .7 + point.phase)), 12)
                : (i % 7 === 0 ? .45 : .025);
            const size = point.size * (mobile ? .75 : 1) * (.6 + peak * .65);
            ctx.globalAlpha = .1 + peak * (options.dark ? .82 : .7);
            const halo = ctx.createRadialGradient(x, y, 0, x, y, size * 2.4);
            halo.addColorStop(0, options.dark ? '#fff8e5' : options.gold);
            halo.addColorStop(.18, options.color + '50');
            halo.addColorStop(1, options.color + '00');
            ctx.fillStyle = halo;
            ctx.fillRect(x - size * 2.4, y - size * 2.4, size * 4.8, size * 4.8);
            ctx.fillStyle = options.dark ? '#fff5da' : options.gold;
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.quadraticCurveTo(x + size * .12, y - size * .12, x + size * .66, y);
            ctx.quadraticCurveTo(x + size * .12, y + size * .12, x, y + size);
            ctx.quadraticCurveTo(x - size * .12, y + size * .12, x - size * .66, y);
            ctx.quadraticCurveTo(x - size * .12, y - size * .12, x, y - size);
            ctx.fill();
            ctx.globalAlpha = peak * .95;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - .7, y - .7, 1.4, 1.4);
        }
        ctx.globalAlpha = 1;
    };
    const tick = (stamp: number) => {
        frame = 0;
        if (disposed || document.hidden || options.motion !== 'full') return;
        if (stamp - last >= 1000 / (width <= 768 ? 18 : 24)) {
            time += Math.min((stamp - last) / 1000, .1); last = stamp;
            draw();
        }
        frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
        cancelAnimationFrame(frame); frame = 0; last = performance.now();
        if (!document.hidden && !disposed && options.motion === 'full') frame = requestAnimationFrame(tick);
    };
    const resize = () => {
        width = canvas.clientWidth; height = canvas.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, width <= 768 ? 1.25 : 1.5);
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', visibility);
    resize(); visibility();
    return () => {
        disposed = true; cancelAnimationFrame(frame); observer.disconnect();
        document.removeEventListener('visibilitychange', visibility);
    };
}
