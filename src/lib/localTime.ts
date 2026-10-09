/**
 * 날짜·시각 고르개(DateTimePicker)는 고른 시간대의 시각을 "YYYY-MM-DDTHH:mm"(날짜만이면 "YYYY-MM-DD") 글자로 주고받고,
 * 서버와 저장소는 ISO 를 쓴다. 그 사이를 오가는 두 함수.
 * 예전엔 이 기기 시각으로 오갔다 — 기기와 고른 시간대가 다르면 고르개가 홈·달력과 다른 시각(때로 다른 날)을 보이고 그 시각으로 저장했다.
 */
import { localDateKey, wallTime, zonedTime, sameAsDevice } from "@/lib/dateKey";

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO → "YYYY-MM-DDTHH:mm" (고른 시간대의 시각). 비었거나 깨졌으면 "" */
export function toLocalInput(iso?: string | number | Date | null): string {
    if (iso === null || iso === undefined || iso === "") return "";
    const w = wallTime(new Date(iso));
    if (!w) return "";
    return `${w.year}-${pad(w.month)}-${pad(w.day)}T${pad(w.hour)}:${pad(w.minute)}`;
}

/**
 * 고르개 값(고른 시간대의 시각) → ISO. 날짜만 오면 at("00:00", "23:59" 등)을 붙인다.
 * 빈 값은 null — new Date("") 는 RangeError 를 던져 입력이 먹통이 된다.
 */
export function fromLocalInput(value: string, at = "00:00"): string | null {
    if (!value) return null;
    const text = value.length <= 10 ? `${value}T${at}` : value;
    const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(text);
    // 기기와 같은 시간대면 예전처럼 이 기기 시각으로 읽는다 (같은 셈이다)
    const d = m && !sameAsDevice() ? zonedTime(m[1], Number(m[2]), Number(m[3])) : new Date(text);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** 오늘(고른 시간대) "YYYY-MM-DD" — 고르개 값과 같은 시간대 */
export function todayKey(now = new Date()): string {
    return localDateKey(now);
}
