/**
 * 앱 껍데기가 무엇인지 가린다.
 *
 * isDesktopApp() 은 "Tauri 안인가"만 본다. 안드로이드 빌드도 Tauri 라서
 * 그것만으로 창 단추(타이틀바)를 그리면 폰 화면 위에 최소화·최대화·닫기가 뜬다.
 * 창 개념이 있는 플랫폼인지 따로 물어야 한다.
 */
import { isDesktopApp } from "@/lib/apiBase";

const mobileUA = () =>
    typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/** Tauri 안이면서 폰·태블릿 (안드로이드/iOS) */
export const isMobileShell = () => isDesktopApp() && mobileUA();

/** Tauri 안이면서 창을 띄우는 플랫폼 (윈도우·맥·리눅스) */
export const isDesktopShell = () => isDesktopApp() && !mobileUA();
