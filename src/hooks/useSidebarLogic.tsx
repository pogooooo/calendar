import { useState, useEffect, useCallback, useRef } from "react";

export const useSidebarLogic = () => {
    const [width, setWidth] = useState(200);
    const [isResizing, setIsResizing] = useState(false);
    const [screenHeight, setScreenHeight] = useState(0);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const resizingRef = useRef(false);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setScreenHeight(window.screen.height);
        }
    }, []);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizingRef.current = true;

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
    }, []);

    const stopResizing = useCallback(() => {
        if (!resizingRef.current) return;

        setIsResizing(false);
        resizingRef.current = false;

        if (sidebarRef.current) {
            const finalWidth = sidebarRef.current.offsetWidth;
            setWidth(finalWidth);
        }

        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
        document.body.style.webkitUserSelect = "auto";

        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
        }
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (!resizingRef.current || !sidebarRef.current) return;

        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
        }

        requestRef.current = requestAnimationFrame(() => {
            const newWidth = mouseMoveEvent.clientX;
            if (newWidth >= 160 && newWidth <= 600) {
                if (sidebarRef.current) {
                    sidebarRef.current.style.width = `${newWidth}px`;
                }
            }
        });
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize, { passive: true });
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return {
        width,
        isResizing,
        screenHeight,
        startResizing,
        sidebarRef
    };
};