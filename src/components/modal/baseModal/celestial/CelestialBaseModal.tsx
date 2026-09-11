import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, DefaultTheme } from "styled-components";
import { MOBILE_BREAKPOINT } from "@/styles/breakpoints";
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
    /**
     * 시트인지 창인지는 뜨는 그 순간 정해져야 한다. 상태로 들고 있는 훅
     * (useIsMobile)은 첫 렌더에 false 를 주는데, framer-motion 은 initial 을
     * 마운트 때 한 번만 읽으므로 폰에서도 데스크톱 몸짓이 굳어 버린다.
     * 그래서 열릴 때마다 창 폭을 직접 본다. 모달은 클라이언트에서만 그려지므로
     * 여기서 matchMedia 를 읽어도 서버 렌더와 어긋날 일이 없다.
     */
    const isMobile = React.useMemo(
        () => typeof window !== "undefined"
            && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches,
        [isOpen],
    );

    /**
     * 폰에서는 아래에서 올라오는 시트다. 가운데서 커지는 몸짓은 시트와 안 맞고,
     * 어디서 왔는지도 알려 주지 않는다. 올라오고 내려가게 한다.
     */
    const sheet = isMobile
        ? {
            initial: { y: "100%", opacity: 1 },
            animate: { y: 0, opacity: 1 },
            exit: { y: "100%", opacity: 1 },
            transition: { type: "spring" as const, damping: 32, stiffness: 340, mass: 0.8 },
        }
        : {
            initial: { scale: 0.95, opacity: 0, y: 15 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.95, opacity: 0, y: 15 },
            transition: { type: "spring" as const, damping: 25, stiffness: 300 },
        };

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
                        {...sheet}
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