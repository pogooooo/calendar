package com.cronos.todoapp.widget

import android.content.Context

/**
 * 위젯 하나하나의 설정 — 놓을 때 WidgetConfigActivity 가 묻고, 길게 눌러 다시 열 수 있다.
 *   alpha: 바탕 불투명도 20..100 (%)
 *   mode: "app"(앱 테마 따라감) | "light" | "dark"
 *   offset: 보는 날을 오늘에서 며칠 옮겼나 (화살표를 눌러 옮긴다). 날이 바뀌면 0 으로 돌아온다
 */
object WidgetPrefs {
    private const val FILE = "cronos_widgets"
    const val DEFAULT_ALPHA = 88

    private fun prefs(context: Context) = context.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun alpha(context: Context, id: Int): Int = prefs(context).getInt("alpha_$id", DEFAULT_ALPHA).coerceIn(20, 100)
    fun mode(context: Context, id: Int): String = prefs(context).getString("mode_$id", "app") ?: "app"
    /** Independent of app motion and theme brightness; missing preferences migrate to the readable default. */
    fun style(context: Context, id: Int): String = normalizeStyle(prefs(context).getString("style_$id", "simple"))
    fun normalizeStyle(value: String?): String = if (value == "ornate") "ornate" else "simple"

    /**
     * 옮겨 둔 날수. 옮긴 날(base)이 오늘이 아니면 0 — 어제 "내일" 을 보다가 둔 위젯이
     * 오늘도 하루 앞을 가리키고 있으면 무엇을 보고 있는지 알 수 없다.
     */
    fun offset(context: Context, id: Int): Int {
        val p = prefs(context)
        if (p.getLong("offbase_$id", 0L) != todayBase()) return 0
        return p.getInt("offset_$id", 0).coerceIn(-MAX_OFFSET, MAX_OFFSET)
    }

    fun setOffset(context: Context, id: Int, value: Int) {
        prefs(context).edit()
            .putInt("offset_$id", value.coerceIn(-MAX_OFFSET, MAX_OFFSET))
            .putLong("offbase_$id", todayBase())
            .apply()
    }

    /** 스냅샷이 이 달 + 2주까지만 담으므로 그 밖으로는 넘기지 않는다 */
    const val MAX_OFFSET = 31

    /** 기기 시간대의 날 번호. UTC 로 나누면 한국에서는 아침 9시에 날이 바뀌어, 자정이 지나도 옮긴 날이 그대로 남았다 */
    private fun todayBase(): Long {
        val now = System.currentTimeMillis()
        return (now + java.util.TimeZone.getDefault().getOffset(now)) / 86_400_000L
    }

    fun save(context: Context, id: Int, alpha: Int, mode: String, style: String = "simple") {
        prefs(context).edit().putInt("alpha_$id", alpha.coerceIn(20, 100)).putString("mode_$id", mode)
            .putString("style_$id", normalizeStyle(style)).apply()
    }

    fun remove(context: Context, ids: IntArray) {
        val e = prefs(context).edit()
        ids.forEach { e.remove("alpha_$it").remove("mode_$it").remove("style_$it").remove("offset_$it").remove("offbase_$it") }
        e.apply()
    }
}
