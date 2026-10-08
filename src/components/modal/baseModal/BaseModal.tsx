import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, useReducedMotion, type MotionProps } from "framer-motion";
import { ThemeProvider, DefaultTheme } from "styled-components";
import { MOBILE_BREAKPOINT } from "@/styles/breakpoints";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialBaseModal.styles";
import * as MapleS from "./maple/MapleBaseModal.styles";
import * as OceanS from './ocean/OceanBaseModal.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

type ModalMotion = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;
/**
 * 갈래가 제 몸짓을 주면 데스크톱 창(desktop)과 바탕 막(overlay)은 그것으로 움직인다. 없으면 아래의 기본 몸짓.
 * 바다는 오른쪽에서 밀려 들어오는 시트라 가운데서 커지는 기본 몸짓이 맞지 않는다 (OceanBaseModal.styles).
 */
const MOTION: ThemeImpls<{ desktop?: ModalMotion; overlay?: ModalMotion } | null> = { celestial: null, maple: null, ocean: OceanS.modalMotion };
const FADE: ModalMotion = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

/**
 * 위젯 창은 배경이 비쳐 보이도록 surface를 transparent로, 글자색도 배경에 맞게 덮어쓴다.
 * 모달은 그 위에 떠야 하므로 원본(baseColors) 색상을 되돌려 항상 읽히게 한다.
 */
const restoreBaseColors = (outer?: DefaultTheme): DefaultTheme =>
    (outer?.baseColors ? { ...outer, colors: outer.baseColors } : outer) as DefaultTheme;

/**
 * 자판이 가린 만큼 시트 바탕을 줄인다. 크롬과 안드로이드 앱은 화면 자체가 줄어 CSS(100dvh)로 충분하지만,
 * 사파리는 interactive-widget 을 모르고 보이는 칸(visual viewport)만 줄인다 — 그러면 아래에 붙은 시트가 자판 밑에 깔린다.
 * 그때만 바탕을 보이는 칸에 맞춘다. 손가락으로 확대한 동안(scale ≠ 1)은 건드리지 않는다.
 */
function useKeyboardBox(active: boolean) {
    const [box, setBox] = React.useState<{ top: number; height: number } | null>(null);
    React.useEffect(() => {
        const vv = typeof window !== "undefined" ? window.visualViewport : null;
        if (!active || !vv) { setBox(null); return; }
        const update = () => {
            const covered = window.innerHeight - vv.height;
            setBox(covered > 80 && Math.abs(vv.scale - 1) < 0.01 ? { top: vv.offsetTop, height: vv.height } : null);
        };
        update();
        vv.addEventListener("resize", update);
        vv.addEventListener("scroll", update);
        return () => {
            vv.removeEventListener("resize", update);
            vv.removeEventListener("scroll", update);
        };
    }, [active]);
    return box;
}

export interface CelestialBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    ariaLabel?: string;
}

export default function BaseModal({ isOpen, onClose, children, maxWidth = "400px", ariaLabel }: CelestialBaseModalProps) {
    const S = usePickTheme(STYLES);
    const themedMotion = usePickTheme(MOTION);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();
    const closeRef = React.useRef(onClose);
    closeRef.current = onClose;
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
        // isOpen 은 "열릴 때마다 다시 재라"는 신호다. 값은 안 쓰지만 의존성이 맞다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOpen],
    );

    /**
     * 폰에서는 아래에서 올라오는 시트다. 가운데서 커지는 몸짓은 시트와 안 맞고,
     * 어디서 왔는지도 알려 주지 않는다. 올라오고 내려가게 한다.
     */
    const sheet = reducedMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
        : isMobile
        ? {
            initial: { y: "100%", opacity: 1 },
            animate: { y: 0, opacity: 1 },
            exit: { y: "100%", opacity: 1 },
            transition: { type: "spring" as const, damping: 32, stiffness: 340, mass: 0.8 },
        }
        : themedMotion?.desktop ?? {
            initial: { scale: 0.95, opacity: 0, y: 15 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.95, opacity: 0, y: 15 },
            transition: { type: "spring" as const, damping: 25, stiffness: 300 },
        };
    const veil = themedMotion?.overlay ?? FADE;

    const keyboardBox = useKeyboardBox(isOpen && isMobile);

    // 초점은 열릴 때 한 번만 옮긴다. 예전엔 이름표(ariaLabel)도 의존성이라, 이름표가 치는 제목을 따라가는
    // 프로젝트·작업 창에서는 한 글자마다 이 효과가 다시 돌아 초점이 창으로 튀었다 — 한글 조합이 "ㅎ하할" 로 끊겼다.
    React.useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const container = containerRef.current;
        if (!container) return;
        // Focusing the sheet itself on phones avoids opening the keyboard before the user chooses a field.
        container.focus({ preventScroll: true });
        const handleKeyDown = (e: KeyboardEvent) => {
            const dialogs = document.querySelectorAll('[role="dialog"]');
            if (e.defaultPrevented || dialogs[dialogs.length - 1] !== container) return;
            if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [isOpen]);

    // 이름표만 따로 맞춘다 — 초점은 건드리지 않는다
    React.useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (!container) return;
        const heading = container.querySelector('h1, h2, h3, .title-input');
        container.setAttribute('aria-label', ariaLabel || heading?.textContent?.trim() || heading?.getAttribute('placeholder') || 'CRONOS');
    }, [isOpen, ariaLabel]);

    const handleTab = (e: React.KeyboardEvent) => {
        if (e.key !== 'Tab' || e.defaultPrevented) return;
        const container = containerRef.current;
        if (!container || !container.contains(e.target as Node)) return;
        const focusable = Array.from(container.querySelectorAll<HTMLElement>(
            'button, input, textarea, select, a[href], [tabindex]',
        )).filter(el => el.tabIndex >= 0 && !el.matches(':disabled, [aria-disabled="true"]') && el.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) { e.preventDefault(); container.focus(); return; }
        if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === container)) {
            e.preventDefault(); first.focus();
        }
    };

    if (typeof document === "undefined") return null;

    return createPortal(
        <ThemeProvider theme={restoreBaseColors}>
        <AnimatePresence>
            {isOpen && (
                <S.Overlay
                    {...veil}
                    onClick={onClose}
                    style={keyboardBox ?? undefined}
                >
                    <S.Container
                        ref={containerRef}
                        role="dialog"
                        aria-modal="true"
                        tabIndex={-1}
                        onKeyDown={handleTab}
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
