if (
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    window.location.hostname === 'tauri.localhost' &&
    '__TAURI_INTERNALS__' in window
) {
    const assetUrl = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src*="/_next/"]'))
        .map(script => new URL(script.src, window.location.href))
        .find(url => /^https?:$/.test(url.protocol) && url.origin !== window.location.origin);

    if (assetUrl) {
        // Next 16 drops the asset origin before creating HMR; Tauri's local HTTP proxy cannot carry WebSockets.
        window.WebSocket = new Proxy(window.WebSocket, {
            construct(Target, args, newTarget) {
                const sourceUrl = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : null;
                if (sourceUrl === null) return Reflect.construct(Target, args, newTarget);
                let socketUrl: URL;
                try {
                    socketUrl = new URL(sourceUrl, window.location.href);
                } catch {
                    return Reflect.construct(Target, args, newTarget);
                }
                if (
                    /^wss?:$/.test(socketUrl.protocol) &&
                    socketUrl.hostname === 'tauri.localhost' &&
                    socketUrl.pathname === '/_next/hmr'
                ) {
                    socketUrl.protocol = assetUrl.protocol === 'https:' ? 'wss:' : 'ws:';
                    socketUrl.host = assetUrl.host;
                    return Reflect.construct(Target, [socketUrl.href, ...args.slice(1)], newTarget);
                }
                return Reflect.construct(Target, args, newTarget);
            },
        });
    }
}

export {};
