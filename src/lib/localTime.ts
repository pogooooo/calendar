/**
 * 날짜·시각 고르개(DateTimePicker)는 이 기기의 시각을 "YYYY-MM-DDTHH:mm"(날짜만이면 "YYYY-MM-DD") 글자로 주고받고,
 * 서버와 저장소는 ISO 를 쓴다. 그 사이를 오가는 두 함수.
 */
const pad = (n: number) => String(n).padStart(2, "0");

/** ISO → "YYYY-MM-DDTHH:mm" (이 기기 시각). 비었거나 깨졌으면 "" */
export function toLocalInput(iso?: string | number | Date | null): string {
    if (iso === null || iso === undefined || iso === "") return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 고르개 값 → ISO. 날짜만 오면 at("00:00", "23:59" 등)을 붙인다.
 * 빈 값은 null — new Date("") 는 RangeError 를 던져 입력이 먹통이 된다.
 */
export function fromLocalInput(value: string, at = "00:00"): string | null {
    if (!value) return null;
    const d = new Date(value.length <= 10 ? `${value}T${at}` : value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** 오늘(이 기기) "YYYY-MM-DD" */
export function todayKey(now = new Date()): string {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
