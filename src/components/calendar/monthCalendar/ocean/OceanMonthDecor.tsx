"use client";
/**
 * 바다 월간의 장면과 칸 표시 — 물웅덩이.
 *   - 판: 오늘이 든 달이면 오늘 칸의 세로줄로 햇살 한 줄기가 내려와 오늘 칸에 닿는다(그 아래로는 옅어진다).
 *     햇살 속에는 앱의 물과 같은 빛 그물(caustic.ts)이 일렁이고, 작은 티끌이 천천히 떠내려간다. 칸 뒤에 깔린다
 *   - 장면: 달을 넘기면 물마루 빛 한 줄이 오는 쪽에서 격자를 건너가고, 칸들이 그 물결을 따라 차례로 살짝 출렁인다
 *     (칸의 내용은 숨기지 않는다 — 출렁임은 OceanMonthCalendar.styles 의 DayCell)
 *   - 오늘: 숫자 둘레로 물결이 천천히 번지고, 작은 물방울이 숫자 옆에서 피어올라 사라진다
 *   - 고른 날: 칸 가운데서 물결 한 번이 퍼진다(고른 순간)
 * 끝없이 움직이는 것(빛 그물의 일렁임·티끌·오늘의 물결·물방울)은 움직임 '풍성하게'에서만, 위젯 창에서는 멈춘 그림이다.
 */
import * as React from "react";
import { useTheme } from "styled-components";
import { paintCaustics } from "@/components/widget/ocean/caustic";
import type { CellMarksProps, MonthBoardProps, MonthStageProps } from "../MonthDecor.types";
import * as S from "./OceanMonthDecor.styles";

/** 햇살 속 빛 그물 한 장의 크기(CSS px) — 햇살 칸을 덮도록 늘려 깐다(background-size: cover) */
const NET_W = 260;
const NET_H = 520;
/** 밝기마다 한 번 그려 두고 판이 바뀌어도 다시 쓴다 — 그리는 데 십여 ms */
const nets = new Map<string, Promise<string>>();
function causticNet(dark: boolean): Promise<string> {
    const key = dark ? "dark" : "light";
    let net = nets.get(key);
    if (!net) {
        net = new Promise<string>((resolve) => {
            const cv = document.createElement("canvas");
            paintCaustics(cv, NET_W, NET_H, { t: 17.3, cell: 230, gain: dark ? 2.4 : 3, rgb: dark ? [150, 245, 228] : [255, 232, 160] });
            cv.toBlob((b) => resolve(b ? URL.createObjectURL(b) : ""), "image/png");
        });
        nets.set(key, net);
    }
    return net;
}

export function Board({ weeks, todayStr }: MonthBoardProps) {
    const dark = useTheme().mode === "dark";
    const at = React.useMemo(() => {
        for (let row = 0; row < weeks.length; row++) {
            const col = weeks[row].findIndex((d) => d.toDateString() === todayStr);
            if (col >= 0) return { row, col };
        }
        return null;
    }, [weeks, todayStr]);
    const [net, setNet] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (!at) return;
        let alive = true;
        // 판이 미끄러져 들어오는 동안은 피해서 그린다
        const id = window.setTimeout(() => { void causticNet(dark).then((url) => { if (alive && url) setNet(url); }); }, 160);
        return () => { alive = false; window.clearTimeout(id); };
    }, [at, dark]);

    if (!at) return null;
    const vars = { "--col": at.col, "--row": at.row, "--rows": weeks.length, ...(net ? { "--net": `url(${net})` } : {}) } as React.CSSProperties;
    return (
        <S.Beam aria-hidden="true" style={vars}>
            <i className="shaft" />
            {net && <><i className="net" /><i className="net late" /></>}
            <b className="mote" />
            <b className="mote m2" />
            <b className="mote m3" />
            <b className="mote m4" />
            <b className="mote m5" />
        </S.Beam>
    );
}

export function Stage({ month, direction }: MonthStageProps) {
    const key = month.getFullYear() * 12 + month.getMonth();
    const [first] = React.useState(key);
    // 처음 연 달에는 없다 — 넘길 때마다 새로 그려져(key) 한 번 건너간다
    if (key === first) return null;
    return <S.Crest key={key} data-dir={direction < 0 ? "prev" : "next"} aria-hidden="true" />;
}

export function Marks({ isToday, isSelected }: CellMarksProps) {
    return <>
        {isToday && (
            <S.Today aria-hidden="true">
                <i className="ripple" />
                <i className="ripple late" />
                <b className="bubble" />
                <b className="bubble b2" />
                <b className="bubble b3" />
            </S.Today>
        )}
        {isSelected && <S.Splash aria-hidden="true" />}
    </>;
}
