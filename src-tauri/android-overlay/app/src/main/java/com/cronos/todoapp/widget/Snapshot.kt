package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Color
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * 앱(JS)이 써 둔 widget-snapshot.json (src/lib/widgetSnapshot.ts 의 WidgetSnapshot v2).
 *
 * 시각 판정("지금/다음", D-day, 오늘)은 여기서 그릴 때마다 한다 — 위젯은 자정과 일정 경계에
 * 스스로 다시 그리므로, 앱이 며칠 안 켜져도 날짜가 넘어간다.
 */
class Snapshot private constructor(
    val locale: Locale,
    val theme: ThemeSpec?,
    val todos: List<Todo>,
    val challenges: List<Challenge>,
    val anniversaries: List<Anniversary>,
    val projects: List<Project>,
    val memo: String,
    private val labels: JSONObject,
) {
    class Todo(
        val id: String, val title: String, val start: Long, val end: Long,
        val allDay: Boolean, val done: Boolean, val color: Int,
    ) {
        /** 사용자 시간대의 날짜 키(yyyy-MM-dd)로 그날을 지나는가 */
        fun spans(key: String): Boolean = dayKey(start) <= key && key <= dayKey(end)
        fun timeRange(): String = "${hhmm(start)}–${hhmm(end)}"
    }

    class Challenge(val id: String, val title: String, val count: Int, val target: Int?, val doneToday: Boolean)

    class Anniversary(val id: String, val title: String, val icon: String, val month: Int, val day: Int) {
        /** 다음 돌아오는 날(오늘 포함)까지 며칠 남았나. 0 이면 오늘 */
        fun daysUntilNext(now: Long): Int {
            val today = startOfDay(now)
            val thisYear = atMonthDay(today, 0)
            val next = if (thisYear >= today) thisYear else atMonthDay(today, 1)
            return ((next - today) / DAY_MS).toInt()
        }
        /** 가장 최근에 지난 날로부터 며칠 지났나 (오늘이면 0) */
        fun daysSinceLast(now: Long): Int {
            val today = startOfDay(now)
            val thisYear = atMonthDay(today, 0)
            val last = if (thisYear <= today) thisYear else atMonthDay(today, -1)
            return ((today - last) / DAY_MS).toInt()
        }
        fun nextDate(now: Long): Long {
            val today = startOfDay(now)
            val thisYear = atMonthDay(today, 0)
            return if (thisYear >= today) thisYear else atMonthDay(today, 1)
        }
        private fun atMonthDay(base: Long, yearOffset: Int): Long = Calendar.getInstance().apply {
            timeInMillis = base
            add(Calendar.YEAR, yearOffset)
            // 2월 29일 같은 날은 그 해에 없으면 마지막 날로
            set(Calendar.DAY_OF_MONTH, 1)
            set(Calendar.MONTH, month - 1)
            set(Calendar.DAY_OF_MONTH, minOf(day, getActualMaximum(Calendar.DAY_OF_MONTH)))
        }.timeInMillis
    }

    class Project(val id: String, val title: String, val done: Int, val total: Int, val endKey: String?) {
        /** 마감까지 며칠 (음수면 지남). 마감 없으면 null */
        fun daysLeft(now: Long): Int? {
            val key = endKey ?: return null
            val end = parseDayKey(key) ?: return null
            return ((end - startOfDay(now)) / DAY_MS).toInt()
        }
    }

    class ThemeSpec(val family: String, val mode: String, val colors: Map<String, Int>)

    fun label(name: String, fallback: String = name): String = labels.optString(name, fallback)

    /** "{n}분 남음" 같은 틀에 값을 채운다 */
    fun fmt(name: String, vararg pairs: Pair<String, Any>): String {
        var s = label(name)
        for ((k, v) in pairs) s = s.replace("{$k}", v.toString())
        return s
    }

    fun todayKey(now: Long = System.currentTimeMillis()): String = dayKey(now)

    /** 스냅샷의 dateFmt(SimpleDateFormat 패턴)로 날짜를 찍는다 */
    fun formatDate(ms: Long, patternLabel: String = "dateFmt", fallbackPattern: String = "M/d EEE"): String {
        val pattern = labels.optString(patternLabel, fallbackPattern)
        return try { SimpleDateFormat(pattern, locale).format(Date(ms)) } catch (e: Throwable) { SimpleDateFormat(fallbackPattern, locale).format(Date(ms)) }
    }

    companion object {
        const val DAY_MS = 24L * 60 * 60 * 1000
        private val ISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        private val DAY = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        private val HHMM = SimpleDateFormat("HH:mm", Locale.US)

        fun dayKey(ms: Long): String = DAY.format(Date(ms))
        fun hhmm(ms: Long): String = HHMM.format(Date(ms))
        fun parseDayKey(key: String): Long? = try { DAY.parse(key)?.time } catch (e: Throwable) { null }
        fun startOfDay(ms: Long): Long = Calendar.getInstance().apply {
            timeInMillis = ms
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        fun load(context: Context): Snapshot? {
            // Rust 의 app_config_dir 은 안드로이드에서 dataDir 이다 (tauri PathPlugin.getConfigDir)
            val file = File(context.applicationInfo.dataDir, CronosWidgetProvider.SNAPSHOT_FILE)
            if (!file.exists()) return null
            return try { parse(file.readText()) } catch (e: Throwable) { null }
        }

        fun parse(text: String): Snapshot {
            val root = JSONObject(text)
            val localeTag = root.optString("locale", "ko")
            val locale = if (localeTag.startsWith("en")) Locale.ENGLISH else Locale.KOREAN

            val theme = root.optJSONObject("theme")?.let { t ->
                val colors = HashMap<String, Int>()
                t.optJSONObject("colors")?.let { c ->
                    for (key in c.keys()) parseColor(c.optString(key))?.let { colors[key] = it }
                }
                ThemeSpec(t.optString("family", "celestial"), t.optString("mode", "light"), colors)
            }

            val todos = root.optJSONArray("todos").map { o ->
                Todo(
                    o.optString("id"),
                    o.getString("title"),
                    ISO.parse(o.getString("startAt"))?.time ?: 0L,
                    ISO.parse(o.getString("endAt"))?.time ?: 0L,
                    o.optBoolean("allDay", false),
                    o.optBoolean("done", false),
                    parseColor(o.optString("color")) ?: 0xFFD4AF37.toInt(),
                )
            }
            val challenges = root.optJSONArray("challenges").map { o ->
                Challenge(o.optString("id"), o.getString("title"), o.optInt("count", 0),
                    if (o.isNull("target")) null else o.optInt("target"), o.optBoolean("doneToday", false))
            }
            val anniversaries = root.optJSONArray("anniversaries").map { o ->
                Anniversary(o.optString("id"), o.getString("title"), o.optString("icon", "star"), o.optInt("month", 1), o.optInt("day", 1))
            }
            val projects = root.optJSONArray("projects").map { o ->
                Project(o.optString("id"), o.getString("title"), o.optInt("done", 0), o.optInt("total", 0),
                    if (o.isNull("endAt")) null else o.optString("endAt"))
            }
            return Snapshot(locale, theme, todos, challenges, anniversaries, projects, root.optString("memo", ""), root.optJSONObject("labels") ?: JSONObject())
        }

        private fun <T> JSONArray?.map(f: (JSONObject) -> T): List<T> {
            if (this == null) return emptyList()
            val out = ArrayList<T>(length())
            for (i in 0 until length()) {
                val o = optJSONObject(i) ?: continue
                try { out += f(o) } catch (e: Throwable) { /* 한 줄이 깨졌다고 다 버리지 않는다 */ }
            }
            return out
        }

        fun parseColor(s: String?): Int? {
            if (s.isNullOrBlank()) return null
            return try { Color.parseColor(s.trim()) } catch (e: Throwable) { null }
        }
    }
}
