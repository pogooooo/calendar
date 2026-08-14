import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, DefaultTheme } from "styled-components";
import * as S from "./CelestialBaseModal.styles";

/**
 * 위젯 창은 배경이 비쳐 보이도록 surface를 transparent로, 글자색도 배경에 맞게 덮어쓴다.
 * 모달은 그 위에 떠야 하므로 원본(baseColors) 색상을 되돌려 항상 읽히게 한다.
 */
const restoreBaseColors = (outer?: DefaultTheme): DefaultTheme =>
    (outer?.baseColors ? { ...outer, colors: outer.baseColors } : outer) as DefaultTheme;

export interface CelestialBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function CelestialBaseModal({ isOpen, onClose, children, maxWidth = "400px" }: CelestialBaseModalProps) {

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <ThemeProvider theme={restoreBaseColors}>
        <AnimatePresence>
            {isOpen && (
                <S.Overlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <S.Container
                        $maxWidth={maxWidth}
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </S.Container>
                </S.Overlay>
            )}
        </AnimatePresence>
        </ThemeProvider>,
        document.body,
    );
}