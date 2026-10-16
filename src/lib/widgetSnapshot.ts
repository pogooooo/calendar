/**
 * 안드로이드 홈 위젯에 넘길 자료.
 *
 * 홈 위젯은 WebView 를 담을 수 없다. 예전에는 앱 안에서 화면 밖 WebView 로 위젯
 * 페이지를 찍어 그림으로 넘기려 했는데, 그 WebView 는 Tauri 가 만든 게 아니라
 * `tauri.localhost` 를 못 열어 늘 빈 그림이었다. 이제는 앱이 여기서 재료(JSON)를
 * 만들어 파일로 두고, Kotlin(CronosWidgetProvider → WidgetPainter)이 그걸로
 * 위젯을 그림 한 장으로 그린다.
 *
 * 규칙은 화면과 같다 — 반복은 expandTodos 로 펼치고, 날짜는 사용자 시간대(localDateKey),
 * 완료 기록은 UTC 날짜(utcDayKey). "지금/다음"·D-day 같은 시각 판정은 Kotlin 이
 * 그릴 때 한다 (자정과 일정 경계에 스스로 다시 그린다). 그래서 시각은 그대로 넘긴다.
 *
 * 창(window): 이 달 첫날부터, 이 달 끝과 오늘+14일 중 늦은 쪽까지.
 * 월간 위젯이 지난 날의 점까지 찍고, "다음" 이 달을 넘겨서도 보이게.
 */
import { localDateKey, utcDayKey, zonedTime } from "@/lib/dateKey";
import { challengeExpired } from "@/lib/challengeDays";
import { expandTodos } from "@/hooks/useExpandedTodos";
import type { Translations } from "@/i18n/types";
import type { TodoType, CategoryType, ChallengeType, ProjectType } from "@/types";
import type { AnniversaryType } from "@/store/useAnniversaryStore";

export interface SnapshotTodo {
    /** 원래 할 일의 id (반복 펼침의 꼬리표는 뗀다) — 위젯에서 누르면 그 날짜의 일간으로 간다 */
    id: string;
    title: string;
    startAt: string;   // ISO
    endAt: string;     // ISO
    allDay: boolean;
    /** 이 회차를 끝냈는가 — 여러 날 일정은 한 번 끝낸다(src/lib/todoDone.ts). 위젯은 그 회차의 모든 날에 같은 값을 쓴다 */
    done: boolean;
    color: string;
}

export interface SnapshotChallenge {
    id: string;
    title: string;
    count: number;
    target: number | null;
    doneToday: boolean;
}

export interface SnapshotAnniversary {
    id: string;
    title: string;
    /** AnniversaryIcons 의 키 (star·moon·cake·ring·heart·flower·candle·gift) */
    icon: string;
    month: number;
    day: number;
}

export interface SnapshotProject {
    id: string;
    title: string;
    done: number;
    total: number;
    /** 마감 (YYYY-MM-DD). 없으면 null */
    endAt: string | null;
}

export interface SnapshotTheme {
    family: string;
    mode: "light" | "dark";
    /** 결이 다른 벌 — "vintage" 면 안드로이드 위젯의 Maple 붓이 잎 그림을 빛바랜 톤으로 그린다 */
    variant?: "vintage";
    colors: {
        background: string; surface: string; primary: string; accent: string;
        text: string; textSecondary: string; weekend: string;
    };
}

/**
 * 위젯에서 앱을 열지 않고 할 일을 넣는 데 쓰는 것 (안드로이드 QuickAddActivity).
 * token 은 할 일 넣기만 되는 위젯 전용 열쇠다 (/api/widget/token). 로그인돼 있지 않으면 통째로 없다.
 */
export interface SnapshotQuickAdd {
    api: string;
    token: string;
    categories: { id: string; name: string; color: string }[];
}

export interface WidgetSnapshot {
    version: 2;
    generatedAt: string;
    /** 만든 날 (사용자 시간대). */
    date: string;
    locale: string;
    theme: SnapshotTheme;
    todos: SnapshotTodo[];
    challenges: SnapshotChallenge[];
    anniversaries: SnapshotAnniversary[];
    projects: SnapshotProject[];
    /** 오늘의 메모. 없으면 "" */
    memo: string;
    labels: Record<string, string>;
    quickAdd: SnapshotQuickAdd | null;
}

