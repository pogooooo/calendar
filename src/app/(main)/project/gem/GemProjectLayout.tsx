import { useId, useState } from "react";
import { useT } from "@/i18n/useT";
import useSettingStore from "@/store/useSettingStore";
import useIsMobile from "@/hooks/useIsMobile";
import useMobilePresentation from "@/hooks/useMobilePresentation";
import type { ProjectLayoutProps } from "../ProjectLayout.types";
import * as S from "./GemProjectPage.styles";

export default function GemProjectLayout({ containerRef, timeline, resizer, board }: ProjectLayoutProps) {
    const t = useT();
    const ko = useSettingStore(state => state.locale) === "ko";
    const panelId = useId();
    const [view, setView] = useState<"both" | "board" | "timeline">("both");
    const narrow = useIsMobile();
    const mobileApp = useMobilePresentation();
    const compact = narrow || mobileApp;
    const currentView = compact && view === "both" ? "board" : view;
    return <S.ContentLayout ref={containerRef} data-theme-layout="gem-project" data-board-first="false" data-project-view={currentView}>
        <S.MobileViews role="group" aria-label={t.home.project}>
            {!compact && <button type="button" aria-pressed={view === "both"} aria-controls={`${panelId}-board ${panelId}-timeline`} onClick={() => setView("both")}>{ko ? "함께 보기" : "Show both"}</button>}
            <button type="button" aria-pressed={currentView === "board"} aria-controls={`${panelId}-board`} onClick={() => setView("board")}>{t.calendar.board}</button>
            <button type="button" aria-pressed={view === "timeline"} aria-controls={`${panelId}-timeline`} onClick={() => setView("timeline")}>{t.calendar.timeline}</button>
        </S.MobileViews>
        <S.MobilePanel id={`${panelId}-timeline`} data-mobile-panel="timeline" data-gem-route-content>{timeline}</S.MobilePanel>
        {currentView === "both" && resizer}
        <S.MobilePanel id={`${panelId}-board`} data-mobile-panel="board" data-gem-route-content>{board}</S.MobilePanel>
    </S.ContentLayout>;
}
