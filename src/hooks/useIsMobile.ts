"use client";

import * as React from "react";
import { MOBILE_BREAKPOINT } from "@/styles/breakpoints";

/**
 * 서버에는 창이 없다. 그쪽에서 useLayoutEffect 를 쓰면 경고가 나므로 갈라 쓴다.
 */
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * 폰 폭인지 알려준다.
 *
 * 첫 렌더는 언제나 false 다. 서버가 그린 것과 어긋나면 hydration 이 깨지기
 * 때문이다. 대신 값을 채우는 일은 화면을 칠하기 **전**에 한다(useLayoutEffect).
 * useEffect 로 두면 폰에서 데스크톱 화면이 한 번 번쩍였다 바뀐다.
 *
 * 이 훅으로 정한 값을 애니메이션의 initial 처럼 "마운트 한 번만 읽히는 곳"에
 * 넘기지 말 것. 그 시점에는 아직 false 다. 그런 자리에서는 matchMedia 를 직접 읽는다.
 */
export default function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
    const [isMobile, setIsMobile] = React.useState(false);

    useIsoLayoutEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const apply = () => setIsMobile(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, [breakpoint]);

    return isMobile;
}