export interface SnapshotInput {
    todos: TodoType[];
    categories: Pick<CategoryType, "id" | "color" | "name">[];
    challenges: ChallengeType[];
    anniversaries: AnniversaryType[];
    projects: ProjectType[];
    memo: string;
    t: Translations;
    locale: string;
    theme: { family?: string; mode?: string; variant?: string; colors: SnapshotTheme["colors"] };
    /** 위젯 전용 열쇠와 서버 주소. 없으면(로그아웃·웹) 위젯은 누르면 앱을 연다 */
    quickAdd?: { api: string; token: string } | null;
    now?: Date;
}

export function buildWidgetSnapshot(input: SnapshotInput): WidgetSnapshot {
    const { todos, categories, challenges, anniversaries, projects, memo, t, locale, theme, quickAdd } = input;
    const now = input.now ?? new Date();
    const todayKey = localDateKey(now);

    // 이번 달 첫날 ~ 끝날(또는 두 주 뒤 중 늦은 쪽) — 고른 시간대의 날로. 예전엔 기기의 달로 잘라 시간대가 다르면 첫날·끝날 일정이 빠졌다
    const [y, m] = todayKey.split("-").map(Number);
    const monthStart = zonedTime(`${todayKey.slice(0, 7)}-01`);
    const monthEnd = zonedTime(new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10), 23, 59);
    const twoWeeks = new Date(now.getTime() + 14 * 86_400_000);
    const windowEnd = monthEnd > twoWeeks ? monthEnd : twoWeeks;

    const fallbackColor = theme.colors.primary;
    const color = (id?: string | null) => categories.find(c => c.id === id)?.color || fallbackColor;

    const snapTodos: SnapshotTodo[] = expandTodos(todos, monthStart, windowEnd)
        .map(td => ({
            id: td.id.replace(/-rep-\d+$/, ""),
            title: td.title,
            startAt: new Date(td.startAt!).toISOString(),
            endAt: new Date(td.endAt!).toISOString(),
            allDay: !!td.isAllDay,
            done: !!td.isDone,
            color: color(td.categoryId),
        }))
        .sort((a, b) => a.startAt.localeCompare(b.startAt));

    // 끝난 챌린지(마지막 칸이 지남)는 뺀다 — 홈·위젯과 같은 셈(고른 시간대의 오늘, src/lib/challengeDays.ts)
    const snapChallenges: SnapshotChallenge[] = challenges
        .filter(c => (c.targetCount == null || (c.completions?.length ?? 0) < c.targetCount) && !challengeExpired(c, todayKey))
        .map(c => ({
            id: c.id,
            title: c.title,
            count: c.completions?.length ?? 0,
            target: c.targetCount ?? null,
            doneToday: (c.completions ?? []).some(x => utcDayKey(x.targetDate) === todayKey),
        }));

    const snapAnniversaries: SnapshotAnniversary[] = anniversaries.map(a => ({
        id: a.id, title: a.title, icon: a.icon || "star", month: a.month, day: a.day,
    }));

    // 끝난 프로젝트는 빼고, 마감이 가까운 순 (마감 없는 것은 뒤로)
    const snapProjects: SnapshotProject[] = projects
        .filter(p => p.status !== "done")
        .map(p => {
            const tasks = p.tasks ?? [];
            return {
                id: p.id,
                title: p.title,
                done: tasks.filter(x => x.status === "done").length,
                total: tasks.length,
                endAt: p.endAt ? localDateKey(p.endAt) : null,
            };
        })
        .sort((a, b) => (a.endAt ?? "9999").localeCompare(b.endAt ?? "9999"));

    const w = t.homeWidget;
    return {
        version: 2,
        generatedAt: now.toISOString(),
        date: todayKey,
        locale,
        theme: {
            family: theme.family ?? "celestial",
            mode: theme.mode === "dark" ? "dark" : "light",
            ...(theme.variant === "vintage" ? { variant: "vintage" as const } : {}),
            colors: theme.colors,
        },
        todos: snapTodos,
        challenges: snapChallenges,
        anniversaries: snapAnniversaries,
        projects: snapProjects,
        memo: memo ?? "",
        labels: {
            today: t.widget.todayW,
            noTodayTodos: t.home.noTodayTodos,
            noDayTodos: t.home.noDayTodos,
            now: t.widget.now,
            next: t.widget.next,
            nothingNow: t.widget.nothingNow,
            nothingNext: t.widget.nothingNext,
            challenge: t.home.challenge,
            noChallenges: t.home.noChallenges,
            allDay: t.todo.allDay,
            ...w,
        },
        quickAdd: quickAdd && categories.length
            ? { ...quickAdd, categories: categories.map(c => ({ id: c.id, name: c.name, color: c.color || fallbackColor })) }
            : null,
    };
}
