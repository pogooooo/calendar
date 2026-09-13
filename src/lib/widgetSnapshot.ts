/**
 * 안드로이드 홈 위젯에 넘길 자료.
 *
 * 홈 위젯은 WebView 를 담을 수 없다. 예전에는 앱 안에서 화면 밖 WebView 로 위젯
 * 페이지를 찍어 그림으로 넘기려 했는데, 그 WebView 는 Tauri 가 만든 게 아니라
 * `tauri.localhost` 를 못 열어 늘 빈 그림이었다. 이제는 앱이 여기서 재료(JSON)를
 * 만들어 파일로 두고, Kotlin(CronosWidgetProvider)이 그걸로 네이티브 위젯을 그린다.
 *
 * 규칙은 화면과 같다 — 반복은 expandTodos 로 펼치고, 날짜는 사용자 시간대(localDateKey),
 * 완료 기록은 UTC 날짜(utcDayKey). "지금/다음" 판정은 Kotlin 이 그릴 때 하므로
 * (30분마다 스스로 다시 그린다) 시각은 그대로 넘긴다.
 */
import { localDateKey, utcDayKey } from "@/lib/dateKey";
import { expandTodos } from "@/hooks/useExpandedTodos";
import type { Translations } from "@/i18n/types";
import type { TodoType, CategoryType, ChallengeType } from "@/types";

export interface SnapshotTodo {
    title: string;
    startAt: string;   // ISO
    endAt: string;     // ISO
    allDay: boolean;
    done: boolean;
    color: string;
}

export interface SnapshotChallenge {
    title: string;
    count: number;
    target: number | null;
    doneToday: boolean;
}

export interface WidgetSnapshot {
    generatedAt: string;
    /** 만든 날 (사용자 시간대). */
    date: string;
    todos: SnapshotTodo[];
    challenges: SnapshotChallenge[];
    labels: {
        today: string; noTodayTodos: string;
        now: string; next: string; nothingNow: string; nothingNext: string;
        challenge: string; noChallenges: string; allDay: string;
    };
}

export function buildWidgetSnapshot(
    todos: TodoType[],
    categories: Pick<CategoryType, "id" | "color">[],
    challenges: ChallengeType[],
    t: Translations,
    fallbackColor: string,
    now: Date = new Date(),
): WidgetSnapshot {
    const todayKey = localDateKey(now);
    // 앞으로 이레치까지 넘긴다. 앱이 며칠 안 켜져도 위젯이 날짜를 넘겨 가며 고를 수 있게.
    const horizon = new Date(now); horizon.setDate(horizon.getDate() + 7);

    const color = (id?: string | null) => categories.find(c => c.id === id)?.color || fallbackColor;

    const snapTodos: SnapshotTodo[] = expandTodos(todos, now, horizon)
        .map(td => ({
            title: td.title,
            startAt: new Date(td.startAt!).toISOString(),
            endAt: new Date(td.endAt!).toISOString(),
            allDay: !!td.isAllDay,
            done: !!td.isDone,
            color: color(td.categoryId),
        }))
        .sort((a, b) => a.startAt.localeCompare(b.startAt));

    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const expired = (c: ChallengeType) => {
        if (c.targetCount == null) return false;
        const s = new Date(c.startAt); s.setHours(0, 0, 0, 0);
        const last = new Date(s); last.setDate(s.getDate() + (c.targetCount - 1) * c.interval);
        return dayStart > last;
    };
    const snapChallenges: SnapshotChallenge[] = challenges
        .filter(c => (c.targetCount == null || (c.completions?.length ?? 0) < c.targetCount) && !expired(c))
        .map(c => ({
            title: c.title,
            count: c.completions?.length ?? 0,
            target: c.targetCount ?? null,
            doneToday: (c.completions ?? []).some(x => utcDayKey(x.targetDate) === todayKey),
        }));

    return {
        generatedAt: now.toISOString(),
        date: todayKey,
        todos: snapTodos,
        challenges: snapChallenges,
        labels: {
            today: t.widget.todayW,
            noTodayTodos: t.home.noTodayTodos,
            now: t.widget.now,
            next: t.widget.next,
            nothingNow: t.widget.nothingNow,
            nothingNext: t.widget.nothingNext,
            challenge: t.home.challenge,
            noChallenges: t.home.noChallenges,
            allDay: t.todo.allDay,
        },
    };
}
